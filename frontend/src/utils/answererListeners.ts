import { Socket } from "socket.io-client";
import { Streams } from "../contexts/streamsContext";

function answererListeners(socket: Socket, streams: Streams) {
  socket.on("iceToAnswerer", async (e) => {
    console.log("iceToAnswerer", e);
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

export default answererListeners;
