'use strict';

const webrtc = require("wrtc");
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const express = require('express');
const app = express();
// 배포 통신 시나리오 (server.js -> python fastapi server)
// const { RTCVideoSink } = require("wrtc").nonstandard;
// const jpeg = require('jpeg-js'); // npm install jpeg-js

app.use(express.static('public'));
// based on examples at https://www.npmjs.com/package/ws
const WebSocketServer = WebSocket.Server;

// client - server 웹소켓 옵션 정의
// 나중에 local환경이 아니라 다른 환경에서 적용할 때, port 변경 필요
const serverOptions = {
    listenPort: process.env.PORT || 5111,
    useHttps: process.env.USE_HTTPS === 'true' || false,
    httpsCertFile: process.env.HTTPS_CERT_FILE || '/path/to/cert/',
    httpsKeyFile: process.env.HTTPS_KEY_FILE || '/path/to/key/',
    maxClients: process.env.MAX_CLIENTS || 12, // Maximum number of clients in a room
    pingInterval: process.env.PING_INTERVAL || 30000, // Ping interval in ms
    pongTimeout: process.env.PONG_TIMEOUT || 5000, // Pong timeout in ms
    corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['*'],
    iceServers: [
        { urls: 'stun:stun.stunprotocol.org:3478' },
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here if needed for NAT traversal
        // { 
        //     urls: 'turn:turn.example.com:3478',
        //     username: 'username',
        //     credential: 'password'
        // }
    ]
};

// 배포 통신 시나리오 (server.js -> python fastapi server)
// server - python 웹소켓 옵션 정의
// const pythonServerOptions = {
//     listenPort: process.env.PYTHON_WS_PORT || 8081,  // Python 전용 포트
//     useHttps: process.env.PYTHON_WS_USE_HTTPS === 'true' || false,
//     httpsCertFile: process.env.PYTHON_WS_HTTPS_CERT_FILE || '/path/to/cert/',
//     httpsKeyFile: process.env.PYTHON_WS_HTTPS_KEY_FILE || '/path/to/key/',
//     maxClients: process.env.PYTHON_WS_MAX_CLIENTS || 5,  // Python 클라이언트 제한
//     pingInterval: process.env.PYTHON_WS_PING_INTERVAL || 30000,  // Ping 간격
//     pongTimeout: process.env.PYTHON_WS_PONG_TIMEOUT || 5000
// };

// 다른 옵션 환경 설정(기존 환경의 key와 같은 env값을 활용해서 새로운 옵션 지정)
let sslOptions = {};
if (serverOptions.useHttps) {
    sslOptions.key = fs.readFileSync(serverOptions.httpsKeyFile).toString();
    sslOptions.cert = fs.readFileSync(serverOptions.httpsCertFile).toString();
}

// 호스트 주소 매핑과 같은 서버 실행 작업
// client - server 웹 소켓 통신 정의 (http, https)
let webServer = null;
if(serverOptions.useHttps) {
    webServer = https.createServer(sslOptions, app);
    webServer.listen(serverOptions.listenPort);
    // console.log("ssl : ", webServer);
} else { // 일단 로컬에서는 이부분이 실행됨.
    webServer = http.createServer(app);
    webServer.listen(serverOptions.listenPort);
    // console.log("non-ssl : ", webServer);
}

// 배포 통신 시나리오 (server.js -> python fastapi server)
// server - python 웹 소켓 통신 정의
// let pythonWebServer = null;
// if (pythonServerOptions.useHttps) {
//     const sslOptions = {
//         key: fs.readFileSync(pythonServerOptions.httpsKeyFile),
//         cert: fs.readFileSync(pythonServerOptions.httpsCertFile)
//     };
//     pythonWebServer = https.createServer(sslOptions);
// } else {
//     pythonWebServer = http.createServer();
// }

// pythonWebServer.listen(pythonServerOptions.listenPort, () => {
//     console.log(`Python WebSocket server listening on port ${pythonServerOptions.listenPort}`);
// });


// 전반적인 데이터
// Store client connections and their states
const peers = new Map();
const consumers = new Map();
const rooms = new Map();
const stats = {
    totalConnections: 0,
    peakConnections: 0,
    activeRooms: 0
};

