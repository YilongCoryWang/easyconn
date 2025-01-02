import { Socket } from "socket.io-client";
import { Streams } from "../contexts/streamsContext";

function offererListeners(socket: Socket, streams: Streams) {
  socket.on("answerToOfferer", async (answer) => {
    for (const s in streams) {
      if (s !== "localStream") {
        const pc = streams[s].peerConnection;
        if (pc) {
          await pc.setRemoteDescription(answer);
          console.log("answerToOfferer, added answer");
        }
      }
    }
  });

  socket.on("iceToOfferer", async (e) => {
    for (const sKey in streams) {
      if (sKey !== "localStream") {
        const pc = streams[sKey].peerConnection;
        if (pc) {
          pc.addIceCandidate(e);
          console.log("Added an iceCandidate to existing page presence");
        }
      }
    }
  });
}

export default offererListeners;
