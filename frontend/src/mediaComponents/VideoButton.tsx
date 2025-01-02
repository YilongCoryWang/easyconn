import {
  MediaStates,
  useCallStatus,
  useUpdateCallStatus,
} from "../contexts/callStatusContext";
import { useStreams } from "../contexts/streamsContext";
import addMediaTracks from "../utils/addMediaTracks";

function getBtnText(videoState: MediaStates) {
  if (videoState === "off") {
    return "Join Video";
  } else if (videoState === "enabled") {
    return "Disable Video";
  } else if (videoState === "disabled") {
    return "Enable Video";
  }
  return "No Video";
}

function VideoButton({
  smallFeedRef,
}: {
  smallFeedRef: React.MutableRefObject<HTMLVideoElement | null>;
}) {
  const { video, haveMedia } = useCallStatus();
  const streams = useStreams();
  const udpateCallStatus = useUpdateCallStatus();
  const btnText = getBtnText(video);

  const startStopVideo = () => {
    if (video === "off" && haveMedia && smallFeedRef && smallFeedRef.current) {
      smallFeedRef.current.srcObject = streams.localStream.stream;

      // if (video === "off") {
      addMediaTracks(streams, "video");
      udpateCallStatus("video", "enabled");
    } else if (video === "enabled") {
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((t) => (t.enabled = false));
      udpateCallStatus("video", "disabled");
    } else if (video === "disabled") {
      const tracks = streams.localStream.stream.getVideoTracks();
      tracks.forEach((t) => (t.enabled = true));
      udpateCallStatus("video", "enabled");
    }
  };

  return <button onClick={startStopVideo}>{btnText}</button>;
}

export default VideoButton;
