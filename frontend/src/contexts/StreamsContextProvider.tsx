import { ReactNode, useState } from "react";
import { StreamsContext } from "./streamsContext";

export type Streams = {
  [key: string]: {
    stream: MediaStream;
    peerConnection: RTCPeerConnection;
  };
};

export const StreamsContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [streams, setStreams] = useState<Streams>({});

  const addStream = (
    role: string,
    stream: MediaStream,
    peerConnection: RTCPeerConnection | null
  ) => {
    setStreams((streams) =>
      Object.assign(streams, { [role]: { stream, peerConnection } })
    );
  };

  const value = {
    streams,
    addStream,
  };

  return (
    <StreamsContext.Provider value={value}>{children}</StreamsContext.Provider>
  );
};
