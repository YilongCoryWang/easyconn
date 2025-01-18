import { Socket, Server } from "socket.io";
import User from "../models/user";
import http from "http";
import newOfferListener from "./eventHandlers/newOfferListener";
import offererIceToServerListener from "./eventHandlers/offererIceToServerListener";
import newAnswerListener from "./eventHandlers/newAnswerListener";
import answererIceToServerListener from "./eventHandlers/answererIceToServerListener";
import mongoose from "mongoose";

type CallingInfo = {
  offererUuid: string;
  offer: RTCSessionDescriptionInit | null;
  offererIce: RTCIceCandidate[];
  answererUuid: string;
  answer: RTCSessionDescriptionInit | null;
  answererIce: RTCIceCandidate[];
};

export let callings: CallingInfo[] = [];

type User = {
  uuid: string;
  socketId: string;
};

export let connectedUsers: User[] = [];

export type Friend = {
  _id?: typeof mongoose.Schema.ObjectId;
  uuid: typeof mongoose.Schema.ObjectId;
  name: string;
  email: string;
  image: string;
};

export function findCallingInfo(offererUuid: string, answererUuid: string) {
  return callings.find(
    (o: CallingInfo) =>
      o.offererUuid === offererUuid && o.answererUuid === answererUuid
  );
}

export async function findFriends(uuid: string) {
  const user = await User.findById(uuid, "friends").populate({
    path: "friends",
    select: "-__v -friends -password",
  });

  if (!user) {
    console.error("User not found", uuid);
    return [];
  } else {
    return user.friends;
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

  //loop through all known callingInfo and send out to the answerer who just joined
  //the calling that belong to him
  const calling = callings.find((o) => o.answererUuid === uuid);
  if (!!calling) {
    socket.emit("newOfferWaiting", calling.offer);
    console.log("emit newOfferWaiting", uuid, socket.id);
  }

  newOfferListener(socket);
  offererIceToServerListener(socket);
  newAnswerListener(socket);
  answererIceToServerListener(socket);

  socket.on("hangup", async ({ userId }) => {
    console.log("hangup", userId);
    callings = callings.filter(({ offererUuid, answererUuid }) => {
      offererUuid !== userId && answererUuid !== userId;
    });
    const r = await User.findByIdAndUpdate(userId, { isCalling: false });
  });

  socket.on("disconnect", (reason) => {
    connectedUsers = connectedUsers.filter(
      ({ socketId }) => socketId !== socket.id
    );
    console.log("disconnect, reason", reason, socket.id, connectedUsers);
  });
};

const runSocketIOServer = (httpServer: http.Server) => {
  const io = new Server(httpServer, {
    cors: {},
  });

  io.on("connection", connectionHandler);
};
export default runSocketIOServer;
