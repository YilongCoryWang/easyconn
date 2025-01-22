import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import apiBase from "../utils/apiBase";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const passwordConfirmRef = useRef<HTMLInputElement | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  const handleResetPassword = useCallback(async () => {
    try {
      if (
        !passwordRef ||
        !passwordRef.current ||
        !passwordConfirmRef ||
        !passwordConfirmRef.current
      ) {
        return;
      }
      const password = passwordRef.current.value;
      const passwordConfirm = passwordConfirmRef.current.value;
      const res = await apiBase.post(`/api/v1/users/reset-password/${token}`, {
        password,
        passwordConfirm,
      });

      const { status } = res.data;
      if (status === "success") {
        setResetSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        handleResetPassword();
      }
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [handleResetPassword]);

  return (
    <div className="flex justify-center items-center bg-cyan-400 min-h-screen">
      {/* <!-- main card --> */}
      <div className="relative flex m-6">
        {/* <!-- content --> */}
        <div className="w-96 p-4 md:p-8 bg-gray-50 shadow-lg rounded-lg space-y-9">
          {/* <!-- ResetPassword container --> */}
          <h1 className="text-3xl text-start font-mono">Reset Password</h1>
          {resetSuccess ? (
            <div className="space-y-6">
              <p>Password has been reset. Please login again.</p>
              <button
                className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
                onClick={() => navigate("/")}
              >
                Go to Login page
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                className="w-full border-2 rounded focus:outline-none h-10 p-6"
                type="password"
                placeholder="Enter your new password"
                ref={passwordRef}
              />
              <input
                className="w-full border-2 rounded focus:outline-none h-10 p-6"
                type="password"
                placeholder="Confirm your new password"
                ref={passwordConfirmRef}
              />
              <button
                className="w-full border-2 rounded-md bg-cyan-700 p-5 text-gray-100 shadow-lg hover:bg-cyan-600 hover:-translate-y-1 active:translate-y-0 transition text-lg font-semibold"
                onClick={handleResetPassword}
              >
                ResetPassword
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

export default ResetPassword;
