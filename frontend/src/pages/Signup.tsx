import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import apiBase from "../utils/apiBase";

function Signup() {
  const navigate = useNavigate();
  const nameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);

  const handleSignup = useCallback(async () => {
    try {
      if (
        !nameRef ||
        !nameRef.current ||
        !emailRef ||
        !emailRef.current ||
        !passwordRef ||
        !passwordRef.current ||
        !passwordConfirmRef ||
        !passwordConfirmRef.current
      ) {
        return;
      }
      const name = nameRef.current.value;
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      const passwordConfirm = passwordConfirmRef.current.value;
      const res = await apiBase.post("/api/vi/users/signup", {
        name,
        email,
        password,
        passwordConfirm,
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
        handleSignup();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleSignup]);

  return (
    <div className="flex justify-center items-center bg-cyan-400 min-h-screen">
      {/* <!-- main card --> */}
      <div className="relative flex m-6">
        {/* <!-- content --> */}
        <div className="w-96 p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg space-y-9">
          {/* <!-- Signup container --> */}
          <div className="space-y-3">
            <h1 className="text-3xl text-start font-mono">Sign Up</h1>
            <input
              className="w-full border-2 rounded focus:outline-none h-10 p-6"
              type="text"
              placeholder="Enter your user name"
              ref={nameRef}
            />
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
            <input
              className="w-full border-2 rounded focus:outline-none h-10 p-6"
              type="password"
              placeholder="Confirm your password"
              ref={passwordConfirmRef}
            />
          </div>
          <button
            className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
            onClick={handleSignup}
          >
            Signup
          </button>
        </div>
        {/* <!-- close button --> */}
        <div
          className="absolute top-2 right-3 w-8 h-8 rounded-full group bg-gray-200 bg-opacity-70 flex justify-center items-center"
          onClick={() => {
            navigate("/");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 text-black group-hover:text-gray-600 group-hover:-translate-y-0.5 group-active:translate-y-0"
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

export default Signup;
