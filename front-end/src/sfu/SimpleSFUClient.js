'use strict';

/**
 * @typedef {Object} SimpleSFUEvents
 * @property {string} onLeave - Triggered when a user leaves
 * @property {string} onJoin - Triggered when a user joins
 * @property {string} onCreate - Triggered when the client is created
 * @property {string} onStreamStarted - Triggered when a media stream starts
 * @property {string} onStreamEnded - Triggered when a media stream ends
 * @property {string} onReady - Triggered when the client is ready
 * @property {string} onScreenShareStopped - Triggered when screen sharing stops
 * @property {string} exitRoom - Triggered when leaving the room
 * @property {string} onConnected - Triggered when WebSocket connects
 * @property {string} onRemoteTrack - Triggered when receiving a remote track
 * @property {string} onRemoteSpeaking - Triggered when a remote user starts speaking
 * @property {string} onRemoteStoppedSpeaking - Triggered when a remote user stops speaking
 * @property {string} onError - Triggered when an error occurs
 * @property {string} onConnectionStateChange - Triggered when connection state changes
 */

import hark from "./hark";

/** @type {SimpleSFUEvents} */
const _EVENTS = {
    onLeave: 'onLeave',
    onJoin: 'onJoin',
    onCreate: 'onCreate',
    onStreamStarted: 'onStreamStarted',
    onStreamEnded: 'onStreamEnded',
    onReady: 'onReady',
    onScreenShareStopped: 'onScreenShareStopped',
    exitRoom: 'exitRoom',
    onConnected: 'onConnected',
    onRemoteTrack: 'onRemoteTrack',
    onRemoteSpeaking: 'onRemoteSpeaking',
    onRemoteStoppedSpeaking: 'onRemoteStoppedSpeaking',
    onError: 'onError',
    onConnectionStateChange: 'onConnectionStateChange',
    // add
    onRemoteVolumeChange: 'onRemoteVolumeChange',
    onUUIDAssigned: "onUUIDAssigned",
    onConsumers: "onConsumers",
    onPeers: "onPeers",
};

export default class SimpleSFUClient {
    constructor(options = {}) {
        const defaultSettings = {
            port: 5111,
            configuration: {
                iceServers: [
                    { 'urls': 'stun:stun.stunprotocol.org:3478' },
                    { 'urls': 'stun:stun.l.google.com:19302' },
                ]
            },
        };
        
        
        this.settings = Object.assign({}, defaultSettings, options);
        this.hark = options.hark
        // this.onBattleRequest = options.onBattleRequest
        // this.onDrowsinessDetected = options.onDrowsinessDetected
        this._isOpen = false;
        this.eventListeners = new Map();
        this.connection = null;
        this.consumers = new Map();
        this.clients = new Map();
        this.localPeer = null;
        this.localUUID = null;
        this.localStream = null;
        this.username = this.settings.username;
        Object.keys(_EVENTS).forEach(event => {
            this.eventListeners.set(event, []);
        });

        this.initWebSocket();
        this.trigger(_EVENTS.onReady);
    }

