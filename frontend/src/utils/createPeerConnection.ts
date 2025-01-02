import getSocket from "./getSocket.ts";
import peerConfiguration from "./stunServers.ts";

const createPeerConnection = async (
  offererUuid: string,
  answererUuid: string,
  event: string
) => {
  const peerConnection = new RTCPeerConnection(peerConfiguration);
  const remoteStream = new MediaStream();

  peerConnection.addEventListener("icecandidate", (e) => {
    console.log("icecandidate event", e);
    const socketUuid =
      event === "offererIceToServer" ? offererUuid : answererUuid;
    const socket = getSocket(socketUuid);
    socket.emit(event, {
      offererUuid,
      answererUuid,
      ice: e.candidate,
    });
  });

  peerConnection.addEventListener("track", (e) => {
    console.log("Track event...", e);
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track);
    });
  });
  return { peerConnection, remoteStream };
};
export default createPeerConnection;
