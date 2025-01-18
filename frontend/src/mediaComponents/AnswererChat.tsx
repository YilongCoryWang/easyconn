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
import HangUpButton from "./HangUpButton";
import answererListeners from "../utils/answererListeners";

function AnswererChat() {
  const [searchParams] = useSearchParams();
  const largeFeedRef = useRef<HTMLVideoElement | null>(null);
  const smallFeedRef = useRef<HTMLVideoElement>(null);
  const streams = useStreams();
  const addStream = useAddStream();
  const {
    audio,
    video,
    haveCreatedAnswer,
    haveMedia,
    offer,
    answererHaveAddedOffer,
  } = useCallStatus();
  const updateCallStatus = useUpdateCallStatus();
  const offererUuid = searchParams.get("offerer");
  const answererUuid = searchParams.get("answerer");
  console.log("render:::answer chat window offer", offer);

  if (!offererUuid) {
    throw new Error("offererUuid is null");
  }

  if (!answererUuid) {
    throw new Error("answererUuid is null");
  }

  useEffect(() => {
    console.log("i am answerer", answererUuid);
    const socket = getSocket(answererUuid);

    answererListeners(socket, streams);
  }, [answererUuid, streams]);

  useEffect(() => {
    const addOffer = async () => {
      console.log("addOffer");
      for (const s in streams) {
        if (s !== "localStream") {
          const pc = streams[s].peerConnection;
          if (pc) {
            await pc.setRemoteDescription(offer!);
            updateCallStatus("answererHaveAddedOffer", true);
          }
        }
      }
    };

    if (offer && answererHaveAddedOffer === false) {
      addOffer();
    }
  }, [answererHaveAddedOffer, offer, streams, updateCallStatus]);

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
          "answererIceToServer"
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
    offererUuid,
    answererUuid,
  ]);

  useEffect(() => {
    const createAnswer = async () => {
      for (const streamKey in streams) {
        if (streamKey !== "localStream") {
          const peerConnection = streams[streamKey].peerConnection;
          console.log(streamKey, peerConnection);
          if (peerConnection) {
            const answer = await peerConnection.createAnswer();
            peerConnection.setLocalDescription(answer); //triggers peerConnection icecandidate event

            const socket = getSocket(answererUuid);
            socket.emit("newAnswer", {
              answer,
              offererUuid,
              answererUuid,
            });
          }
        }
      }
    };

    if (
      audio === "enabled" &&
      video === "enabled" &&
      haveCreatedAnswer === false &&
      answererHaveAddedOffer
    ) {
      createAnswer();
      updateCallStatus("haveCreatedAnswer", true);
    }
  }, [
    audio,
    video,
    haveCreatedAnswer,
    streams,
    updateCallStatus,
    offererUuid,
    answererUuid,
    answererHaveAddedOffer,
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
          autoPlay
          playsInline
        ></video>
        {/* small video */}
        <video
          className="absolute top-0 right-0 w-1/4 h-1/4"
          ref={smallFeedRef}
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
          userId={answererUuid}
        />
      </div>
    </div>
  );
}

export default AnswererChat;
