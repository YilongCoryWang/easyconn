import {
  findOffer,
  offers,
  connectedUsers,
  findFriends,
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
    const existingOffer = findOffer(offererUuid, answererUuid);
    if (existingOffer) {
      existingOffer.offer = offer;
    } else {
      const newOffer = {
        offererUuid,
        offer,
        offererIce: [],
        answererUuid,
        answer: null,
        answererIce: [],
      };
      offers.push(newOffer);
    }

    //update isCalling
    await User.findByIdAndUpdate(offererUuid, { isCalling: true });
    const answererFriends = await User.findById(answererUuid, "friends", {
      _id: 0,
    }).populate({ path: "friends", select: "-__v -friends -password" });
    if (!answererFriends) console.error(`User ${answererUuid} doesn't exist`);

    //find expected answerer
    const answerer = connectedUsers.find((u) => u.uuid === answererUuid);
    if (answerer) {
      socket.to(answerer.socketId).emit("newOfferWaiting", offer);
      console.log("send newOfferWaiting", answererUuid);

      socket.to(answerer.socketId).emit("updateFriendList", answererFriends);
      console.log("send updateFriendList", answererUuid);
    }
  };

  socket.on("newOffer", newOfferHandler);
};

export default newOfferListener;
