import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLoginUserMutation } from "../store/apiSlice";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [loginUser, { isLoading }] = useLoginUserMutation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    if (action === "logout") {
      setLoginMsg("Session logged out");
    } else if (action === "Invalid Details") {
      setLoginMsg("Invalid Details");
    } else if (action === "Blocked") {
      setLoginMsg("Blocked");
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMsg("");
    try {
      const result = await loginUser({ uemail: email, password }).unwrap();
      localStorage.setItem("userInfo", JSON.stringify(result));
      navigate("/");
    } catch (err: any) {
      if (err?.data?.message) {
        setLoginMsg(err.data.message);
      } else {
        setLoginMsg("Login failed");
      }
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 font-sans"
      style={{ backgroundColor: "#232d31" }}
    >
      <div
        className="w-full max-w-[420px] p-12 rounded-lg shadow-2xl border border-light"
        style={{ backgroundColor: "#fff9d7", borderRadius: "1rem" }}
      >
        <div className="mb-12 text-center select-none">
          <div className="relative inline-block scale-125 mb-4">
            <span className="text-red-700 font-bold text-7xl leading-none flex flex-col items-center">
              <span className="tracking-tight">M</span>
              <span
                style={{ transform: "rotate(180deg)", marginTop: "-2.5rem" }}
                className="tracking-tight"
              >
                M
              </span>
            </span>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-2 py-1 mt-2"
              style={{ backgroundColor: "#fff9d7" }}
            >
              <span
                className="text-red-700 font-bold text-10px tracking-widest"
                style={{ letterSpacing: "0.2em" }}
              >
                MJ TECH
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-4">
          <div className="mb-6 group">
            <label className="text-9px font-bold text-gray-500 uppercase tracking-widest ml-1 block mb-1">
              Email ID
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-blue-500 py-2 text-sm text-gray-800 focus:outline-none transition-all font-semibold"
              required
            />
          </div>

          <div className="mb-6 group">
            <label className="text-9px font-bold text-gray-500 uppercase tracking-widest ml-1 block mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-blue-500 py-2 text-sm text-gray-800 focus:outline-none transition-all font-semibold"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-red-600 font-bold text-11px">{loginMsg}</p>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-transparent border border-cyan-400 text-cyan-600 font-bold px-6 py-2 rounded-lg text-xs uppercase tracking-wider shadow-md hover:bg-cyan-400 hover:text-white transition-all disabled:opacity-50"
              style={{ borderWidth: "2px" }}
            >
              {isLoading ? "Wait..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
