from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Set
import json
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# 방별 연결 관리: {room_id: {user_id: websocket}}
room_connections: Dict[str, Dict[int, WebSocket]] = {}


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Dict[int, WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room_id: str, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        logger.info(f"[Battle Socket] User {user_id} connected to room {room_id}")

    def disconnect(self, room_id: str, user_id: int):
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                del self.active_connections[room_id][user_id]
                logger.info(f"[Battle Socket] User {user_id} disconnected from room {room_id}")
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]

    async def send_to_user(self, room_id: str, user_id: int, message: dict):
        """특정 사용자에게 메시지 전송"""
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                try:
                    await self.active_connections[room_id][user_id].send_json(message)
                    logger.info(f"[Battle Socket] Sent to user {user_id}: {message.get('type')}")
                except Exception as e:
                    logger.error(f"[Battle Socket] Error sending to user {user_id}: {e}")

    async def broadcast_to_room(self, room_id: str, message: dict, exclude_user: int = None):
        """방의 모든 사용자에게 브로드캐스트 (특정 사용자 제외 가능)"""
        if room_id in self.active_connections:
            for user_id, websocket in self.active_connections[room_id].items():
                if exclude_user is None or user_id != exclude_user:
                    try:
                        await websocket.send_json(message)
                    except Exception as e:
                        logger.error(f"[Battle Socket] Error broadcasting to user {user_id}: {e}")


manager = ConnectionManager()


@router.websocket("/ws/battle/{room_id}/{user_id}")
async def battle_websocket(websocket: WebSocket, room_id: str, user_id: int):
    await manager.connect(websocket, room_id, user_id)
    
    try:
        # 이거 while문 때문에 배틀 넘어갈 때, 오래걸리는 문제일 수도 있음, 일단 front단이 문제인거 같긴 한데, 메모
        # if, elif 또한 순차 분기를 돌리는 거라 확인해봐야함
        while True:
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            logger.info(f"[Battle Socket] Received from user {user_id}: {event_type}")
            
            if event_type == "battle_request":
                # 배틀 신청
                target_user_id = data.get("target_user_id")
                requester_nickname = data.get("requester_nickname")
                
                await manager.send_to_user(room_id, target_user_id, {
                    "type": "battle_request",
                    "requester_id": user_id,
                    "requester_nickname": requester_nickname
                })
                logger.info(f"[Battle Socket] Battle request from {user_id} to {target_user_id}")
            
            elif event_type == "battle_accept":
                # 배틀 수락
                requester_id = data.get("requester_id")
                acceptor_nickname = data.get("acceptor_nickname")
                
                # 신청자에게 수락 알림
                await manager.send_to_user(room_id, requester_id, {
                    "type": "battle_accepted",
                    "acceptor_id": user_id,
                    "acceptor_nickname": acceptor_nickname
                })
                
                # 수락자에게도 확인 메시지
                await manager.send_to_user(room_id, user_id, {
                    "type": "battle_accepted_confirm",
                    "requester_id": requester_id
                })
                logger.info(f"[Battle Socket] Battle accepted: {requester_id} <-> {user_id}")
            
            elif event_type == "battle_reject":
                # 배틀 거절
                requester_id = data.get("requester_id")
                
                await manager.send_to_user(room_id, requester_id, {
                    "type": "battle_rejected",
                    "rejector_id": user_id
                })
                logger.info(f"[Battle Socket] Battle rejected by {user_id}")
            
            elif event_type == "pokemon_selected":
                # 포켓몬 선택 완료
                opponent_id = data.get("opponent_id")
                pokemon_data = data.get("pokemon_data")
                
                await manager.send_to_user(room_id, opponent_id, {
                    "type": "opponent_pokemon_selected",
                    "pokemon_data": pokemon_data,
                    "user_id": user_id
                })
                logger.info(f"[Battle Socket] Pokemon selected by {user_id}, notified {opponent_id}")
            
            elif event_type == "enter_battle":
                # 배틀 입장 준비 완료
                opponent_id = data.get("opponent_id")
                user_data = data.get("user_data")
                
                await manager.send_to_user(room_id, opponent_id, {
                    "type": "opponent_ready",
                    "user_id": user_id,
                    "user_data": user_data
                })
                logger.info(f"[Battle Socket] User {user_id} ready for battle, notified {opponent_id}")
            
            elif event_type == "battle_created":
                # 배틀 생성 완료 알림
                target_user_id = data.get("target_user_id")
                battle_data = data.get("battle_data")
                
                await manager.send_to_user(room_id, target_user_id, {
                    "type": "battle_created",
                    "battle_data": battle_data
                })
                logger.info(f"[Battle Socket] Battle created, notified user {target_user_id}")

            # elif event_type == "battle_created":
            #     # 배틀 생성 완료 알림
            #     requester_id = data.get("requester_id")   # 배틀을 신청한 사람
            #     acceptor_id = data.get("acceptor_id")     # 배틀을 수락한 사람
            #     battle_data = data.get("battle_data")

            #     # 요청자에게 전송
            #     await manager.send_to_user(room_id, requester_id, {
            #         "type": "battle_created",
            #         "battle_data": battle_data
            #     })

            #     # 수락자에게도 전송
            #     await manager.send_to_user(room_id, acceptor_id, {
            #         "type": "battle_created",
            #         "battle_data": battle_data
            #     })

            #     logger.info(f"[Battle Socket] Battle created, notified users {requester_id} and {acceptor_id}")

            # 아마 배틀에서 지금 한쪽으로 만 되는 이유가 broadcast 방식 때문일 것 같긴한데, 만약 아니라면, client쪽 문제일 수 있음
            # 접근할 때, client쪽의 데이터 흐름 혹은 구조를 보고 broadcast 부분 확인하는게 옳을 듯
            # elif event_type == "battle_created":
            #     battle_data = data.get("battle_data")
            #     # logger.info("배틀 데이터 확인", battle_data)
            #     await manager.broadcast_to_room(room_id, {
            #         "type": "battle_created",
            #         "battle_data": battle_data
            #     })

            
            elif event_type == "battle_attack":
                # 배틀 공격 메시지
                opponent_id = data.get("opponent_id")
                attack_data = data.get("attack_data")
                
                await manager.send_to_user(room_id, opponent_id, {
                    "type": "battle_attack_received",
                    "attacker_id": user_id,
                    "attack_data": attack_data
                })
                logger.info(f"[Battle Socket] Attack from {user_id} to {opponent_id}")
            
            elif event_type == "battle_result":
                # 배틀 결과 (승리/패배)
                opponent_id = data.get("opponent_id")
                result = data.get("result")  # 'win' or 'lose'
                
                # 상대방에게는 반대 결과 전송
                opponent_result = "lose" if result == "win" else "win"
                await manager.send_to_user(room_id, opponent_id, {
                    "type": "battle_result",
                    "result": opponent_result
                })
                logger.info(f"[Battle Socket] Battle result: {user_id}={result}, {opponent_id}={opponent_result}")
    
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        logger.info(f"[Battle Socket] User {user_id} disconnected from room {room_id}")
    except Exception as e:
        logger.error(f"[Battle Socket] Error in websocket for user {user_id}: {e}")
        manager.disconnect(room_id, user_id)
