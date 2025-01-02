import {
  findOffer,
  offers,
  UserFriend,
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
    const answererFriends = await User.findOne(
      { _id: answererUuid },
      "friends",
      {
        _id: 0,
      }
    ).exec();

    if (!answererFriends) throw new Error(`User ${answererUuid} doesn't exist`);

    const newFriends = answererFriends.friends
      .toObject()
      .map((f: UserFriend) => {
        delete f._id;
        if (f.userId.toString() === offererUuid) {
          return { ...f, isCalling: true };
        }
        return f;
      });
    await User.findOneAndUpdate({ _id: answererUuid }, { friends: newFriends });

    //find expected answerer
    const answerer = connectedUsers.find((u) => u.uuid === answererUuid);
    if (answerer) {
      socket.to(answerer.socketId).emit("newOfferWaiting", offer);
      console.log("send newOfferWaiting", answererUuid);

      socket
        .to(answerer.socketId)
        .emit("updateFriendList", await findFriends(answererUuid));
      console.log("send updateFriendList", answererUuid);
    }
  };

  socket.on("newOffer", newOfferHandler);
};

export default newOfferListener;