// 사용자에게 가는 res에 대한 보안 제약 설정
// Enable security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// 서버 자체의 보안 (위와는 느낌이 살짝 다름)
// Configure CORS
app.use(cors({
    origin: serverOptions.corsOrigins,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// express에 제약을 거는거 같은데....
// Serve static files
app.use(express.static('public', {
    maxAge: '1h',
    etag: true,
    lastModified: true
}));

// 오류 핸들러
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Express error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// 매체 추적 변수들
/**
 * Handles new media tracks from peers
 * @param {RTCTrackEvent} e - The track event
 * @param {string} peer - Peer ID
 * @param {WebSocket} ws - WebSocket connection
 */
function handleTrackEvent(e, peer, ws) {
    try {
        if (!e.streams || !e.streams[0]) {
            console.warn(`No streams in track event for peer ${peer}`);
            return;
        }

        const peerInfo = peers.get(peer);
        if (!peerInfo) {
            console.warn(`Peer ${peer} not found while handling track`);
            return;
        }

        const track = e.track;
        peerInfo.stream = e.streams[0];
        peerInfo.tracks = peerInfo.tracks || new Map();

        // Check if we already have this track
        if (peerInfo.tracks.has(track.id)) {
            console.log(`Track ${track.id} already exists for peer ${peer}`);
            return;
        }

        // Store track information
        peerInfo.tracks.set(track.id, {
            id: track.id,
            kind: track.kind,
            timestamp: Date.now(),
            track: track
        });

        // 배포 통신 시나리오(server.js -> python fastapi server)
        // Video track만 Python으로 전송
        // RTCVideoSink를 통해 프레임 가져오기
        // if (track.kind === "video"){
        //     const sink = new RTCVideoSink(track);
        //     sink.onframe = ({ frame }) => {
        //         const jpegImage = jpeg.encode(frame, 80); // 80% 품질
        //         const base64Frame = jpegImage.data.toString('base64');

        //         videoWSS.clients.forEach(client => {
        //             if (client.readyState === WebSocket.OPEN) {
        //                 client.send(JSON.stringify({
        //                     peerId: peer,
        //                     frame: base64Frame
        //                 }));
        //             }
        //         });
        //     };
        // }

        // Notify all peers about the new producer, except the sender
        const payload = {
            type: 'newProducer',
            id: peer,
            username: peerInfo.username,
            trackInfo: {
                id: track.id,
                kind: track.kind
            }
        };

        wss.broadcast(JSON.stringify(payload), peer); // Exclude the sender
    } catch (error) {
        console.error('Error in handleTrackEvent:', error);
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Failed to process media track',
            code: 'TRACK_ERROR'
        }));
    }
}

// Peer 생성
/**
 * Creates a new WebRTC peer connection with the specified configuration
 * @param {string} peerId - The ID of the peer
 * @returns {RTCPeerConnection} The created peer connection
 */
function createPeer(peerId) {
    try {
        const peer = new webrtc.RTCPeerConnection({
            iceServers: serverOptions.iceServers,
            iceCandidatePoolSize: 10,
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            sdpSemantics: 'unified-plan'
        });

        // Monitor connection state
        peer.onconnectionstatechange = () => {
            console.log(`Peer ${peerId} connection state: ${peer.connectionState}`);
            if (peer.connectionState === 'failed') {
                console.warn(`Peer ${peerId} connection failed, cleaning up...`);
                cleanupPeer(peerId);
            }
        };

        // Monitor ICE connection state
        peer.oniceconnectionstatechange = () => {
            console.log(`Peer ${peerId} ICE state: ${peer.iceConnectionState}`);
        };

        // Log ICE gathering state changes
        peer.onicegatheringstatechange = () => {
            console.log(`Peer ${peerId} ICE gathering state: ${peer.iceGatheringState}`);
        };

        return peer;
    } catch (error) {
        console.error('Error creating peer:', error);
        throw new Error('Failed to create peer connection');
    }
}