    /**
     * Initializes the WebSocket connection
     * @private
     */
    initWebSocket() {
        try {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const url = `${protocol}://${window.location.hostname}:${this.settings.port}`;
            // 로컬 환경에선 ws://localhost:5111
            // 기획 1. 포트 포워딩으로 접근?
            // 기획 2. 배포 url은 protocol자체를 없애고 그냥 url로 변경해서 작업?
            // console.log(url);

            // server.js 객체
            this.connection = new WebSocket(url);
            
            // 여기서 data는 WebSocket이 메시지를 받았을 때, 콜백함수를 전달해준다는데... server.js 봐야할듯?
            this.connection.onmessage = (data) => this.handleMessage(data);
            this.connection.onclose = () => this.handleClose();
            this.connection.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.trigger(_EVENTS.onError, { type: 'websocket', error });
            };

            // 해당 웹 소켓이 열렸을 때, trigger로 바로 "onConnected"를 실행해서, SutdyRoom.tsx에서 지정한 것을 사용가능
            this.connection.onopen = event => {
                this.trigger(_EVENTS.onConnected, event);
                this._isOpen = true;
            };

            // Add connection timeout
            const timeout = setTimeout(() => {
                if (this.connection.readyState !== WebSocket.OPEN) {
                    this.trigger(_EVENTS.onError, { 
                        type: 'connection',
                        error: new Error('Connection timeout')
                    });
                    this.connection.close();
                }
            }, 10000); // 10 second timeout

            this.connection.addEventListener('open', () => clearTimeout(timeout));
        } catch (error) {
            console.error('Failed to initialize WebSocket:', error);
            this.trigger(_EVENTS.onError, { type: 'initialization', error });
        }
    }

    on(event, callback) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).push(callback);
        }
    }

    trigger(event, args = null) {
        if (this.eventListeners.has(event)) {
            this.eventListeners.get(event).forEach(callback => callback.call(this, args));
        }
    }

    static get EVENTS() {
        return _EVENTS;
    }

    get IsOpen() {
        return this._isOpen;
    }

    // findUserVideo(consumerId) {
    //     const video = document.querySelector(`#remote_${consumerId}`)
    //     // console.log("SimpleSFUClient.js video : ", video);
    //     if (!video) {
    //         return false;
    //     }
    //     return video
    // }

    // /**
    //  * 
    //  * @returns {Promise<MediaStream>}
    //  * @memberof SimpleSFUClient
    //  * @description This method will return a promise that resolves to a MediaStream object.
    //  * The MediaStream object will contain the white noise that you can use instead of an actual webcam video/audio.
    //  */
    // whiteNoise = () => {
    //     let canvas = document.createElement('canvas');
    //     canvas.width = 160;
    //     canvas.height = 120;
    //     let ctx = canvas.getContext('2d');
    //     let p = ctx.getImageData(0, 0, canvas.width, canvas.height);
    //     requestAnimationFrame(function draw() {
    //         for (var i = 0; i < p.data.length; i++) {
    //             p.data[i++] = p.data[i++] = p.data[i++] = Math.random() * 255;
    //         }
    //         ctx.putImageData(p, 0, 0);
    //         requestAnimationFrame(draw);
    //     });
    //     return canvas;
    // }

    // createVideoElement(username, stream, consumerId) {
    //     const video = document.createElement('video');
    //     video.id = `remote_${consumerId}`
    //     video.srcObject = stream;
    //     video.autoplay = true;
    //     video.muted
    //     return video;
    // }

    // // html에 직접 넣는 방식임
    // createDisplayName(username) {
    //     const nameContainer = document.createElement('div');
    //     nameContainer.classList.add('display_name')
    //     // textNode에서 사용자의 이름을 불러오는건 확인했음. this.username 혹은 arg username을 인식을 못하는거같은데.
    //     // const textNode = document.createTextNode("아");
    //     const textNode = document.createTextNode(this.username); // 현재는 undefined
    //     nameContainer.appendChild(textNode);
    //     return nameContainer;
    // }

    // /**
    //  * 
    //  * @param {*} video 
    //  * @param {*} username 
    //  * @returns {HTMLDivElement}
    //  */
    // createVideoWrapper(video, username, consumerId) {
    //     const div = document.createElement('div')
    //     div.id = `user_${consumerId}`;
    //     div.classList.add('videoWrap')
    //     div.appendChild(this.createDisplayName(username));
    //     div.appendChild(video);
    //     return div;
    // }



    /**
     * Handle incoming remote media tracks
     * @param {MediaStream} stream - The media stream containing the track
     * @param {string} username - The username associated with the track
     * @param {string} consumerId - The unique consumer ID
     * @private
     */
    async handleRemoteTrack(stream, username, consumerId) {        
        try {
            // const userVideo = this.findUserVideo(consumerId); 원래 simpleSFUClient에 있던 내용.
            // 직접 <div> query를 활용해서 탐색 후 해당 부분에 생성하는 방식
            // 우리 프로젝트에서는 WebcamGrid를 사용하기 때문에, 필요 없어서 삭제 시킨듯...;
            try {
                // Set up audio analysis with Hark
                const harkInstance = new hark(stream, {
                    play: false,           // don't play the stream
                    threshold: -65,        // voice activity detection threshold
                    interval: 100          // how often to check audio level
                });

                const handleVolumeChange = (dBs, threshold) => {
                    this.trigger(_EVENTS.onRemoteVolumeChange, { 
                        username, 
                        consumerId, 
                        dBs, 
                        threshold 
                    });
                };

                const handleStoppedSpeaking = () => {
                    this.trigger(_EVENTS.onRemoteStoppedSpeaking, { username, consumerId });
                };

                const handleSpeaking = () => {
                    this.trigger(_EVENTS.onRemoteSpeaking, { username, consumerId });
                };

                harkInstance.on('volume_change', handleVolumeChange);
                harkInstance.on('stopped_speaking', handleStoppedSpeaking);
                harkInstance.on('speaking', handleSpeaking);

                // Store hark instance for cleanup
                // video.harkInstance = harkInstance;
            } catch (error) {
                console.warn('Failed to initialize audio monitoring:', error);
            }

            // Create and add video wrapper to DOM
            // const div = this.createVideoWrapper(video, username, consumerId);
            // const container = this.videoContainer;
            // if (container) {
            //     container.appendChild(div);
            //     this.recalculateLayout();
            // } else {
            //     console.warn('Video container not found');
            // }

            // this.trigger(_EVENTS.onRemoteTrack, { stream, username, consumerId });
            
            // this.recalculateLayout();

        } catch (error) {
            console.error('Error handling remote track:', error);
            this.trigger(_EVENTS.onError, { 
                type: 'remote-track', 
                error,
                details: { username, consumerId } 
            });
        }
    }

    async handleIceCandidate({ candidate }) {
        if (candidate && candidate.candidate && candidate.candidate.length > 0) {
            const payload = {
                type: 'ice',
                ice: candidate,
                uqid: this.localUUID
            }
            this.connection.send(JSON.stringify(payload));
        }
    }

    handleConsumerIceCandidate(e, id, consumerId) {
        const { candidate } = e;
        if (candidate && candidate.candidate && candidate.candidate.length > 0) {
            const payload = {
                type: 'consumer_ice',
                ice: candidate,
                uqid: id,
                consumerId
            }
            this.connection.send(JSON.stringify(payload));
        }
    }

    handleConsume({ sdp, id, consumerId }) {
        const desc = new RTCSessionDescription(sdp);
        this.consumers.get(consumerId).setRemoteDescription(desc).catch(e => console.log(e));
        // console.log("remote conusmer? : ", this.consumers);
    }

    /**
     * Creates a new consumer transport for receiving media
     * @param {Object} peer - The peer to create the transport for
     * @returns {Promise<RTCPeerConnection>} The created consumer transport
     * @private
     */
    async createConsumeTransport(peer) {
        try {
            const consumerId = this.uuidv4();
            const consumerTransport = new RTCPeerConnection(this.settings.configuration);
            
            // console.log(consumerTransport)
            // console.log(consumerTransport.id)

            if (!this.clients.has(peer.id)) {
                throw new Error(`Client ${peer.id} not found`);
            }
            
            this.clients.get(peer.id).consumerId = consumerId;
            consumerTransport.id = consumerId;
            consumerTransport.peer = peer;
            
            this.consumers.set(consumerId, consumerTransport);
            // console.log("consumers", this.consumers);
            
            // Add transceivers for video and audio
            ['video', 'audio'].forEach(kind => {
                this.consumers.get(consumerId).addTransceiver(kind, { direction: "recvonly" });
            });

            // Set up connection state change handler
            consumerTransport.onconnectionstatechange = () => {
                this.trigger(_EVENTS.onConnectionStateChange, {
                    id: consumerId,
                    state: consumerTransport.connectionState
                });

                if (consumerTransport.connectionState === 'failed') {
                    this.trigger(_EVENTS.onError, {
                        type: 'connection',
                        error: new Error(`Consumer transport ${consumerId} failed`)
                    });
                }
            };

            // Create and set local description
            const offer = await this.consumers.get(consumerId).createOffer();
            await this.consumers.get(consumerId).setLocalDescription(offer);

            // Set up ICE candidate handling
            this.consumers.get(consumerId).onicecandidate = (e) => {
                this.handleConsumerIceCandidate(e, peer.id, consumerId);
            };

            // Set up track handling
            this.consumers.get(consumerId).ontrack = (e) => {
                console.log("stream object from webRTC ", e.streams[0]);
                // console.log("video & audio stream from webRTC ", e.streams[0].getTracks());
                // console.log("video stream from webRTC ", e.streams[0].getVideoTracks());
                // console.log("audio stream from webRTC ", e.streams[0].getAudioTracks());
                
                // this.handleRemoteTrack(e.streams[0], peer.username, consumerId);

                // temp add
                this.trigger(_EVENTS.onRemoteTrack, { id: peer.id, stream: e.streams[0], username: peer.username });
                // temp add end
            };

            return consumerTransport;
        } catch (error) {
            console.error('Failed to create consume transport:', error);
            this.trigger(_EVENTS.onError, { type: 'transport', error });
            throw error;
        }
    }

    async consumeOnce(peer) {
        const transport = await this.createConsumeTransport(peer);
        const payload = {
            type: 'consume',
            id: peer.id,
            consumerId: transport.id,
            sdp: await transport.localDescription
        }

        this.connection.send(JSON.stringify(payload))
    }

    async handlePeers({ peers }) {
        if (peers.length > 0) {
            for (const peer in peers) {
                this.clients.set(peers[peer].id, peers[peer]);
                // console.log("sfucli peers : ",peers);
                // this.trigger(_EVENTS.onPeers, peers);
                await this.consumeOnce(peers[peer]);
            }
        }
    }

    // temp add
    // async handlePeerslist({ peers }) {
    //     this.trigger(_EVENTS.onPeers, peers);
    // }
    
    async handleConsumerslist({ consumers }) {
        this.trigger(_EVENTS.onConsumers, consumers);
    }
    // temp add end

    handleAnswer({ sdp }) {
        const desc = new RTCSessionDescription(sdp);
        this.localPeer.setRemoteDescription(desc).catch(e => console.log(e));
    }

    async handleNewProducer({ id, username, trackInfo }) {
        if (id === this.localUUID || this.clients.has(id)) return;

        this.clients.set(id, { id, username, trackInfo });

        await this.consumeOnce({ id, username, trackInfo });
    }

    // server.js의 메시지 핸들러
    handleMessage({ data }) {
        const message = JSON.parse(data);
        // console.log("message : ", message);

        switch (message.type) {
            case 'join':
                this.localUUID = message.id;
                // console.log("sfu client : ", this.localUUID)
                this.trigger(_EVENTS.onUUIDAssigned, this.localUUID)
                break;
            case 'answer':
                this.handleAnswer(message);
                break;
            case 'peers':
                this.handlePeers(message);
                break;
            // temp add
            // case 'peerslist':
            //     this.handlePeerslist(message);
            //     this.trigger(_EVENTS.onPeers, message);
            //     break;
            case 'consumerslist':
                this.handleConsumerslist(message);
                this.trigger(_EVENTS.onConsumers, message);
                break;
            // temp add end
            case 'consume':
                this.handleConsume(message)
                this.trigger(_EVENTS.onConsumers, this.consumers)
                break
            case 'newProducer':
                this.handleNewProducer(message);
                break;
            case 'user_left':
                this.removeUser(message);
                break;

        }
    }

    removeUser({ id }) {
        if (this.clients.has(id)) {
            const { username, consumerId } = this.clients.get(id);
            this.consumers.delete(consumerId);
            this.clients.delete(id);
            
            this.trigger(_EVENTS.onLeave, { id, username, consumerId });
        }
    }

    /**
     * Connect to the SFU and start producing media
     * @returns {Promise<void>}
     */
    async connect() {
        try {
            // Request media with constraints
            const constraints = {
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 30 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log("media id check : ", stream);
            
            // Handle the local stream
            this.handleRemoteTrack(stream, this.username); // Local stream is handled separately in UI
            this.localStream = stream;

            // Create and set up peer connection
            this.localPeer = this.createPeer();
            
            // 서버는 미디어 중계만 하고, 실제 미디어 생성/재생은 브라우저가 직접 해야함. -gpt
            // local Peer로써, 똑같은 stream을 Peer에게 가지고 있게 함.
            // Add all tracks to the peer connection
            this.localStream.getTracks().forEach(track => {
                this.localPeer.addTrack(track, this.localStream);
                // console.log(this.localPeer.track);
                // Handle track ended events
                track.onended = () => {
                    this.trigger(_EVENTS.onStreamEnded, { track });
                };
            });

            // peer에서 관리하는 video, audio trak 접근해서 찍는 것
            // this.localPeer.getSenders().forEach(sender => {
            //     console.log(sender.track);
            // });


            // Set up connection state monitoring
            this.localPeer.onconnectionstatechange = () => {
                this.trigger(_EVENTS.onConnectionStateChange, {
                    state: this.localPeer.connectionState
                });

                if (this.localPeer.connectionState === 'failed') {
                    this.trigger(_EVENTS.onError, {
                        type: 'connection',
                        error: new Error('Local peer connection failed')
                    });
                }
            };

            await this.subscribe();
        } catch (error) {
            console.error('Failed to connect:', error);
            this.trigger(_EVENTS.onError, { type: 'connection', error });
            throw error;
        }
    }

    createPeer() {
        this.localPeer = new RTCPeerConnection(this.configuration);
        this.localPeer.onicecandidate = (e) => this.handleIceCandidate(e);
        //peer.oniceconnectionstatechange = checkPeerConnection;
        this.localPeer.onnegotiationneeded = () => this.handleNegotiation();
        return this.localPeer;
    }

    async subscribe() { // Consume media
        await this.consumeAll();
    }

    async consumeAll() {
        const payload = {
            type: 'getPeers',
            uqid: this.localUUID
        }

        this.connection.send(JSON.stringify(payload));
    }

    // server.js 연결 진입점
    async handleNegotiation(peer, type) {
        console.log('*** negoitating ***')
        const offer = await this.localPeer.createOffer();
        await this.localPeer.setLocalDescription(offer);

        // console.log("SimpleSFUClient line 562. localPeer : ", this.localPeer);
        // console.log("SimpleSFUClient line 563. localPeer.localDescription : ", this.localPeer.localDescription);
        // console.log("sfuclient uuid : ", this.localUUID);
        this.connection.send(JSON.stringify({ type: 'connect', sdp: this.localPeer.localDescription, uqid: this.localUUID, username: this.username }));
    }

    /**
     * Handles cleanup when the connection is closed
     * @private
     */
    handleClose() {
        try {
            // Stop all local tracks
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    try {
                        track.stop();
                    } catch (error) {
                        console.warn('Error stopping track:', error);
                    }
                });
                this.localStream = null;
            }

            // Close all consumer connections
            if (this.consumers) {
                this.consumers.forEach((consumer, id) => {
                    try {
                        consumer.close();
                    } catch (error) {
                        console.warn(`Error closing consumer ${id}:`, error);
                    }
                });
            }

            // Close local peer connection
            if (this.localPeer) {
                try {
                    this.localPeer.close();
                } catch (error) {
                    console.warn('Error closing local peer:', error);
                }
                this.localPeer = null;
            }

            // Clear collections
            this.consumers = new Map();
            this.clients = new Map();
            this._isOpen = false;

            // Clean up WebSocket
            if (this.connection) {
                this.connection.onclose = null;
                this.connection.onmessage = null;
                this.connection.onerror = null;
                this.connection = null;
            }

            this.trigger(_EVENTS.onStreamEnded);
        } catch (error) {
            console.error('Error in handleClose:', error);
            this.trigger(_EVENTS.onError, { type: 'cleanup', error });
        }
    }


    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}