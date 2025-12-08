import { useEffect, useRef, useState, useCallback } from 'react';

interface PokemonData {
    id: number;
    name: string;
    level: number;
    sprite: string;
    hp?: number;
    type?: string;
    exp?: number;
}

interface BattleRequest {
    from_user_id: number;
    from_nickname: string;
}

interface BattleData {
    opponentId: number;
    opponentNickname: string;
    opponentPokemon: PokemonData | null;
    myPokemon: PokemonData | null;
}

export function useBattleSocket(roomId: number | null, userId: number | null) {
    const wsRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [incomingRequest, setIncomingRequest] = useState<BattleRequest | null>(null);
    const [battleAccepted, setBattleAccepted] = useState(false);
    const [opponentPokemon, setOpponentPokemon] = useState<PokemonData | null>(null);
    const [battleData, setBattleData] = useState<BattleData | null>(null);
    const [opponentReady, setOpponentReady] = useState(false);

    // WebSocket 연결
    useEffect(() => {
        if (!roomId || !userId) return;

        const ws = new WebSocket(`ws://localhost:8000/ws/battle/${roomId}/${userId}`);

        ws.onopen = () => {
            console.log('[WebSocket] Connected to battle socket');
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('[WebSocket] Received:', data);

            switch (data.type) {
                case 'battle_request':
                    // 배틀 신청 받음
                    setIncomingRequest({
                        from_user_id: data.from_user_id,
                        from_nickname: data.from_nickname
                    });
                    break;

                case 'battle_accepted':
                    // 배틀 수락됨
                    setBattleAccepted(true);
                    setBattleData({
                        opponentId: data.from_user_id,
                        opponentNickname: '',
                        opponentPokemon: null,
                        myPokemon: null
                    });
                    break;

                case 'battle_rejected':
                    // 배틀 거절됨
                    alert('상대방이 배틀을 거절했습니다.');
                    break;

                case 'opponent_pokemon_selected':
                    // 상대방이 포켓몬 선택함
                    setOpponentPokemon(data.pokemon_data);
                    if (battleData) {
                        setBattleData({
                            ...battleData,
                            opponentPokemon: data.pokemon_data
                        });
                    }
                    break;

                case 'opponent_ready':
                    // 상대방이 배틀 입장 준비 완료
                    setOpponentReady(true);
                    if (battleData) {
                        setBattleData({
                            ...battleData,
                            opponentNickname: data.opponent_data.nickname,
                            opponentPokemon: data.opponent_data.pokemon
                        });
                    }
                    break;

                case 'pong':
                    // 핑 응답
                    break;
            }
        };

        ws.onerror = (error) => {
            console.error('[WebSocket] Error:', error);
        };

        ws.onclose = () => {
            console.log('[WebSocket] Disconnected');
            setIsConnected(false);
        };

        wsRef.current = ws;

        // 연결 유지용 핑
        const pingInterval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // 30초마다

        return () => {
            clearInterval(pingInterval);
            ws.close();
        };
    }, [roomId, userId]);

    // 배틀 신청 보내기
    const sendBattleRequest = useCallback((toUserId: number, fromNickname: string) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'battle_request',
                to_user_id: toUserId,
                from_nickname: fromNickname
            }));
            console.log(`[Battle] Sent battle request to user ${toUserId}`);
        }
    }, []);

    // 배틀 수락
    const acceptBattle = useCallback((toUserId: number) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'battle_accept',
                to_user_id: toUserId
            }));
            setBattleAccepted(true);
            console.log(`[Battle] Accepted battle from user ${toUserId}`);
        }
    }, []);

    // 배틀 거절
    const rejectBattle = useCallback((toUserId: number) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'battle_reject',
                to_user_id: toUserId
            }));
            setIncomingRequest(null);
            console.log(`[Battle] Rejected battle from user ${toUserId}`);
        }
    }, []);

    // 포켓몬 선택 전송
    const selectPokemon = useCallback((toUserId: number, pokemonData: PokemonData) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'pokemon_selected',
                to_user_id: toUserId,
                pokemon_data: pokemonData
            }));
            if (battleData) {
                setBattleData({
                    ...battleData,
                    myPokemon: pokemonData
                });
            }
            console.log(`[Battle] Selected Pokemon:`, pokemonData);
        }
    }, [battleData]);

    // 배틀 입장 준비 완료
    const enterBattle = useCallback((toUserId: number, myData: { nickname: string, pokemon: PokemonData }) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                type: 'enter_battle',
                to_user_id: toUserId,
                my_data: myData
            }));
            console.log(`[Battle] Ready to enter battle`);
        }
    }, []);

    // 상태 초기화
    const resetBattle = useCallback(() => {
        setIncomingRequest(null);
        setBattleAccepted(false);
        setOpponentPokemon(null);
        setBattleData(null);
        setOpponentReady(false);
    }, []);

    return {
        isConnected,
        sendBattleRequest,
        acceptBattle,
        rejectBattle,
        selectPokemon,
        enterBattle,
        resetBattle,
        incomingRequest,
        battleAccepted,
        opponentPokemon,
        battleData,
        opponentReady
    };
}
