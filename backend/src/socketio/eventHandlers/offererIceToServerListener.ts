import { Socket } from "socket.io";
import { connectedUsers, findCallingInfo } from "../runSocketIOServer";

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
    const existingCallingInfo = findCallingInfo(offererUuid, answererUuid);
    if (!existingCallingInfo) {
      console.error(
        "Cannot find existing CallingInfo of",
        offererUuid,
        answererUuid
      );
      return;
    }
    existingCallingInfo.offererIce.push(ice);

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
