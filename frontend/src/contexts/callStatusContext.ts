import { createContext, useContext } from "react";

export type MediaStates = "off" | "enabled" | "disabled" | "complete";

export type CallStatus = {
  call: string;
  video: MediaStates;
  audio: MediaStates;
  audioDevice: string;
  videoDevice: string;
  shareScreen: boolean;
  haveMedia: boolean;
  haveCreatedOffer: boolean;
  haveCreatedAnswer: boolean;
  answererHaveAddedOffer: boolean;
  offer: RTCSessionDescription | null;
  answer: RTCSessionDescription | null;
};

type CallStatusContext = {
  callStatus: CallStatus;
  updateCallStatus: (key: keyof CallStatus, value: unknown) => void;
};

export const CallStatusContext = createContext<CallStatusContext | null>(null);

export const useCallStatus = () => {
  const callStatusCtx = useContext(CallStatusContext);
  if (callStatusCtx == null) {
    throw new Error("useCallStatus must be used within an CallStatusProvider");
  }
  return callStatusCtx.callStatus;
};

export const useUpdateCallStatus = () => {
  const callStatusCtx = useContext(CallStatusContext);
  if (callStatusCtx == null) {
    throw new Error(
      "useUpdateCallStatus must be used within an CallStatusProvider"
    );
  }
  return callStatusCtx.updateCallStatus;
};
