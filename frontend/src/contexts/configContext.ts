import { createContext, useContext } from "react";

type Config = {
  resourceURL: string;
};

export const ConfigContext = createContext<Config | null>(null);

export const useResourceURL = () => {
  const ctx = useContext(ConfigContext);
  if (!ctx) {
    throw new Error("useResourceURL must be used within an ConfigProvider");
  }
  return ctx.resourceURL;
};
