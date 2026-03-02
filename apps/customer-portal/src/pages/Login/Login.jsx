import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import { saveAuth, isAuthed } from "../../lib/auth.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Generate simple math captcha
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${a} + ${b}`);
    setCaptchaAnswer(a + b);
  };

  useEffect(() => {
    generateCaptcha();

    // ✅ already logged-in -> go to app
    if (isAuthed()) {
      navigate("/app", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    // 🔴 VALIDATIONS
    if (!email) return setErr("Email is required");
    if (!validateEmail(email)) return setErr("Please enter a valid email address");
    if (!password) return setErr("Password is required");
    if (!captchaInput) return setErr("Captcha is required");

    if (Number(captchaInput) !== captchaAnswer) {
      generateCaptcha();
      setCaptchaInput("");
      return setErr("Captcha is incorrect");
    }

    setLoading(true);

    try {
      const res = await api.login({
        email: email.trim(),
        password: password,
      });

      // ✅ handle different API response shapes safely
      const token =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken ||
        null;

      const user = res?.user || res?.data?.user || null;

      if (!token) {
        // token missing -> treat as login failed (prevents redirect loop)
        generateCaptcha();
        setCaptchaInput("");
        throw new Error("Login successful but token not received");
      }

      saveAuth({ token, user });

      // ✅ go straight to protected area (no bouncing on "/")
      navigate("/app", { replace: true });
    } catch (e) {
      setErr(e.message || "Invalid email or password");
      // ✅ optional: reset captcha on any failure
      generateCaptcha();
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md card p-6"
      >
        <div className="text-center mb-6">
          <div className="text-xl font-semibold">STAR ENGINEERING Portal</div>
          <div className="text-sm text-slate-500">
            Login with your Email & Password
          </div>
        </div>

        {err && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-600">Email</label>
            <input
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@email.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete="current-password"
            />
          </div>

          {/* CAPTCHA */}
          <div>
            <label className="text-xs text-slate-600">
              Solve: {captchaQuestion}
            </label>
            <input
              className="input"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Enter answer"
              inputMode="numeric"
            />
          </div>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Secure login • Fast loading • Mobile friendly
        </div>
      </motion.div>
    </div>
  );
}