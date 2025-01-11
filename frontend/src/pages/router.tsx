import { createBrowserRouter } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import OffererChat from "../mediaComponents/OffererChat";
import AnswererChat from "../mediaComponents/AnswererChat";
import Home from "./Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  { path: "/signup", element: <Signup /> },
  { path: "/home", element: <Home /> },
  { path: "/offererchat", element: <OffererChat /> },
  { path: "/answererchat", element: <AnswererChat /> },
]);

export default router;
