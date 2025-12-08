export const EVENTS = {
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
  onRemoteVolumeChange: 'onRemoteVolumeChange',
  onJoined: "joined"
} as const;

export type EventKey = keyof typeof EVENTS;
