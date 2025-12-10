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

    useEffect(() => {
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

                case 'battle_accepted':
                    console.log('[Battle Socket] ✅ Battle accepted by:', data.acceptor_id);
                    setBattleAccepted(true);
                    setCurrentOpponentId(data.acceptor_id);
                    break;

                case 'battle_accepted_confirm':
                    console.log('[Battle Socket] ✅ Battle acceptance confirmed');
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
