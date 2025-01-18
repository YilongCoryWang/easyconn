import React, { useEffect, useState } from "react";
import { useStreams } from "../contexts/streamsContext";
import getSocket from "../utils/getSocket";
import { User } from "../uiComponents/FriendCard";
import { useNavigate } from "react-router-dom";

function HangUpButton({
  smallFeedRef,
  largeFeedRef,
  userId,
  user,
}: {
  smallFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
  largeFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
  userId: string;
  user: User;
}) {
  const streams = useStreams();
  const [isHangUp, setIsHangUp] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isHangUp) {
      const socket = getSocket(userId);
      console.log("hangup", userId, socket.id);
      socket.emit("hangup", { userId });
      navigate("/home", { state: user });
    }
  }, [isHangUp, userId, navigate, user]);

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
