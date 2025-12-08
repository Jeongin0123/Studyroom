import { useRef, useEffect } from "react";
import SimpleSFUClient from "./temp/SimpleSFUClient.js";
import hark from "./hark.js";

export function useSFUClient() {
  const clientRef = useRef<SimpleSFUClient | null>(null);
  // 기본 threshold를 변경할꺼면, SimpleSFUClient.js 참조
  // const speech = hark(MediaStream, { threshold: -50});

  useEffect(() => {
    clientRef.current = new SimpleSFUClient();
    
    return () => {
      // TODO: PeerConnection/WS clean-up
    };
  }, []);

  return clientRef;
}
