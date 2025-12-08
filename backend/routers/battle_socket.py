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
    
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        logger.info(f"[Battle Socket] User {user_id} disconnected from room {room_id}")
    except Exception as e:
        logger.error(f"[Battle Socket] Error in websocket for user {user_id}: {e}")
        manager.disconnect(room_id, user_id)