// Peer 삭제
/**
 * Cleans up resources associated with a peer
 * @param {string} peerId - The ID of the peer to clean up
 */
function cleanupPeer(peerId) {
    try {
        const peerInfo = peers.get(peerId);
        if (!peerInfo) return;

        // Close and cleanup WebRTC connection
        if (peerInfo.peer) {
            peerInfo.peer.close();
        }

        // Stop all tracks
        if (peerInfo.stream) {
            peerInfo.stream.getTracks().forEach(track => track.stop());
        }

        // Cleanup associated consumers
        consumers.forEach((consumer, id) => {
            if (consumer.peerId === peerId) {
                if (consumer.peer) {
                    consumer.peer.close();
                }
                // Stop all tracks in the consumer
                if (consumer.tracks) {
                    consumer.tracks.forEach(trackId => {
                        const track = consumer.peer.getTransceivers().find(t => t.receiver.track.id === trackId);
                        if (track) {
                            track.receiver.track.stop();
                        }
                    });
                }
                consumers.delete(id);
            }
        });

        // Remove from peers map
        peers.delete(peerId);

        // Update stats
        stats.totalConnections--;

        // Notify other peers
        wss.broadcast(JSON.stringify({
            type: 'user_left',
            id: peerId
        }));

        // wss.broadcast(JSON.stringify({type: 'peerslist', keys: Array.from(peers.keys())}));
        
        const consumersPayload = Array.from(consumers.entries()).map(([consumerId, data]) => ({
            consumerId,
            peerId: data.peerId
        }));

        wss.broadcast(JSON.stringify({type: 'consumerslist', data: consumersPayload}));
    } catch (error) {
        console.error(`Error cleaning up peer ${peerId}:`, error);
    }
}


/**
 * Create WebSocket server with ping/pong monitoring
 */
// 이거 나중에 video 스트림이 해당 청크보다 작아서 끊기는 걸 수도 있으니까, 이것도 고려해보기
const wss = new WebSocketServer({ 
    server: webServer, // ref) line. 49 ++ createServer로 서버 객체를 이미 가지고 있는 듯.
    clientTracking: true,
    perMessageDeflate: {
        // 메시지 압축
        zlibDeflateOptions: {
            chunkSize: 1024,
            memLevel: 7,
            level: 3
        },
        // 압축 해제 설정? 일듯
        zlibInflateOptions: {
            chunkSize: 10 * 1024
        },
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024
    }
});

// const videoWSS = new WebSocket.Server({ server: pythonWebServer, maxPayload: 1024 * 1024 * 10 }); 

// Keep track of connection statistics
setInterval(() => {
    const currentConnections = peers.size;
    stats.peakConnections = Math.max(stats.peakConnections, currentConnections);
    stats.activeRooms = rooms.size;
    console.log('Server Stats:', stats);
}, 60000);

