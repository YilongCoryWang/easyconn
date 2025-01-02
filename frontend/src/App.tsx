import { StreamsContextProvider } from "./contexts/StreamsContextProvider";
import { CallStatusContextProvider } from "./contexts/CallStatusContextProvider";
import { RouterProvider } from "react-router-dom";
import router from "./pages/router";
import ConfigContextProvider from "./contexts/ConfigContextProvider";

function App() {
  return (
    <CallStatusContextProvider>
      <StreamsContextProvider>
        <ConfigContextProvider>
          <RouterProvider router={router} />
        </ConfigContextProvider>
      </StreamsContextProvider>
    </CallStatusContextProvider>
  );
}

export default App;
