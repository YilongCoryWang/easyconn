import { ReactNode } from "react";
import { ConfigContext } from "./configContext";

function ConfigContextProvider({ children }: { children: ReactNode }) {
  const value = {
    resourceURL: "http://localhost:9000/assets",
  };
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export default ConfigContextProvider;
