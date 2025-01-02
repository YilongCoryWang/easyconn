import { io, Socket } from "socket.io-client";

let socket: Socket;
function getSocket(uuid: string) {
  if (socket && socket.connected) {
    return socket;
  }
  socket = io("http://localhost:9000", {
    auth: { uuid },
  });
  return socket;
}

export default getSocket;