// Peer 관리 핵심 로직
wss.on('connection', async function (ws, req) {
    // Rate limiting and connection validation
    const ip = req.socket.remoteAddress;
    if (peers.size >= serverOptions.maxClients) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Server is at capacity',
            code: 'MAX_CLIENTS_REACHED'
        }));
        return ws.close();
    }

    // Set up the new peer
    const peerId = uuidv4();
    // console.log("peerid: ", peerId);
    ws.id = peerId;
    ws.isAlive = true;

    // 위에서 주기적으로 아마 ping 신호를 주는거 같은데 나중에 확인
    // Set up ping/pong
    ws.on('pong', () => {
        ws.isAlive = true;
    });

    // 화면 종료 시 Peer 연결 종료
    // Handle disconnection
    ws.on('close', (code, reason) => {
        console.log(`Client ${peerId} disconnected. Code: ${code}, Reason: ${reason}`);
        cleanupPeer(ws.id);
    });

    
    // Handle errors
    ws.on('error', (error) => {
        console.error(`WebSocket error for peer ${peerId}:`, error);
        cleanupPeer(ws.id);
    });


    ws.send(JSON.stringify({ 'type': 'join', id: peerId }));
    ws.on('message', async function (message) {
        const body = JSON.parse(message);
        // console.log("body : \n", body);
        console.log("body.type : \n", body.type);
        // if (body.sdp && body.sdp.type) {
        //     console.log("body.sdp.type :", body.sdp.type);
        // }
        // if (body.uqid) {
        //     console.log("body.uqid : \n", body.uqid);
        // }
        switch (body.type) {
            case 'connect': // 2번으로 들어옴
                try {
                    if (peers.has(body.uqid)) {
                        console.log(`Peer ${body.uqid} already exists, cleaning up old connection`);
                        cleanupPeer(body.uqid);
                    }

                    peers.set(body.uqid, { 
                        socket: ws,
                        username: body.username,
                        tracks: new Map(),
                        connectedAt: Date.now()
                    });

                    const peer = createPeer(body.uqid);
                    peers.get(body.uqid).peer = peer;
                    peer.ontrack = (e) => { handleTrackEvent(e, body.uqid, ws) };

                    const desc = new webrtc.RTCSessionDescription(body.sdp);
                    await peer.setRemoteDescription(desc);
                    const answer = await peer.createAnswer();
                    await peer.setLocalDescription(answer);

                    const payload = {
                        type: 'answer',
                        sdp: peer.localDescription
                    };

                    // console.log("cp: ",peers.keys());

                    ws.send(JSON.stringify(payload));
                    // temp add
                    // wss.broadcast(JSON.stringify({type: 'peerslist', keys: Array.from(peers.keys())}));
                    // temp add end
                    // Update stats
                    stats.totalConnections++;
                } catch (error) {
                    console.error('Error in connect:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Failed to establish connection',
                        code: 'CONNECT_ERROR'
                    }));
                }
                break;
            case 'getPeers': // 1번으로 들어옴 // async connect에서, localpeer를 설정하는 딜레이에 subscribe가 실행됨.
                let uuid = body.uqid;
                const list = [];
                peers.forEach((peer, key) => {
                    if (key != uuid) {
                        const peerInfo = {
                            id: key,
                            username: peer.username,
                        }
                        list.push(peerInfo);
                    }
                });

                const peersPayload = {
                    type: 'peers',
                    peers: list
                }

                ws.send(JSON.stringify(peersPayload));
                break;
            // case 'ice':
            //     const user = peers.get(body.uqid);
            //     console.log("body : \n", body.uqid);
            //     console.log("body.uqid : \n", body.uqid);
            //     // console.log("user : \n", user);
            //     if (user.peer)
            //         user.peer.addIceCandidate(new webrtc.RTCIceCandidate(body.ice)).catch(e => console.log(e));
            //     break;
            case 'ice': // 3번으로 들어오고 계속 유지됨
                const user = peers.get(body.uqid);
                if (!user) {
                    console.warn(`ICE received for unknown peer ${body.uqid}`);
                    return;
                }

                if (user.peer) {
                    // peer가 이미 존재하면 바로 적용
                    user.peer.addIceCandidate(new webrtc.RTCIceCandidate(body.ice))
                        .catch(e => console.error('Error adding ICE candidate:', e));
                } else {
                    // 아직 peer가 생성되지 않았으면 큐에 저장
                    user.iceQueue.push(body.ice);
                }
                break;
            // 각 클라이언트에서 보내는 RTC event(video & audio stream)을 처리하는 부분
            // 여기서 newPeer는 원격 데이터들을 요청한 client와 직접 통신하는 peer 인스턴스
            // 다시 말해서, 서버에서 클라이언트 들을 "추적"하는 Peer 들이 있고(클라이언트 Peer의 상태를 서버에 알리기 위해 카피 시킨 Peer라고 보면 됨)
            // 그리고 실제로 데이터를 주고받는 newPeer(각 Peer와 1:1 대응이며, 이 newPeer들은 RTC통신을 직접적으로 수행함)
            case 'consume':
                try {
                    let { id, sdp, consumerId } = body;
                    const remoteUser = peers.get(id);
                    
                    if (!remoteUser) {
                        throw new Error(`Remote user ${id} not found`);
                    }

                    // Check if consumer already exists
                    if (consumers.has(consumerId)) {
                        console.log(`111Consumer ${consumerId} already exists, skipping`);
                        return;
                    }

                    const newPeer = createPeer(consumerId);
                    consumers.set(consumerId, {
                        peer: newPeer,
                        peerId: id,
                        tracks: new Set()
                    });

                    // for (const key of consumers.keys()) {
                    //     console.log("key:", key, "peerId:", consumers.get(key)?.peerId);
                    // }

                    const consumersPayload = Array.from(consumers.entries()).map(([consumerId, data]) => ({
                        consumerId,
                        peerId: data.peerId
                    }));

                    wss.broadcast(JSON.stringify({type: 'consumerslist', data: consumersPayload}));

                    const _desc = new webrtc.RTCSessionDescription(sdp);
                    await newPeer.setRemoteDescription(_desc);

                    // Add tracks if they exist
                    // console.log('remoteUser.stream:', remoteUser.stream);
                    // console.log('remoteUser.tracks:', remoteUser.tracks);

                    if (remoteUser.stream && remoteUser.tracks) {
                        remoteUser.stream.getTracks().forEach(track => {
                            // Only add track if we haven't already added it
                            if (!consumers.get(consumerId).tracks.has(track.id)) {
                                newPeer.addTrack(track, remoteUser.stream);
                                consumers.get(consumerId).tracks.add(track.id);
                            }
                        });
                    }

                    const _answer = await newPeer.createAnswer();
                    await newPeer.setLocalDescription(_answer);

                    const _payload = {
                        type: 'consume',
                        sdp: newPeer.localDescription,
                        username: remoteUser.username,
                        id,
                        consumerId
                    };

                    ws.send(JSON.stringify(_payload));
                } catch (error) {
                    console.error('Error in consume:', error);
                    ws.send(JSON.stringify({
                        type: 'error',
                        message: 'Failed to consume media',
                        code: 'CONSUME_ERROR'
                    }));
                }

                break;
            case 'consumer_ice':
                if (consumers.has(body.consumerId)) {
                    const consumer = consumers.get(body.consumerId);
                    if (consumer.peer) {
                        consumer.peer.addIceCandidate(new webrtc.RTCIceCandidate(body.ice))
                            .catch(e => console.error('Error adding ICE candidate:', e));
                    }
                }
                break;
            case 'disconnect':
                try {
                    let { id } = body;
                    cleanupPeer(id);
                } catch (error) {
                    console.error('Error in disconnect:', error);
                }
                break;
            default:
                wss.broadcast(message);

        }
    });

    ws.on('error', () => ws.terminate());
});

