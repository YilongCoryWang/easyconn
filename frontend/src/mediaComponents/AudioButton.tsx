import {
  MediaStates,
  useCallStatus,
  useUpdateCallStatus,
} from "../contexts/callStatusContext";
import { useStreams } from "../contexts/streamsContext";
import addMediaTracks from "../utils/addMediaTracks";

function getBtnText(audioState: MediaStates) {
  if (audioState === "off") {
    return "Join Audio";
  } else if (audioState === "enabled") {
    return "Disable Audio";
  } else if (audioState === "disabled") {
    return "Enable Audio";
  }
  return "No Audio";
}

function AudioButton() {
  const { audio } = useCallStatus();
  const streams = useStreams();
  const udpateCallStatus = useUpdateCallStatus();
  const btnText = getBtnText(audio);

  const startStopAudio = () => {
    if (audio === "off") {
      addMediaTracks(streams, "audio");
      udpateCallStatus("audio", "enabled");
    } else if (audio === "enabled") {
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((t) => (t.enabled = false));
      udpateCallStatus("audio", "disabled");
    } else if (audio === "disabled") {
      const tracks = streams.localStream.stream.getAudioTracks();
      tracks.forEach((t) => (t.enabled = true));
      udpateCallStatus("audio", "enabled");
    }
  };

  return <button onClick={startStopAudio}>{btnText}</button>;
}

export default AudioButton;
