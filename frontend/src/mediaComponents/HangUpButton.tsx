import React, { useEffect, useState } from "react";
import { useStreams } from "../contexts/streamsContext";
import getSocket from "../utils/getSocket";

function HangUpButton({
  smallFeedRef,
  largeFeedRef,
  userId,
}: {
  smallFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
  largeFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
  userId: string;
}) {
  const streams = useStreams();
  const [isHangUp, setIsHangUp] = useState<boolean>(false);

  useEffect(() => {
    if (isHangUp) {
      const socket = getSocket(userId);
      console.log("hangup", userId, socket.id);
      socket.emit("hangup", { userId });
    }
  }, [isHangUp, userId]);

  const handleHangUp = async () => {
    if (smallFeedRef && smallFeedRef.current) {
      smallFeedRef.current.srcObject = null;
    }

    if (largeFeedRef && largeFeedRef.current) {
      largeFeedRef.current.srcObject = null;
    }
    for (const key in streams) {
      if (streams[key].peerConnection) {
        streams[key].peerConnection.close();
        streams[key].peerConnection.onicecandidate = null;
        streams[key].peerConnection.ontrack = null;
        streams[key].peerConnection = null;
      }
      streams[key].stream
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));
      streams[key].stream
        .getVideoTracks()
        .forEach((track) => (track.enabled = false));
    }

    setIsHangUp(true);
  };

  return (
    <button className={`${isHangUp && "hidden"}`} onClick={handleHangUp}>
      Hang Up
    </button>
  );
}

export default HangUpButton;
