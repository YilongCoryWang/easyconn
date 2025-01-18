import { useEffect, useRef } from "react";
import createPeerConnection from "../utils/createPeerConnection";
import { useAddStream, useStreams } from "../contexts/streamsContext";
import AudioButton from "./AudioButton";
import VideoButton from "./VideoButton";
import {
  useCallStatus,
  useUpdateCallStatus,
} from "../contexts/callStatusContext";
import getSocket from "../utils/getSocket";
import { useSearchParams } from "react-router-dom";
import offererListeners from "../utils/offererListeners";
import HangUpButton from "./HangUpButton";

function OffererChat() {
  const [searchParams] = useSearchParams();
  const largeFeedRef = useRef<HTMLVideoElement | null>(null);
  const smallFeedRef = useRef<HTMLVideoElement | null>(null);
  const addStream = useAddStream();
  const { audio, video, haveCreatedOffer, haveMedia } = useCallStatus();
  const streams = useStreams();
  const updateCallStatus = useUpdateCallStatus();
  const offererUuid = searchParams.get("offerer");
  const answererUuid = searchParams.get("answerer");

  if (!offererUuid) {
    throw new Error("offererUuid is null");
  }

  if (!answererUuid) {
    throw new Error("answererUuid is null");
  }

  useEffect(() => {
    console.log("i am offerer");
    const socket = getSocket(offererUuid);
    offererListeners(socket, streams);
  }, [offererUuid, streams]);

  useEffect(() => {
    async function fetchMedia() {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        addStream("localStream", localStream, null);
        updateCallStatus("haveMedia", true);

        if (!offererUuid || !answererUuid) {
          throw new Error("Uuid is null");
        }
        const { peerConnection, remoteStream } = await createPeerConnection(
          offererUuid,
          answererUuid,
          "offererIceToServer"
        );
        if (largeFeedRef && largeFeedRef.current) {
          largeFeedRef.current.srcObject = remoteStream;
        }

        addStream("remote1", remoteStream, peerConnection);
      } catch (error) {
        console.log(error);
      }
    }

    if (haveMedia === false) {
      fetchMedia();
    }
  }, [
    addStream,
    searchParams,
    haveMedia,
    updateCallStatus,
    answererUuid,
    offererUuid,
  ]);

  useEffect(() => {
    const createOffer = async () => {
      for (const streamKey in streams) {
        if (streamKey !== "localStream") {
          const peerConnection = streams[streamKey].peerConnection;
          if (peerConnection) {
            const offer = await peerConnection.createOffer();
            peerConnection.setLocalDescription(offer); //triggers peerConnection icecandidate event
            if (!offererUuid || !answererUuid) {
              throw new Error("uuid is null");
            }
            const socket = getSocket(offererUuid);
            socket.emit("newOffer", {
              offer,
              offererUuid,
              answererUuid,
            });
          }
        }
      }
    };

    if (audio === "enabled" && video === "enabled" && !haveCreatedOffer) {
      createOffer();
      updateCallStatus("haveCreatedOffer", true);
    }
  }, [
    audio,
    video,
    haveCreatedOffer,
    streams,
    updateCallStatus,
    answererUuid,
    offererUuid,
  ]);

  return (
    // background
    <div className="flex justify-center items-center bg-zinc-800 text-gray-100 relative">
      {/* video container */}
      <div className="w-full rounde-xl">
        {/* large video */}
        <video
          className="w-screen h-screen"
          ref={largeFeedRef}
          id="local-feed"
          autoPlay
          playsInline
        ></video>
        {/* small video */}
        <video
          className="absolute top-0 right-0 w-1/4 h-1/4"
          ref={smallFeedRef}
          id="remote-feed"
          autoPlay
          playsInline
        ></video>
      </div>

      {/* control bar */}
      <div className="flex justify-around text-2xl items-center absolute w-full h-20 bottom-0 bg-slate-900">
        <AudioButton />
        <VideoButton smallFeedRef={smallFeedRef} />
        <HangUpButton
          smallFeedRef={smallFeedRef}
          largeFeedRef={largeFeedRef}
          userId={offererUuid}
        />
      </div>
    </div>
  );
}

export default OffererChat;