// videoWSS.on('connection', (ws) => {
//     console.log('Python client connected');

//     ws.on('message', (message) => {
//         // JSON 형식: { peerId: 'xxxx' }
//         const msg = JSON.parse(message);
//         if (msg.peerId) {
//             ws.peerId = msg.peerId;
//             console.log(`Python client registered for Peer ID ${ws.peerId}`);
//         }
//     });

//     ws.on('close', () => {
//         console.log(`Python client for Peer ID ${ws.peerId} disconnected`);
//     });
// });

/**
 * Broadcast a message to all connected peers
 * @param {string} data - The message to broadcast
 * @param {string} [excludePeerId] - Optional peer ID to exclude from broadcast
 * @param {string} [roomId] - Optional room ID to limit broadcast scope
 */
wss.broadcast = function (data, excludePeerId = null, roomId = null) {
    try {
        peers.forEach((peer, peerId) => {
            if (excludePeerId && peerId === excludePeerId) return;
            if (roomId && peer.roomId !== roomId) return;
            
            if (peer.socket && peer.socket.readyState === WebSocket.OPEN) {
                peer.socket.send(data);
            }
        });
    } catch (error) {
        console.error('Broadcast error:', error);
    }
};

/**
 * Set up periodic ping to keep connections alive and clean up dead connections
 */
const pingInterval = setInterval(() => {
    wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
            console.log(`Client ${ws.id} timed out, terminating connection`);
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
    });
}, serverOptions.pingInterval);

wss.on('close', () => {
    clearInterval(pingInterval);
});

console.log('Server running.');
