import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register: registerUser } = useAuth();

  const [isRegister, setIsRegister] = useState(location.pathname === "/register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");

  // Update register mode if route changes
  useEffect(() => {
    setIsRegister(location.pathname === "/register");
    setError("");
  }, [location.pathname]);

  const handleSwitch = (toRegister) => {
    setIsRegister(toRegister);
    setError("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(loginEmail, loginPassword);
      navigate("/discover");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await registerUser(regName, regEmail, regPassword);
      navigate("/discover");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-orb orb1"></div>
      <div className="bg-orb orb2"></div>
      <div className="bg-orb orb3"></div>

      <Link to="/" className="back-btn">
        ← HeartSync
      </Link>

      <div className="auth-card">
        {/* LEFT PANEL */}
        <div className="info-side">
          <div className="logo">♥ Heart<span>Sync</span></div>

          <div className="info-content">
            <h1>{isRegister ? "Find your person." : "Welcome back."}</h1>

            <p>
              {isRegister
                ? "Create your profile and meet people who genuinely match your personality."
                : "Reconnect with meaningful conversations and beautiful connections."}
            </p>

            <button
              type="button"
              className="switch-btn"
              onClick={() => handleSwitch(!isRegister)}
            >
              {isRegister ? "Sign In" : "Create Account"}
            </button>
          </div>

          <div className="info-footer">
            ✨ 10,000+ meaningful connections
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="form-side">
          <div className={`flip-card ${isRegister ? "flipped" : ""}`}>

            {/* ---------- LOGIN (Front) ---------- */}
            <div className="flip-face login-face">
              <div className="form-container">
                <h2>Login</h2>
                <p className="subtitle">Welcome back to HeartSync</p>

                {error && !isRegister && (
                  <div className="auth-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit}>
                  <div className="field">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <input
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="quick-demo-container">
                    <span className="demo-icon">✨</span>
                    <span>Quick Demo:</span>
                    <button
                      type="button"
                      className="demo-pill-btn"
                      onClick={() => { setLoginEmail("aarav@gmail.com"); setLoginPassword("password123"); }}
                    >
                      Aarav
                    </button>
                    <button
                      type="button"
                      className="demo-pill-btn"
                      onClick={() => { setLoginEmail("sophia@gmail.com"); setLoginPassword("password123"); }}
                    >
                      Sophia
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Login to HeartSync 💖"}
                  </button>
                </form>

                <div className="bottom-text">
                  Don't have an account?
                  <button type="button" onClick={() => handleSwitch(true)}> Create One</button>
                </div>
              </div>
            </div>

            {/* ---------- REGISTER (Back) ---------- */}
            <div className="flip-face register-face">
              <div className="form-container">
                <h2>Create Account</h2>
                <p className="subtitle">Start your HeartSync journey</p>

                {error && isRegister && (
                  <div className="auth-error">
                    <span>⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit}>
                  <div className="field">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <input
                      type="password"
                      placeholder="Password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="field">
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="bottom-text" style={{ marginTop: "16px" }}>
                  Already have an account?
                  <button type="button" onClick={() => handleSwitch(false)}> Sign In</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;