import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiBase from "../utils/apiBase";

function Login() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const handleLogin = useCallback(async () => {
    console.log("handleLogin");
    try {
      if (
        !emailRef ||
        !emailRef.current ||
        !passwordRef ||
        !passwordRef.current
      ) {
        return;
      }
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const res = await apiBase.post("/api/vi/users/login", {
        email,
        password,
      });
      const { status, data, token } = res.data;
      if (status === "success") {
        const { uuid, image, userName } = data.user;
        localStorage.setItem("token", token);
        navigate("/home", { state: { uuid, image, userName } });
      }
    } catch (error) {
      console.error(error);
    }
  }, [navigate]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        handleLogin();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleLogin]);

  return (
    <div className="flex justify-center items-center bg-cyan-400 min-h-screen">
      {/* <!-- main card --> */}
      <div className="relative flex m-6">
        {/* <!-- left card --> */}
        <div className="w-96 p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg">
          {/* <!-- login container --> */}
          <div className="space-y-3">
            <h1 className="text-3xl text-start font-mono">Log In</h1>
            <p className="text-gray-600 mt-2 mb-8">
              Log in to your account to add friends and make video calls.
            </p>
            <input
              className="w-full border-2 rounded focus:outline-none h-10 p-6"
              type="text"
              placeholder="Enter your email address"
              ref={emailRef}
            />
            <input
              className="w-full border-2 rounded focus:outline-none h-10 p-6"
              type="password"
              placeholder="Enter your password"
              ref={passwordRef}
            />
          </div>
          <div className="flex flex-col items-center justify-between text-center font-semibold mt-3">
            <a href="#" className="w-full  text-cyan-700 mt-3 mb-3">
              Forgot password?
            </a>
          </div>
          <button
            className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
        {/* <!-- close button --> */}
        <div className="absolute top-2 right-3 w-8 h-8 rounded-full group bg-gray-200 bg-opacity-70 flex justify-center items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-black group-hover:text-gray-600"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Login;
