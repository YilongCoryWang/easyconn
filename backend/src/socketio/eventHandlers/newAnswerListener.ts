import { Socket } from "socket.io";
import { connectedUsers, findOffer } from "../runSocketIOServer";

const newAnswerListener = (socket: Socket) => {
  const eventHandler = ({
    answer,
    offererUuid,
    answererUuid,
  }: {
    answer: RTCSessionDescription;
    offererUuid: string;
    answererUuid: string;
  }) => {
    console.log("newAnswer", offererUuid, answererUuid);
    const offer = findOffer(offererUuid, answererUuid);
    if (offer) {
      offer.answer = answer;
    }

    const offererSocket = connectedUsers.find((c) => c.uuid === offererUuid);
    if (offererSocket) {
      socket.to(offererSocket.socketId).emit("answerToOfferer", answer);
      console.log("emit answerToOfferer to", offererSocket.uuid);
    }
  };

  socket.on("newAnswer", eventHandler);
};

export default newAnswerListener;
