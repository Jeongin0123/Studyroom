import { EVENTS, EventKey } from "../events.js";
import hark from '../hark.js'

type Listener = (...args: any[]) => void;

export default class SimpleSFUClient {
  settings: any;
  eventListeners: Map<string, Listener[]>;
  connection: WebSocket | null;
  localPeer: RTCPeerConnection | null;
  localStream: MediaStream | null;
  localUUID: string | null;
  consumers: Map<string, RTCPeerConnection>;
  clients: Map<string, any>;
  iceQueue: any[]; // ICE 후보 임시 저장

  constructor(options?: any) {
    const defaultSettings = {
      port: 5111,
      configuration: {
        iceServers: [
          { urls: "stun:stun.stunprotocol.org:3478" },
          { urls: "stun:stun.l.google.com:19302" },
        ],
      },
    };

    this.settings = { ...defaultSettings, ...options };
    this.eventListeners = new Map();
    this.connection = null;
    this.localPeer = null;
    this.localStream = null;
    this.localUUID = null;
    this.consumers = new Map();
    this.clients = new Map();
    this.iceQueue = [];

    Object.values(EVENTS).forEach((e) => this.eventListeners.set(e, []));

    this.initWebSocket();
    this.trigger(EVENTS.onReady);
    
    this.on(EVENTS.onJoin, () => {
      this.connect(); // UUID 받으면 자동으로 connect 호출
    });
  }

  on(event: EventKey, callback: Listener) {
    const list = this.eventListeners.get(event);
    if (list) list.push(callback);
  }

  off(event: EventKey, callback: Listener) {
    const list = this.eventListeners.get(event);
    if (list) {
      this.eventListeners.set(
        event,
        list.filter((fn) => fn !== callback)
      );
    }
  }

  trigger(event: EventKey, data?: any) {
    const list = this.eventListeners.get(event);
    list?.forEach((fn) => fn(data));
  }

  initWebSocket() {
    // this.connection = new WebSocket(`ws://localhost:${this.settings.port}`);
    this.connection = new WebSocket(`ws://localhost:5111`);

    this.connection.onopen = () => {
      this.trigger(EVENTS.onConnected);
    };

    this.connection.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      this.handleMessage(data);
      // console.log("websocket msg : ", msg);
    };
  }

  handleMessage(msg: any) {
    switch (msg.type) {
      case "joined":
        this.localUUID = msg.id;
        console.log("joined UUID:", msg.id);
        this.trigger(EVENTS.onJoin, msg.id);

        // UUID 할당 후 connect 호출 가능
        if (this.iceQueue.length > 0 && this.localPeer) {
          // UUID가 할당되기 전에 발생한 ICE candidate 적용
          this.iceQueue.forEach((ice) => {
            this.connection?.send(
              JSON.stringify({
                type: "ice",
                ice,
                uqid: this.localUUID,
              })
            );
          });
          this.iceQueue = [];
        }
        break;

      case "consume":
         console.log("consume 메시지 확인:", msg); // ✅ 여기에 추가
        this.handleConsume(msg);
        break;

      default:
        break;
    }
  }

  async connect() {
    if (!this.localUUID) {
      console.warn("UUID가 아직 서버에서 할당되지 않았습니다. 'joined' 이벤트 후 connect 호출 필요");
      return;
    }

    this.localPeer = new RTCPeerConnection(this.settings.configuration);

    this.localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // console.log("로컬 스트림 가져옴:", this.localStream);
    // console.log("로컬 트랙:", this.localStream.getTracks());

    this.localStream.getTracks().forEach((t) =>
      this.localPeer!.addTrack(t, this.localStream!)
    );

    this.trigger(EVENTS.onStreamStarted, this.localStream);

    // onicecandidate 등록
    this.localPeer.onicecandidate = (e) => {
      if (e.candidate) {
        if (!this.localUUID) {
          // 아직 UUID가 없는 경우 큐에 저장
          this.iceQueue.push(e.candidate);
        } else {
          this.connection?.send(
            JSON.stringify({
              type: "ice",
              ice: e.candidate,
              uqid: this.localUUID,
            })
          );
        }
      }
    };

    const offer = await this.localPeer.createOffer();
    await this.localPeer.setLocalDescription(offer);

    // connect 메시지 전송
    this.connection?.send(
      JSON.stringify({
        type: "connect",
        sdp: offer,
        uqid: this.localUUID, // 서버에서 body.uqid로 사용
        username: "me", // 사용자 닉네임으로 수정필요
      })
    );
  }

  async handleRemoteTrack(stream: MediaStream, consumerId: string) {
    try {
      // 이벤트 트리거 (React에서 DOM 렌더링하도록)
      this.trigger(EVENTS.onRemoteTrack, { stream, consumerId });

      // 🔊 ----- HARK 음성 감지 설정 -----
      try {
        const harkInstance = new hark(stream, {
          play: false,
          threshold: -65,
          interval: 100
        });

        // volume_change
        harkInstance.on("volume_change", (dBs: number, threshold: number) => {
          this.trigger(EVENTS.onRemoteVolumeChange, {
            consumerId,
            dBs,
            threshold
          });
        });

        // speaking
        harkInstance.on("speaking", () => {
          this.trigger(EVENTS.onRemoteSpeaking, { consumerId });
        });

        // stopped_speaking
        harkInstance.on("stopped_speaking", () => {
          this.trigger(EVENTS.onRemoteStoppedSpeaking, { consumerId });
        });

        // 소비자(peer) 객체에 hark instance 저장 (cleanup 용)
        const peer = this.consumers.get(consumerId);
        if (peer) {
          // @ts-ignore
          peer.harkInstance = harkInstance;
        }

      } catch (err) {
        console.warn("Hark 초기화 실패:", err);
      }

    } catch (err) {
      console.error("Error in handleRemoteTrack:", err);
      this.trigger(EVENTS.onError, {
        type: "remote-track",
        error: err,
        details: { consumerId }
      });
    }
  }

  async handleConsume({ sdp, id, consumerId }: any) {
    const desc = new RTCSessionDescription(sdp);

    let peer = this.consumers.get(consumerId);
    if (!peer) {
      peer = new RTCPeerConnection(this.settings.configuration);
      this.consumers.set(consumerId, peer);

      // peer.ontrack = (e) => {
      //   // console.log("Remote track received:", e.streams[0], "consumerId:", consumerId);
      //   this.trigger(EVENTS.onRemoteTrack, {
      //     stream: e.streams[0],
      //     consumerId,
      //   });
      // };
      peer.ontrack = (e) => {
        this.handleRemoteTrack(e.streams[0], consumerId);
      };


      peer.onicecandidate = (e) => {
        if (e.candidate) {
          this.connection?.send(
            JSON.stringify({
              type: "consumer_ice",
              ice: e.candidate,
              uqid: id,
              consumerId,
            })
          );
        }
      };

      peer.addTransceiver("video", { direction: "recvonly" });
      peer.addTransceiver("audio", { direction: "recvonly" });
    }

    await peer.setRemoteDescription(desc);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    this.connection?.send(
      JSON.stringify({
        type: "consume_ack",
        sdp: answer,
        id,
        consumerId,
      })
    );
  }
}
