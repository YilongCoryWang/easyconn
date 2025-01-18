import { Socket } from "socket.io";
import { connectedUsers, findCallingInfo } from "../runSocketIOServer";
import User from "../../models/user";

const newAnswerListener = (socket: Socket) => {
  const eventHandler = async ({
    answer,
    offererUuid,
    answererUuid,
  }: {
    answer: RTCSessionDescription;
    offererUuid: string;
    answererUuid: string;
  }) => {
    console.log("newAnswer", offererUuid, answererUuid);
    const callingInfo = findCallingInfo(offererUuid, answererUuid);
    if (callingInfo) {
      callingInfo.answer = answer;
    } else {
      console.error(
        "Cannot find existing CallingInfo of",
        offererUuid,
        answererUuid
      );
      return;
    }

    await User.findByIdAndUpdate(answererUuid, { isCalling: true });

    const offererSocket = connectedUsers.find((c) => c.uuid === offererUuid);
    if (offererSocket) {
      socket.to(offererSocket.socketId).emit("answerToOfferer", answer);
      console.log("emit answerToOfferer to", offererSocket.uuid);
    }
  };

  socket.on("newAnswer", eventHandler);
};

export default newAnswerListener;
