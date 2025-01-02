import { Streams } from "../contexts/streamsContext";

type MediaTypes = "audio" | "video";

const addMediaTracks = (streams: Streams, type: MediaTypes) => {
  const localStream = streams.localStream;
  for (const streamKey in streams) {
    if (streamKey !== "localStream") {
      const peerConnection = streams[streamKey].peerConnection;
      let tracks;
      if (type === "audio") {
        tracks = localStream.stream.getAudioTracks();
      } else {
        tracks = localStream.stream.getVideoTracks();
      }

      tracks.forEach((t) => {
        if (peerConnection) {
          peerConnection.addTrack(t, localStream.stream);
        }
      });
    }
  }
};

export default addMediaTracks;
