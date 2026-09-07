import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { api } from "../lib/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("expired") === "1") {
      setError("Your session expired. Please sign in again.");
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    api.login({ email, password }).then((payload) => {
      localStorage.setItem("ruda_token", payload.token);
      localStorage.setItem("ruda_user", JSON.stringify(payload.user));
      navigate("/dashboard");
    }).catch((err) => setError(err.message)).finally(() => setLoading(false));
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Heading */}
        <div className="mb-8 text-center">
          <p className="eyebrow">RUDA field operations</p><h1>Welcome back</h1>

          <p className="login-subtitle">
            Login to your admin account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {/* Email */}
          <div>
            <label>
              Email
            </label>

            <div className="relative">
              <Mail
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="login-input"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label>
              Password
            </label>

            <div className="relative">
              <Lock
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="login-input"
              />
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}
          <button
            type="submit"
            className="button button-primary login-button"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <footer className="login-footer">Powered by <strong>NesPak</strong><span>|</span> RUDA Survey Platform</footer>
      </div>
    </div>
  );
}

export default Login;