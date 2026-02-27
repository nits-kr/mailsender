import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../store/authSlice";
import { useLoginUserMutation } from "../store/apiSlice";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMsg, setLoginMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
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
      dispatch(setCredentials({ userInfo: result, token: result.token }));
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
    <div className="login-page-container">
      {/* Mesh Gradient Background Elements */}
      <div className="login-bg-grid" />
      <div className="login-shape-1" />
      <div className="login-shape-2" />

      <div className="login-card-wrapper">
        {/* Logo Section */}
        <div className="login-logo-section">
          {/* <div className="login-logo-box d-none">
            <span className="login-logo-text">MJ</span>
          </div> */}
          {/* <h1 className="login-title-h1 d-none">
            Enterprise <span>Mailing</span>
          </h1> */}
          <p className="login-subtitle">MJ TECH • Authentication Portal</p>
        </div>

        {/* Login Card */}
        <div className="login-card">
          <div className="login-welcome">
            <h2>Welcome back</h2>
            {/* <p>Please enter your credentials to continue</p> */}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Email Address</label>
              </div>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="login-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">Password</label>
                <button type="button" className="forgot-link">
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                  required
                />
              </div>
            </div>

            {loginMsg && (
              <div
                className={`login-message ${
                  loginMsg.includes("Success") ? "success" : "error"
                }`}
              >
                {loginMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Authenticating...
                </>
              ) : (
                <>
                  Login to Account
                  <svg
                    className="btn-arrow"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Securely encrypted & managed by <span>MJ TECH Cloud</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
