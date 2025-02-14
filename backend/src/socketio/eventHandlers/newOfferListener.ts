import {
  findCallingInfo,
  callings,
  connectedUsers,
} from "../runSocketIOServer";
import User from "../../models/user";
import { Socket } from "socket.io";

const newOfferListener = (socket: Socket) => {
  const newOfferHandler = async ({
    offer,
    offererUuid,
    answererUuid,
  }: {
    offer: RTCSessionDescription;
    offererUuid: string;
    answererUuid: string;
  }) => {
    if (!offererUuid || !answererUuid) {
      console.error("offererUuid or answererUuid is undefined");
      return;
    }
    console.log("received newOffer", offererUuid, answererUuid);
    const existingCallingInfo = findCallingInfo(offererUuid, answererUuid);
    if (existingCallingInfo) {
      existingCallingInfo.offer = offer;
    } else {
      const newCalling = {
        offererUuid,
        offer,
        offererIce: [],
        answererUuid,
        answer: null,
        answererIce: [],
      };
      callings.push(newCalling);
    }

    //update isCalling
    await User.findByIdAndUpdate(offererUuid, { isCalling: true });

    //find expected answerer
    const answerer = connectedUsers.find((u) => u.uuid === answererUuid);
    if (answerer) {
      socket.to(answerer.socketId).emit("newOfferWaiting", offer);
      console.log("send newOfferWaiting", answererUuid);

      const answererWithFriends = await User.findById(answererUuid, "friends", {
        _id: 0,
      }).populate({ path: "friends", select: "-__v -friends -password" });
      if (answererWithFriends) {
        socket
          .to(answerer.socketId)
          .emit("updateFriendList", answererWithFriends.friends);
        console.log("send updateFriendList", answererUuid);
      } else {
        console.error(
          `updateFriendList: Cannot find answererWithFriends: ${answererUuid}`,
          answererWithFriends
        );
      }
    } else {
      console.error(
        `updateFriendList: Cannot find ${answererUuid}`,
        connectedUsers
      );
    }
  };

  socket.on("newOffer", newOfferHandler);
};

export default newOfferListener;
