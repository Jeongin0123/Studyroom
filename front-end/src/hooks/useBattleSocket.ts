import { useEffect, useRef, useState } from 'react';

interface BattleRequest {
    requester_id: number;
    requester_nickname: string;
}

interface PokemonData {
    user_pokemon_id: number;
    pokemon_id: number;
    nickname: string;
    level: number;
    exp: number;
}

export const useBattleSocket = (roomId: string | null, userId: number | null) => {
    const [incomingRequest, setIncomingRequest] = useState<BattleRequest | null>(null);
    const [battleAccepted, setBattleAccepted] = useState(false);
    const [opponentPokemon, setOpponentPokemon] = useState<PokemonData | null>(null);
    const [opponentReady, setOpponentReady] = useState(false);
    const [currentOpponentId, setCurrentOpponentId] = useState<number | null>(null);
    const [battleCreatedData, setBattleCreatedData] = useState<any>(null);

    const wsRef = useRef<WebSocket | null>(null);
    const initializedRef = useRef(false);

    // 웹 소켓 세팅
    useEffect(() => {
        if (initializedRef.current) return; // 이미 초기화 했으면 재생성 금지
        if (!roomId || !userId) {
            console.log('[Battle Socket] ⚠️ Missing roomId or userId:', { roomId, userId });
            return;
        }

        // WebSocket 연결
        const wsUrl = `ws://localhost:8000/ws/battle/${roomId}/${userId}`;
        console.log('[Battle Socket] 🔌 Connecting to:', wsUrl);
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[Battle Socket] ✅ Connected successfully');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            // 이 부분(밑의 console.log)에서 처음에는 배틀에 대한 부분을 받아오다가, 다시 null 처리가 되면서 값이 날아가버림
            // 이 부분에 data가 배틀 신청을 한 후 왜 다시 update가 되면서, reset되는지 확인할 필요가 있음
            // 아마 클라이언트 쪽에서 데이터를 처리 하는 부분을 확인해봐야할 듯함
            console.log('[Battle Socket] 📨 Received message:', data);


            switch (data.type) {
                case 'battle_request':
                    console.log('[Battle Socket] 🎮 Battle request from:', data.requester_nickname);
                    setIncomingRequest({
                        requester_id: data.requester_id,
                        requester_nickname: data.requester_nickname
                    });
                    setCurrentOpponentId(data.requester_id);
                    break;

                // 배틀 송신자 기준 확인
                case 'battle_accepted':
                    console.log('[Battle Socket] ✅ Battle accepted by:', data.acceptor_id);
                    console.log('송신자 데이터 확인', data);
                    // 밑의 setBattleAccepted쪽에서도 다시금 값이 null로 처리가 되어버리는 문제가 존재함.
                    // 가장 가능성 있는 것은 client 쪽에서 received message로 값을 받고(이때가 상대방의 정보를 받아오는 처리를 하는 순간)
                    // 
                    setBattleAccepted(true);
                    setCurrentOpponentId(data.acceptor_id);
                    break;

                // 배틀 수신자 기준 확인
                case 'battle_accepted_confirm':
                    console.log('[Battle Socket] ✅ Battle acceptance confirmed');
                    console.log('수신자 데이터 확인', data);
                    setBattleAccepted(true);
                    setCurrentOpponentId(data.requester_id);
                    break;

                case 'battle_rejected':
                    console.log('[Battle Socket] ❌ Battle rejected');
                    alert('상대방이 배틀을 거절했습니다.');
                    setCurrentOpponentId(null);
                    break;

                case 'opponent_pokemon_selected':
                    console.log('[Battle Socket] 🎯 Opponent selected Pokemon');
                    setOpponentPokemon(data.pokemon_data);
                    break;

                case 'opponent_ready':
                    console.log('[Battle Socket] ⚡ Opponent is ready');
                    setOpponentReady(true);
                    break;

                case 'battle_created':
                    console.log('[Battle Socket] 🎮 Battle created:', data.battle_data);
                    console.log("생성 데이터 확인", data);
                    setBattleCreatedData(data.battle_data);
                    break;

                default:
                    console.log('[Battle Socket] ⚠️ Unknown message type:', data.type);
            }
        };

        ws.onerror = (error) => {
            console.error('[Battle Socket] ❌ WebSocket Error:', error);
        };

        ws.onclose = (event) => {
            console.log('[Battle Socket] 🔌 Disconnected. Code:', event.code, 'Reason:', event.reason);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                console.log('[Battle Socket] 🔌 Closing connection on cleanup');
                ws.close();
            }
        };
    }, [roomId, userId]);

    const sendBattleRequest = (targetUserId: number, requesterNickname: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'battle_request',
                target_user_id: targetUserId,
                requester_nickname: requesterNickname
            };
            console.log('[Battle Socket] 📤 Sending battle request:', message);
            wsRef.current.send(JSON.stringify(message));
            setCurrentOpponentId(targetUserId);
        } else {
            console.error('[Battle Socket] ❌ Cannot send - WebSocket not open. State:', wsRef.current?.readyState);
        }
    };

    const acceptBattle = (requesterId: number, acceptorNickname: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'battle_accept',
                requester_id: requesterId,
                acceptor_nickname: acceptorNickname
            };
            console.log('[Battle Socket] 📤 Accepting battle:', message);
            wsRef.current.send(JSON.stringify(message));
            setIncomingRequest(null);
        } else {
            console.error('[Battle Socket] ❌ Cannot accept - WebSocket not open');
        }
    };

    const rejectBattle = (requesterId: number) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'battle_reject',
                requester_id: requesterId
            };
            console.log('[Battle Socket] 📤 Rejecting battle:', message);
            wsRef.current.send(JSON.stringify(message));
            setIncomingRequest(null);
            setCurrentOpponentId(null);
        } else {
            console.error('[Battle Socket] ❌ Cannot reject - WebSocket not open');
        }
    };

    const selectPokemon = (opponentId: number, pokemonData: PokemonData) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'pokemon_selected',
                opponent_id: opponentId,
                pokemon_data: pokemonData
            };
            console.log('[Battle Socket] 📤 Pokemon selected:', message);
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('[Battle Socket] ❌ Cannot select Pokemon - WebSocket not open');
        }
    };

    const enterBattle = (opponentId: number, userData: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'enter_battle',
                opponent_id: opponentId,
                user_data: userData
            };
            console.log('[Battle Socket] 📤 Entering battle:', message);
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('[Battle Socket] ❌ Cannot enter battle - WebSocket not open');
        }
    };

    const notifyBattleCreated = (opponentId: number, battleData: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            const message = {
                type: 'battle_created',
                target_user_id: opponentId,
                battle_data: battleData
            };
            console.log('[Battle Socket] 📤 Notifying battle created:', message);
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.error('[Battle Socket] ❌ Cannot notify - WebSocket not open');
        }
    };

    // temp add 

    // const notifyBattleCreated = (
    //     requesterId: number,
    //     acceptorId: number,
    //     battleData: any
    // ) => {
    //     if (wsRef.current?.readyState === WebSocket.OPEN) {
    //         const message = {
    //             type: 'battle_created',
    //             requester_id: requesterId,
    //             acceptor_id: acceptorId,
    //             battle_data: battleData
    //         };
            
    //         console.log('[Battle Socket] 📤 Notifying battle created:', message);
    //         wsRef.current.send(JSON.stringify(message));
    //     }
    // };


    // temp add end

    return {
        sendBattleRequest,
        acceptBattle,
        rejectBattle,
        selectPokemon,
        enterBattle,
        notifyBattleCreated,
        incomingRequest,
        battleAccepted,
        opponentPokemon,
        opponentReady,
        currentOpponentId,
        battleCreatedData
    };
};
