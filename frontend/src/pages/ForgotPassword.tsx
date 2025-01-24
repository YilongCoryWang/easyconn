import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiBase from "../utils/apiBase";

function ForgotPassword() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);

  const handleForgotPassword = useCallback(async () => {
    try {
      if (!emailRef || !emailRef.current) {
        return;
      }
      const email = emailRef.current.value;
      const res = await apiBase.post("/users/forgot-password", {
        email,
      });

      const { status } = res.data;
      if (status === "success") {
        setResetEmailSent(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        handleForgotPassword();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleForgotPassword]);

  return (
    <div className="flex justify-center items-center bg-cyan-400 min-h-screen">
      {/* <!-- main card --> */}
      <div className="relative flex m-6">
        {/* <!-- content --> */}
        <div className="w-96 p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg space-y-9">
          {/* <!-- ForgotPassword container --> */}
          <h1 className="text-3xl text-start font-mono">Forgot Password</h1>
          {resetEmailSent ? (
            <div className="space-y-3">
              <p>
                A password reset link has been sent to your email address. Plese
                check your email inbox and reset password with the link.
              </p>
              <p>The link is valid for 60 minutes.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <p>
                Please input your registered email address to receive a link for
                resetting your password.
              </p>
              <input
                className="w-full border-2 rounded focus:outline-none h-10 p-6"
                type="text"
                placeholder="Enter your email address"
                ref={emailRef}
              />
              <button
                className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
                onClick={handleForgotPassword}
              >
                Send Request
              </button>
            </div>
          )}
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

export default ForgotPassword;
