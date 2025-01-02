import { createContext, useContext } from "react";

export type Streams = {
  [role: string]: {
    stream: MediaStream;
    peerConnection: RTCPeerConnection | null;
  };
};

type StreamsContextType = {
  streams: Streams;
  addStream: (
    role: string,
    stream: MediaStream,
    peerConnection: RTCPeerConnection | null
  ) => void;
};

export const StreamsContext = createContext<StreamsContextType | null>(null);

export const useStreams = () => {
  const streamsCtx = useContext(StreamsContext);
  if (streamsCtx == null) {
    throw new Error("useStreams must be used within a StreamsProvider");
  }
  return streamsCtx.streams;
};

export const useAddStream = () => {
  const streamsCtx = useContext(StreamsContext);
  if (streamsCtx == null) {
    throw new Error("useAddStream must be used within a StreamsProvider");
  }
  return streamsCtx.addStream;
};
