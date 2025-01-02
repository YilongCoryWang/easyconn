import { ReactNode, useState } from "react";
import { CallStatus, CallStatusContext } from "./callStatusContext";

const initStatus = {
  call: "idle", //idle, negotiating, progress, complete
  video: "off" as const, //video feed status: "off" "enabled" "disabled" "complete"
  audio: "off" as const, //audio feed status: "off" "enabled" "disabled" "complete"
  audioDevice: "default",
  videoDevice: "default",
  shareScreen: false,
  haveMedia: false, //is there a localstream, has getUserStream been run
  haveCreatedOffer: false,
  haveCreatedAnswer: false,
  answererHaveAddedOffer: false,
  offer: null,
  answer: null,
};

export const CallStatusContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(initStatus);

  function updateCallStatus(key: keyof CallStatus, value: unknown) {
    setCallStatus((callStatus) =>
      Object.assign({ ...callStatus }, { [key]: value })
    );
  }

  const value = {
    callStatus,
    updateCallStatus,
  };

  return (
    <CallStatusContext.Provider value={value}>
      {children}
    </CallStatusContext.Provider>
  );
};
