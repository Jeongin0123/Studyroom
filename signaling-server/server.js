// signaling-server/server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const rooms = new Map(); // roomId -> Set<WebSocket>

function broadcast(roomId, msg, sender) {
  const set = rooms.get(roomId) || new Set();
  for (const ws of set) {
    if (ws !== sender && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }
}

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, 'http://localhost');
  const roomId = url.searchParams.get('room') || 'demo';

  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).add(ws);

  // 새 유저 등장 알림(상대가 offer 만들 기회)
  broadcast(roomId, { type: 'join' }, null);

  ws.on('message', (buf) => {
    try {
      const data = JSON.parse(buf.toString());
      if (['offer', 'answer', 'ice'].includes(data.type)) {
        broadcast(roomId, data, ws);
      }
    } catch (_) {}
  });

  ws.on('close', () => {
    const set = rooms.get(roomId);
    if (set) {
      set.delete(ws);
      if (set.size === 0) rooms.delete(roomId);
    }
  });
});

console.log('WebSocket signaling server on ws://localhost:8080');
