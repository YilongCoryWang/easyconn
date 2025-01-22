import { createBrowserRouter } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Home from "./Home";
import Profile from "./Profile";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import OffererChat from "../mediaComponents/OffererChat";
import AnswererChat from "../mediaComponents/AnswererChat";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  { path: "/signup", element: <Signup /> },
  { path: "/forgot-password", element: <ForgotPassword /> },
  { path: "/reset-password/:token", element: <ResetPassword /> },
  { path: "/home", element: <Home /> },
  { path: "/profile/:uuid", element: <Profile /> },
  { path: "/offererchat", element: <OffererChat /> },
  { path: "/answererchat", element: <AnswererChat /> },
]);

export default router;
