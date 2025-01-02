import React from "react";
import { useStreams } from "../contexts/streamsContext";

function HangUpButton({
  smallFeedRef,
  largeFeedRef,
}: {
  smallFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
  largeFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const streams = useStreams();

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
  };

  return <button onClick={handleHangUp}>Hang Up</button>;
}

export default HangUpButton;
