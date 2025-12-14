// src/components/StudyRoom.tsx
import { BattleZonePanel } from "./BattleZonePanel";
import { WebcamGrid } from "./WebcamGrid";
import { RightPanel } from "./RightPanel";
import exitImg from "../assets/exit.png";
import logo from "../assets/logo.png";
import bg from "../assets/bg.png";
import { AiChatPage, ChatMessage } from "./AiChatPage";
import { useRoom } from './RoomContext';
import { usePage } from './PageContext';
import { useState, useEffect, useRef } from "react";
import { BattleRequestPopup } from "./BattleRequestPopup";
import { BattleSelectPokemonPopup } from "./BattleSelectPokemonPopup";
import { useUser } from './UserContext';
import SimpleSFUClient from "../sfu/SimpleSFUClient.js";
import { useBattleSocket } from "../hooks/useBattleSocket";

export default function StudyRoom() {
  const { roomData, setRoomData } = useRoom();
  const { setCurrentPage } = usePage();
  const { user } = useUser();
  const chatStorageKey = roomData?.room_id ? `aiChat:${roomData.room_id}` : "aiChat:global";

  // 배틀 소켓 연결
  const {
    sendBattleRequest,
    acceptBattle,
    rejectBattle,
    selectPokemon,
    enterBattle,
    incomingRequest,
    battleAccepted,
    opponentPokemon, // create battle in useEffect
    opponentReady,
    currentOpponentId, //  create battle in useEffect
    battleCreatedData,
    notifyBattleCreated
  } = useBattleSocket(roomData?.room_id?.toString() || null, user?.userId || null);

  const handleLeave = async () => {
    if (!roomData?.room_id || !user?.userId) {
      console.error('방 ID 또는 사용자 ID가 없습니다.');
      setCurrentPage('home');
      return;
    }

    try {
      const response = await fetch(`/api/rooms/out?room_id=${roomData.room_id}&user_id=${user.userId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('방 나가기 실패:', data.detail);
        alert(data.detail || '방 나가기에 실패했습니다.');
        return;
      }

      console.log('방 나가기 성공:', data.message);

      // RoomContext 초기화
      setRoomData(null);

      // 홈으로 이동
      setCurrentPage('home');
      // 채팅 기록도 초기화
      setAiMessages([]);
      sessionStorage.removeItem(chatStorageKey);
    } catch (error) {
      console.error('방 나가기 오류:', error);
      alert('방 나가기 중 오류가 발생했습니다.');

      // 오류가 발생해도 홈으로 이동
      setRoomData(null);
      setCurrentPage('home');
    }
  };

  const [showRequestPopup, setShowRequestPopup] = useState(false);
  const [showSelectPopup, setShowSelectPopup] = useState(false);
  const [requesterName, setRequesterName] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [drowsinessCount, setDrowsinessCount] = useState(0);
  const [currentState, setCurrentState] = useState<string>("Normal");
  const [lastSleepyDetection, setLastSleepyDetection] = useState<number>(0);
  // const [inBattle, setInBattle] = useState(false);
  const [isme, setIsme] = useState("");
  const [mySelectedPokemon, setMySelectedPokemon] = useState<any>(null);
  const [isRequester, setIsRequester] = useState(false);

  // video & audio 통신
  const clientRef = useRef<SimpleSFUClient>();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream; username: string }[]>([]);
  // const [peers, setPeers] = useState([]);
  const [consumers, setConsumers] = useState([]);

  // 🎯 슬라이딩 윈도우 버퍼 (최근 10개 감지 결과 저장)
  const [detectionWindow, setDetectionWindow] = useState<string[]>([]);

  // 경고 메시지 지연 표시를 위한 상태
  const [showWarningMessage, setShowWarningMessage] = useState(false);
  const [warningTimer, setWarningTimer] = useState<number | null>(null);

  // pokemon temp add

  const [myHp, setMyHp] = useState(100);
  const [opponentHp, setOpponentHp] = useState(100);
  const [battleResult, setBattleResult] = useState<"win" | "lose" | null>(null);
  // 배틀 데이터
  const [battleData, setBattleData] = useState<any>(null);
  const [myMoves, setMyMoves] = useState<any[]>([]);
    
  // 배틀 데이터 로드
  useEffect(() => {
      const storedData = sessionStorage.getItem('battleData');
      if (storedData) {
          const data = JSON.parse(storedData);
          console.log('[Battle Room] Loaded battle data:', data);
          setBattleData(data);
          setMyMoves(data.myMoves || []);
      }
  }, []);

  useEffect(() => {
        if (battleResult) return;
        if (myHp <= 0) {
            setBattleResult("lose");
        } else if (opponentHp <= 0) {
            setBattleResult("win");
        }
  }, [myHp, opponentHp, battleResult]);

  useEffect(() => {
      if (!battleResult) return;
      const timer = setTimeout(() => setCurrentPage('studyroom'), 5000);
      return () => clearTimeout(timer);
  }, [battleResult, setCurrentPage]);

  // 👉 배틀 생성 완료(WebSocket 수신) 시 battleData 업데이트
  useEffect(() => {
    if (!battleCreatedData) return;

    console.log("[Battle] Received battleCreatedData:", battleCreatedData);

    // 1) sessionStorage 저장
    sessionStorage.setItem('battleData', JSON.stringify(battleCreatedData));

    // 2) StudyRoom의 battleData 상태 업데이트
    setBattleData(battleCreatedData);

  }, [battleCreatedData]);

  // pokemon temp add end


  // currentState가 Normal로 돌아왔을 때 3초 후에 경고 메시지 숨기기
  useEffect(() => {
    if (drowsinessCount >= 1 && drowsinessCount <= 5) {
      if (currentState !== "Normal") {
        // 경고 상태: 즉시 경고 메시지 표시
        setShowWarningMessage(true);
        if (warningTimer !== null) {
          clearTimeout(warningTimer);
          setWarningTimer(null);
        }
      } else {
        // 정상 상태로 돌아옴: 3초 후에 경고 메시지 숨기기
        const timer = window.setTimeout(() => {
          setShowWarningMessage(false);
        }, 3000);
        setWarningTimer(timer);

        return () => {
          clearTimeout(timer);
        };
      }
    } else if (drowsinessCount === 0) {
      // 졸음 횟수가 0이면 경고 메시지 즉시 숨기기
      setShowWarningMessage(false);
      if (warningTimer !== null) {
        clearTimeout(warningTimer);
        setWarningTimer(null);
      }
    }
  }, [currentState, drowsinessCount]);

  // 이거 나중에 주석 풀어야함. 직접적으로 사용하는 handleDrosinessDetected임
  // const handleDrowsinessDetected = (result: string) => {
  //   setCurrentState(result);
  //   console.log(`[졸음 감지] 현재 상태: ${result}`);

  //   // 🎯 윈도우에 새 결과 추가 (최대 10개 유지)
  //   setDetectionWindow(prev => {
  //     const newWindow = [...prev, result].slice(-10);

  //     console.log(`[윈도우] 현재 버퍼: [${newWindow.join(', ')}] (${newWindow.length}/10)`);

  //     // 윈도우가 10개 채워졌을 때만 과반수 체크
  //     if (newWindow.length === 10) {
  //       const sleepyCount = newWindow.filter(r => r === "Sleepy").length;
  //       const yawnCount = newWindow.filter(r => r === "Yawn").length;
  //       const normalCount = newWindow.filter(r => r === "Normal").length;

  //       console.log(`[윈도우] 통계 - Sleepy: ${sleepyCount}, Yawn: ${yawnCount}, Normal: ${normalCount}`);

  //       // 과반수(6개 이상)가 Sleepy이고, 마지막 카운트로부터 충분한 시간이 지났으면
  //       if (sleepyCount >= 6) {
  //         const now = Date.now();
  //         if (now - lastSleepyDetection > 3000) {
  //           // 백엔드 API 호출하여 졸음 로그 저장
  //           if (!user?.userId) {
  //             console.error('[졸음 감지] 사용자 ID가 없습니다.');
  //             return newWindow;
  //           }

  //           fetch(`/api/drowsiness/log`, {
  //             method: 'POST',
  //             headers: { 'Content-Type': 'application/json' },
  //             body: JSON.stringify({
  //               user_id: user.userId,
  //               event_type: 'drowsy'
  //             })
  //           })
  //             .then(res => res.json())
  //             .then(data => {
  //               console.log(`[졸음 감지] ⚠️ 졸음 로그 저장 완료!`, data);
  //             })
  //             .catch(err => {
  //               console.error('[졸음 감지] API 호출 실패:', err);
  //             });
  //           setDrowsinessCount(prev => prev + 1);
  //           setLastSleepyDetection(now);
  //           console.log(`[졸음 감지] ⚠️ 졸음 횟수 증가! (윈도우 내 Sleepy: ${sleepyCount}/10)`);

  //           // 🎯 윈도우 초기화
  //           console.log("[졸음 감지] 🔄 졸음 카운트 후 윈도우 초기화");
  //           return [];
  //         } else {
  //           console.log(`[졸음 감지] ⏸️ 쿨다운 중 (${Math.round((3000 - (now - lastSleepyDetection)) / 1000)}초 남음)`);
  //         }
  //       } else {
  //         console.log(`[졸음 감지] ✅ 과반수 미달 (Sleepy ${sleepyCount}/10 < 6)`);
  //       }
  //     } else {
  //       console.log(`[윈도우] ⏳ 버퍼 채우는 중... (${newWindow.length}/10)`);
  //     }

  //     return newWindow;
  //   });
  // };

  // 이건 test용도 handleDrowsinessDetected
  const handleDrowsinessDetected = (result: string) => {
  };

  useEffect(() => {
    const client = new SimpleSFUClient({
      username: user.nickname, // nickname (일단은 로그인 아이디)
      videoContainer: videoContainerRef.current,
      // hark,
      // onBattleRequest: handleBattleRequest,
      // onDrowsinessDetected: handleDrowsinessDetected
    });

    clientRef.current = client;
    // console.log(client.localUUID);

    client.on("onConnected", () => {
      console.log("Connected to SFU server!");
      client.connect();
    });

    client.on("onUUIDAssigned", (uuid: any) => {
      // console.log("UUID assigned:", uuid);
      setIsme(uuid);   // React state 업데이트
    });

    // client.on("onPeers", (peers : any) => {
    //   setPeers(peers);
    // })

    client.on("onConsumers", (consumers: any) => {
      setConsumers(consumers);
    })

    // 원격 스트림 이벤트
    // _ -> consumerID관련 내용인데, server.js 내부에서 자체적으로 uuid를 이용해서 만듦
    // peer - client 접속자
    // produecer - data(video, audio stream) 제공 client
    // consumer - data 소비자
    // client.on("onRemoteTrack", ({ stream, isme, consumerId }) => {
    //   if (!clientRef.current.localUUID) return;
    //   client.handleRemoteTrack(stream, isme, consumerId );
    //   // console.log("연결 직후 UUID:", clientRef.current.localUUID); // ← 여기 확인
    //   // setIsme(clientRef.current.localUUID); // 확인은 useEffect 위에서
    // });

    client.on("onRemoteTrack", ({ id, stream, username }) => {
      setRemoteStreams(prev => {
        // 이미 추가된 stream이면 무시
        if (prev.some(s => s.id === id)) return prev;
        return [...prev, { id, stream, username }]; // append
      });
    });


  }, []);

  // useEffect(() => {
  //   console.log("peers updated:", peers);
  // }, [peers])

  useEffect(() => {
    console.log("consumers updated:", consumers);
  }, [consumers])

  useEffect(() => {
    console.log("isme updated:", isme);
  }, [isme]);

  useEffect(() => {
    console.log("remotestream updated:", remoteStreams);
  }, [remoteStreams]);

  const handleBattleRequest = (targetId: string) => {
    setIsRequester(true);
    // WebSocket으로 배틀 신청
    if (user?.nickname) {
      sendBattleRequest(targetId, user.nickname);
      console.log(`[Battle] Sent battle request to user ${targetId}`);
    }
  };

  const handleAcceptBattle = () => {
    setShowRequestPopup(false);
    setShowSelectPopup(true);
    // WebSocket으로 수락 알림
    if (incomingRequest && user?.nickname) {
      acceptBattle(incomingRequest.requester_id, user.nickname);
      console.log('[Battle] Accepted battle from:', incomingRequest.requester_id);
    }
  };

  const handleRejectBattle = () => {
    setShowRequestPopup(false);
    // WebSocket으로 거절 알림
    if (incomingRequest) {
      rejectBattle(incomingRequest.requester_id);
      console.log('[Battle] Rejected battle from:', incomingRequest.requester_id);
    }
  };

  const handleEnterBattle = (pokemon: any) => {
    console.log('[Battle] handleEnterBattle called with:', pokemon);
    setMySelectedPokemon(pokemon);
    // 상대방에게 포켓몬 선택 알림
    if (currentOpponentId) {
      selectPokemon(currentOpponentId, pokemon);
    }
    setShowSelectPopup(false);
    console.log(`[Battle] Selected Pokemon:`, pokemon);
  };

  // 배틀 신청 받았을 때 팝업 표시
  useEffect(() => {
    if (incomingRequest) {
      setRequesterName(incomingRequest.requester_nickname);
      setShowRequestPopup(true);
      console.log('[Battle] Incoming request from:', incomingRequest.requester_nickname);
    }
  }, [incomingRequest]);

  // 배틀 수락되었을 때 포켓몬 선택 팝업 표시
  useEffect(() => {
    if (battleAccepted) {
      setShowSelectPopup(true);
      console.log('[Battle] Battle accepted, showing Pokemon selection');
    }
  }, [battleAccepted]);
  
  // 양쪽이 포켓몬 선택하면 배틀 생성 (신청자만)
  useEffect(() => {
    if (opponentPokemon && mySelectedPokemon && currentOpponentId && isRequester) {
      console.log('[Battle] Both selected Pokemon, creating battle...', {
        myPokemon: mySelectedPokemon,
        opponentPokemon: opponentPokemon
      });

      createBattle(mySelectedPokemon, opponentPokemon);
    }
    // opponentPokemon, currentOpponentId는 webSocket으로 관리, mySelectedPokemon, isRequester은 클라이언트 단에서 작동하는 거 같은데.
  }, [opponentPokemon, mySelectedPokemon, currentOpponentId, isRequester]);

  const createBattle = async (myPokemon: any, opponentPokemon: any) => {
    try {
      console.log('[Battle] Creating battle API call...');
      console.log('[Battle] My Pokemon:', myPokemon);
      console.log('[Battle] Opponent Pokemon:', opponentPokemon);
      console.log('[Battle] Sending IDs:', {
        player_a_user_pokemon_id: myPokemon.id,
        player_b_user_pokemon_id: opponentPokemon.id
      });
      const response = await fetch('http://localhost:8000/api/battle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_a_user_pokemon_id: myPokemon.id,
          player_b_user_pokemon_id: opponentPokemon.id
        })
      });
      if (!response.ok) {
        const error = await response.json();
        alert('[Battle] API Error Response:');
        alert('[Battle] Error detail:');
        console.error('[Battle] API Error Response:', error);
        console.error('[Battle] Error detail:', JSON.stringify(error, null, 2));
        throw new Error(JSON.stringify(error.detail || error));
      }
      const battleData = await response.json();
      alert('[Battle] Battle created successfully:');
      console.log('[Battle] Battle created successfully:', battleData);
      sessionStorage.setItem('battleData', JSON.stringify({
        battleId: battleData.battle_id,
        myPokemon: battleData.player_a_pokemon,
        opponentPokemon: battleData.player_b_pokemon,
        myMoves: battleData.player_a_moves,
        opponentMoves: battleData.player_b_moves,
        myUserPokemonId: battleData.player_a_user_pokemon_id,
        opponentUserPokemonId: battleData.player_b_user_pokemon_id,
        myUserId: user?.userId,
        opponentUserId: currentOpponentId
      }));

      // WebSocket으로 수락자에게 알림
      if (currentOpponentId) {
        notifyBattleCreated(currentOpponentId, {
          battleId: battleData.battle_id,
          myPokemon: battleData.player_b_pokemon,
          opponentPokemon: battleData.player_a_pokemon,
          myMoves: battleData.player_b_moves,
          opponentMoves: battleData.player_a_moves,
          myUserPokemonId: battleData.player_b_user_pokemon_id,
          opponentUserPokemonId: battleData.player_a_user_pokemon_id,
          myUserId: currentOpponentId,
          opponentUserId: user?.userId
        });
      }}
      catch(error: any) {
        console.error('[Battle] Failed to create battle:', error);
        alert(`배틀 생성 실패: ${error.message}`);
    }
  };

  // AI 채팅 저장/로드 (스터디룸 머무는 동안 유지, room_id별로 저장)
  useEffect(() => {
    const stored = sessionStorage.getItem(chatStorageKey);
    if (stored) {
      try {
        const parsed: ChatMessage[] = JSON.parse(stored).map((m: any) => ({
          ...m,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        }));
        setAiMessages(parsed);
        return;
      } catch (e) {
        console.error("AI 채팅 기록 로드 실패:", e);
      }
    }
    const greeting: ChatMessage = {
      id: Date.now().toString(),
      content: "안녕하세요! 스터디몬 AI입니다. 무엇을 도와드릴까요?",
      sender: "ai",
      timestamp: new Date(),
    };
    setAiMessages([greeting]);
    sessionStorage.setItem(chatStorageKey, JSON.stringify([greeting]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatStorageKey]);

  const updateAiMessages = (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
    setAiMessages((prev) => {
      const next = updater(prev);
      sessionStorage.setItem(chatStorageKey, JSON.stringify(next));
      return next;
    });
  };

  const handleSendAiMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `${Date.now()}`,
      content: text,
      sender: "user",
      timestamp: new Date(),
    };
    updateAiMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch("/api/ai-chat/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          // 🔹 user_id 를 문자열로 변환해서 보냄
          user_id: user?.userId != null ? String(user.userId) : null,
        }),
      });

      const data = await response.json();
      const replyText = response.ok ? data.reply || "답변을 받아왔어요." : (data.detail || "답변을 받아오지 못했습니다.");
      const aiMsg: ChatMessage = {
        id: `${Date.now() + 1}`,
        content: replyText,
        sender: "ai",
        timestamp: new Date(),
      };
      updateAiMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI 메시지 전송 오류:", error);
      const aiMsg: ChatMessage = {
        id: `${Date.now() + 1}`,
        content: "죄송해요, 지금은 답변을 가져올 수 없어요.",
        sender: "ai",
        timestamp: new Date(),
      };
      updateAiMessages((prev) => [...prev, aiMsg]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col">
      <header
        className="w-full bg-white/80 backdrop-blur-sm border-b border-blue-100"
        style={{ backgroundImage: `url(${bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-12" />
          <img src={logo} alt="STUDYMON" className="h-12 w-auto drop-shadow" />
          <button onClick={handleLeave} className="flex justify-center">
            <img
              src={exitImg}
              alt="퇴장하기"
              className="h-12 w-auto hover:scale-[1.02] transition-transform"
            />
          </button>
        </div>
      </header>

      <main className="w-full px-2 pb-0 flex-1 pt-2">
        <div className="w-full rounded-2xl bg-white/85 backdrop-blur-sm border border-blue-100 shadow-lg p-3 h-full flex flex-col">
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-170px)]">
            {/* 왼쪽 패널: 배틀존 */}
            <div className="col-span-3">
              <BattleZonePanel
                 battleData={battleData}
                  myHp={myHp}
                  opponentHp={opponentHp}
                  onHpChange={(newMyHp, newOpponentHp) => {
                      setMyHp(newMyHp);
                      setOpponentHp(newOpponentHp);
                  }}
                  onBattleEnd={(result) => {
                      setBattleResult(result);
                  }}
              />
            </div>

            {/* 중앙: 웹캠 + 상태 */}
            <div className="col-span-6 flex flex-col gap-3 min-h-0 h-full">
              <WebcamGrid username={user.nickname} isme={isme} remoteStreams={remoteStreams} onBattleRequest={handleBattleRequest} onDrowsinessDetected={handleDrowsinessDetected} />

              {/* 졸음 감지 상태 표시 - 하단까지 확장 */}
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-blue-100 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-1000 text-3xl">😴 졸음 감지 모니터링</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">누적 졸음 횟수:</span>
                    <span className={`text-xl font-bold ${drowsinessCount > 5 ? 'text-red-500' : 'text-blue-500'}`}>
                      {drowsinessCount}회
                    </span>
                  </div>
                </div>

                <br></br>
                {/* 현재 상태 표시 */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50">
                  <span className="text-sm font-medium text-gray-600">현재 상태:</span>
                  <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${currentState === "Normal"
                    ? "bg-green-100 text-green-700"
                    : currentState === "Yawn"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                    {currentState === "Normal" && "😊 정상"}
                    {currentState === "Yawn" && "🥱 하품"}
                    {currentState === "Sleepy" && "😴 졸림 감지!"}
                  </div>
                </div>

                {/* 졸음 횟수에 따른 동적 메시지 - 3초 지연 적용 */}
                {(drowsinessCount === 0 || (currentState === "Normal" && !showWarningMessage)) && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-blue-700 font-bold whitespace-nowrap">스터디몬이 지켜보고 있어요! 오늘도 파이팅! 🔥</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-blue-600 text-xs font-semibold whitespace-nowrap">열심히 공부 중!</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-white bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {drowsinessCount >= 1 && drowsinessCount <= 5 && (currentState !== "Normal" || showWarningMessage) && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-orange-700 font-bold whitespace-nowrap animate-pulse">⚠️ 졸음 감지! 잠을 깨세요!</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-orange-600 text-xs font-semibold whitespace-nowrap">스트레칭 권장</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-orange-200 bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {drowsinessCount >= 6 && currentState !== "Normal" && (
                  <div className="flex items-center justify-between gap-2 mt-2">
                    <p className="text-sm text-red-700 font-bold whitespace-nowrap animate-bounce">🚨 졸음 심각! 즉시 휴식!</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-red-600 text-xs font-semibold whitespace-nowrap">공부 중단 권장</span>
                      <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-red-200 bg-white shadow-sm">
                        <img
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
                          alt="포켓몬"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    {/* 경고음 재생 */}
                    <audio autoPlay loop>
                      <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OScTgwOUKXh8LdjHAU2kdXzzn0vBSF1xe/glEILElyx6OyrWBUIRJzd8sFuIwUrgc7y2Yk2CBhpvfDknE4MDlCl4fC3YxwFNpHV8859LwUhdc" type="audio/wav" />
                    </audio>
                  </div>
                )}
              </div>

            </div>

            {/* 오른쪽: 채팅 패널 */}
            <div className="col-span-3 flex flex-col gap-3 min-h-0">
              <div className="flex-1 min-h-0 h-full">
                <RightPanel onOpenAiChat={() => setShowAiChat(true)} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showAiChat && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <AiChatPage
              variant="modal"
              onClose={() => setShowAiChat(false)}
              messages={aiMessages}
              onSend={handleSendAiMessage}
            />
          </div>
        </div>
      )}

      {/* 배틀 신청 팝업 (상대방이 나에게 신청했을 때) */}
      {showRequestPopup && (
        <BattleRequestPopup
          requesterName={requesterName}
          onAccept={handleAcceptBattle}
          onReject={handleRejectBattle}
        />
      )}

      {/* 포켓몬 선택 팝업 (수락 후 내 포켓몬 선택) */}
      {showSelectPopup && (
        <BattleSelectPokemonPopup
          onEnterBattle={handleEnterBattle}
          onCancel={() => setShowSelectPopup(false)}
        />
      )}
    </div>
  );
}
