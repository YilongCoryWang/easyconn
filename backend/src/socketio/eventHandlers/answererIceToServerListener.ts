import { Socket } from "socket.io";
import { connectedUsers, findOffer } from "../runSocketIOServer";

const answererIceToServerListener = (socket: Socket) => {
  const eventHandler = ({
    ice,
    offererUuid,
    answererUuid,
  }: {
    ice: RTCIceCandidate;
    offererUuid: string;
    answererUuid: string;
  }) => {
    console.log("receved: answererIceToServer");
    const existingOffer = findOffer(offererUuid, answererUuid);
    if (!existingOffer) {
      return;
    }
    existingOffer.answererIce.push(ice);
    const offerer = connectedUsers.find((u) => u.uuid === offererUuid);
    if (!offerer) {
      return;
    }
    socket.to(offerer.socketId).emit("iceToOfferer", ice);
    console.log("send iceToOfferer");
  };

  socket.on("answererIceToServer", eventHandler);
};

export default answererIceToServerListener;
