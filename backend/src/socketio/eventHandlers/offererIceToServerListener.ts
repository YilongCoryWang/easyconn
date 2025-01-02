import { Socket } from "socket.io";
import { connectedUsers, findOffer } from "../runSocketIOServer";

const offererIceToServerListener = (socket: Socket) => {
  const eventHandler = ({
    ice,
    offererUuid,
    answererUuid,
  }: {
    ice: RTCIceCandidate;
    offererUuid: string;
    answererUuid: string;
  }) => {
    console.log("receved: offererIceToServer");
    const existingOffer = findOffer(offererUuid, answererUuid);
    if (!existingOffer) {
      return;
    }
    existingOffer.offererIce.push(ice);

    const answerer = connectedUsers.find((u) => u.uuid === answererUuid);
    if (!answerer) {
      return;
    }
    socket.to(answerer.socketId).emit("iceToAnswerer", ice);
    console.log("send iceToAnswerer");
  };

  socket.on("offererIceToServer", eventHandler);
};

export default offererIceToServerListener;
