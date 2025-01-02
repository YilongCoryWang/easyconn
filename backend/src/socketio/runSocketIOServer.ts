import { Socket, Server } from "socket.io";
import User from "../models/user";
import http from "http";
import newOfferListener from "./eventHandlers/newOfferListener";
import offererIceToServerListener from "./eventHandlers/offererIceToServerListener";
import newAnswerListener from "./eventHandlers/newAnswerListener";
import answererIceToServerListener from "./eventHandlers/answererIceToServerListener";

type Offer = {
  offererUuid: string;
  offer: RTCSessionDescriptionInit | null;
  offererIce: RTCIceCandidate[];
  answererUuid: string;
  answer: RTCSessionDescriptionInit | null;
  answererIce: RTCIceCandidate[];
};

export const offers: Offer[] = [];

type User = {
  uuid: string;
  socketId: string;
};

export const connectedUsers: User[] = [];

export type Friend = {
  _id?: string;
  uuid: string;
  userName: string;
  email: string;
  password: string;
  image: string;
  isCalling: boolean;
};

export type UserFriend = {
  _id?: string;
  userId: string;
  isCalling: boolean;
};

export function findOffer(offererUuid: string, answererUuid: string) {
  return offers.find(
    (o: Offer) =>
      o.offererUuid === offererUuid && o.answererUuid === answererUuid
  );
}

export async function findFriends(uuid: string) {
  const user = await User.findOne({ _id: uuid }, "friends");
  if (!user) {
    console.error("User not found", uuid);
    return [];
  } else {
    const friendsIds = user.friends.map((f) => f.userId.toString());
    const friends = await User.find(
      { _id: { $in: friendsIds } },
      "_id name email password image"
    );
    const newFriends = friends.map((f) => {
      const friend = user.friends.find(
        (friend) => friend.userId.toString() === f._id.toString()
      );
      return {
        uuid: f._id.toString(),
        name: f.name,
        email: f.email,
        password: f.password,
        image: f.image,
        isCalling: friend?.isCalling || false,
      };
    });
    return newFriends;
  }
}

const connectionHandler = async (socket: Socket) => {
  const uuid = socket.handshake.auth.uuid as string;
  console.log("a user connected", uuid, socket.id);
  const existingUser = connectedUsers.find((u) => u.uuid === uuid);
  if (!existingUser) {
    connectedUsers.push({ uuid, socketId: socket.id });
  }

  socket.emit("updateFriendList", await findFriends(uuid));

  //loop through all known offers and send out to the professional who just joined
  //the offers that belong to him
  const offerWaiting = offers.find((o) => o.answererUuid === uuid);
  if (!!offerWaiting) {
    socket.emit("newOfferWaiting", offerWaiting.offer);
    console.log("emit newOfferWaiting", uuid, socket.id);
  }

  newOfferListener(socket);
  offererIceToServerListener(socket);
  newAnswerListener(socket);
  answererIceToServerListener(socket);

  socket.on("disconnect", (reason) => {
    console.log("disconnect, reason", reason, socket.id);
  });
};

const runSocketIOServer = (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {},
  });

  io.on("connection", connectionHandler);
};
export default runSocketIOServer;
