from typing import Dict, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
import json

from ..database import get_db
from .. import models

router = APIRouter(
    prefix="/ws",
    tags=["websocket"]
)

# 연결 관리: {room_id: {user_id: WebSocket}}
active_connections: Dict[int, Dict[int, WebSocket]] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, Dict[int, WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int, user_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = {}
        self.active_connections[room_id][user_id] = websocket
        print(f"[WebSocket] User {user_id} connected to room {room_id}")
    
    def disconnect(self, room_id: int, user_id: int):
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                del self.active_connections[room_id][user_id]
                print(f"[WebSocket] User {user_id} disconnected from room {room_id}")
            if not self.active_connections[room_id]:
                del self.active_connections[room_id]
    
    async def send_to_user(self, room_id: int, user_id: int, message: dict):
        """특정 사용자에게 메시지 전송"""
        if room_id in self.active_connections:
            if user_id in self.active_connections[room_id]:
                websocket = self.active_connections[room_id][user_id]
                await websocket.send_json(message)
    
    async def broadcast_to_room(self, room_id: int, message: dict, exclude_user: int = None):
        """방의 모든 사용자에게 브로드캐스트 (특정 사용자 제외 가능)"""
        if room_id in self.active_connections:
            for user_id, websocket in self.active_connections[room_id].items():
                if exclude_user is None or user_id != exclude_user:
                    await websocket.send_json(message)

manager = ConnectionManager()

@router.websocket("/battle/{room_id}/{user_id}")
async def battle_websocket(
    websocket: WebSocket,
    room_id: int,
    user_id: int
):
    """
    배틀 WebSocket 엔드포인트
    - 배틀 신청/수락/거절
    - 포켓몬 선택 동기화
    - 배틀 입장 동기화
    """
    await manager.connect(websocket, room_id, user_id)
    
    try:
        while True:
            # 클라이언트로부터 메시지 수신
            data = await websocket.receive_json()
            event_type = data.get("type")
            
            print(f"[WebSocket] Received from user {user_id}: {event_type}")
            
            if event_type == "battle_request":
                # 배틀 신청
                to_user_id = data.get("to_user_id")
                from_nickname = data.get("from_nickname")
                
                await manager.send_to_user(room_id, to_user_id, {
                    "type": "battle_request",
                    "from_user_id": user_id,
                    "from_nickname": from_nickname
                })
                print(f"[Battle] User {user_id} requested battle to User {to_user_id}")
            
            elif event_type == "battle_accept":
                # 배틀 수락
                to_user_id = data.get("to_user_id")
                
                await manager.send_to_user(room_id, to_user_id, {
                    "type": "battle_accepted",
                    "from_user_id": user_id
                })
                print(f"[Battle] User {user_id} accepted battle from User {to_user_id}")
            
            elif event_type == "battle_reject":
                # 배틀 거절
                to_user_id = data.get("to_user_id")
                
                await manager.send_to_user(room_id, to_user_id, {
                    "type": "battle_rejected",
                    "from_user_id": user_id
                })
                print(f"[Battle] User {user_id} rejected battle from User {to_user_id}")
            
            elif event_type == "pokemon_selected":
                # 포켓몬 선택 완료
                to_user_id = data.get("to_user_id")
                pokemon_data = data.get("pokemon_data")
                
                await manager.send_to_user(room_id, to_user_id, {
                    "type": "opponent_pokemon_selected",
                    "from_user_id": user_id,
                    "pokemon_data": pokemon_data
                })
                print(f"[Battle] User {user_id} selected Pokemon: {pokemon_data.get('name')}")
            
            elif event_type == "enter_battle":
                # 배틀 입장 준비 완료
                to_user_id = data.get("to_user_id")
                my_data = data.get("my_data")
                
                await manager.send_to_user(room_id, to_user_id, {
                    "type": "opponent_ready",
                    "from_user_id": user_id,
                    "opponent_data": my_data
                })
                print(f"[Battle] User {user_id} is ready to enter battle")
            
            elif event_type == "ping":
                # 연결 유지용 핑
                await websocket.send_json({"type": "pong"})
    
    except WebSocketDisconnect:
        manager.disconnect(room_id, user_id)
        print(f"[WebSocket] User {user_id} disconnected from room {room_id}")
    except Exception as e:
        print(f"[WebSocket] Error for user {user_id}: {e}")
        manager.disconnect(room_id, user_id)
