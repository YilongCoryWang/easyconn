import { Socket } from "socket.io";
import { connectedUsers, findCallingInfo } from "../runSocketIOServer";

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
    const existingCallingInfo = findCallingInfo(offererUuid, answererUuid);
    if (!existingCallingInfo) {
      console.error(
        "Cannot find existing CallingInfo of",
        offererUuid,
        answererUuid
      );
      return;
    }
    existingCallingInfo.answererIce.push(ice);
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
