import { useState, useEffect } from "react";
import { api } from "../../lib/api.js";
import { saveAuth, isAuthed } from "../../lib/auth.js";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const PUBLIC_HOME =
  import.meta.env.VITE_PUBLIC_HOME_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://www.serviceind.co.in");

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaQuestion, setCaptchaQuestion] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function generateCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion(`${a} + ${b}`);
    setCaptchaAnswer(a + b);
  }

  useEffect(() => {
    generateCaptcha();

    if (isAuthed()) {
      navigate("/app", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validateEmail(value) {
    return /\S+@\S+\.\S+/.test(value);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    if (!email.trim()) return setErr("Email is required");
    if (!validateEmail(email.trim())) return setErr("Please enter a valid email address");
    if (!password) return setErr("Password is required");
    if (!captchaInput.trim()) return setErr("Captcha is required");

    if (Number(captchaInput) !== captchaAnswer) {
      generateCaptcha();
      setCaptchaInput("");
      return setErr("Captcha is incorrect");
    }

    setLoading(true);

    try {
      const res = await api.login({
        email: email.trim(),
        password,
      });

      const token =
        res?.token ||
        res?.accessToken ||
        res?.data?.token ||
        res?.data?.accessToken ||
        null;

      const user = res?.user || res?.data?.user || null;

      if (!token) {
        generateCaptcha();
        setCaptchaInput("");
        throw new Error("Login successful but token not received");
      }

      saveAuth({ token, user });
      navigate("/app", { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Invalid email or password");
      generateCaptcha();
      setCaptchaInput("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px 16px",
        display: "grid",
        placeItems: "center",
        fontFamily: "Arial, Helvetica, sans-serif",
        background: `
          radial-gradient(900px 400px at 12% 0%, rgba(59,130,246,0.16), transparent 60%),
          radial-gradient(760px 380px at 100% 12%, rgba(245,158,11,0.16), transparent 55%),
          radial-gradient(880px 420px at 80% 100%, rgba(14,165,233,0.14), transparent 60%),
          linear-gradient(145deg, #f8fbff, #eef4fb, #ffffff)
        `,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 28,
          overflow: "hidden",
          border: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(255,255,255,0.78)",
          backdropFilter: "blur(14px)",
          boxShadow:
            "0 20px 50px rgba(15,23,42,0.10), 0 8px 22px rgba(15,23,42,0.06)",
        }}
      >
        <div
          style={{
            padding: "26px 24px 20px",
            background: `
              linear-gradient(135deg, rgba(11,61,145,0.96), rgba(11,94,215,0.94), rgba(0,163,255,0.92), rgba(255,140,0,0.90))
            `,
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <img
              src="/brand/logo.jpeg"
              alt="SERVICE INDIA"
              style={{
                width: 58,
                height: 58,
                objectFit: "cover",
                borderRadius: 14,
                background: "#fff",
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                flex: "0 0 auto",
              }}
            />
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  letterSpacing: 0.2,
                  lineHeight: 1.1,
                }}
              >
                SERVICE INDIA
              </div>
              <div
                style={{
                  marginTop: 6,
                  fontSize: 13,
                  color: "rgba(255,255,255,0.92)",
                  fontWeight: 700,
                }}
              >
                Customer Portal Login
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 15,
                color: "#0f172a",
                fontWeight: 700,
                marginBottom: 6,
              }}
            >
              Login with your registered email and password
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              Secure customer access for transactions, documents and ledger view.
            </div>
          </div>

          {err ? (
            <div
              style={{
                marginBottom: 14,
                borderRadius: 16,
                border: "1px solid rgba(239,68,68,0.22)",
                background: "rgba(254,242,242,0.9)",
                color: "#b91c1c",
                padding: "10px 12px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {err}
            </div>
          ) : null}

          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                autoComplete="email"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 6,
                  fontSize: 12,
                  color: "#64748b",
                  fontWeight: 800,
                }}
              >
                Solve: {captchaQuestion}
              </label>
              <input
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                placeholder="Enter answer"
                inputMode="numeric"
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                height: 46,
                border: 0,
                borderRadius: 16,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: 800,
                fontSize: 14,
                color: "#fff",
                background:
                  "linear-gradient(135deg, #0b3d91, #0b5ed7, #00a3ff, #ff8c00)",
                boxShadow: "0 14px 28px rgba(11,94,215,0.22)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <a href={PUBLIC_HOME} style={ghostBtnStyle}>
              Back to Website
            </a>
          </div>

          <div
            style={{
              marginTop: 18,
              fontSize: 12,
              color: "#64748b",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Secure login • Fast loading • Mobile friendly
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  height: 46,
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.10)",
  background: "rgba(255,255,255,0.92)",
  padding: "0 14px",
  outline: "none",
  color: "#0f172a",
  fontSize: 14,
  fontFamily: "Arial, Helvetica, sans-serif",
};

const ghostBtnStyle = {
  height: 44,
  padding: "0 14px",
  borderRadius: 14,
  border: "1px solid rgba(15,23,42,0.12)",
  background: "rgba(255,255,255,0.88)",
  color: "#0f172a",
  textDecoration: "none",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: 14,
};