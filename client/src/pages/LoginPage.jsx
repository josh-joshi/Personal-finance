import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password); // calls /api/auth/login, saves token
      // remember toggle could later control localStorage behavior
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Log in to your finance dashboard</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </label>

          <div style={styles.row}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                style={styles.checkbox}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              style={styles.forgot}
              onClick={() => {
                // Just visual – no actual reset logic required as per requirements
                alert("Forgot password flow is not implemented.");
              }}
            >
              Forgot password?
            </button>
          </div>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(135deg, rgba(56,189,248,1), rgba(129,140,248,1))",
  },
  card: {
    background: "rgba(15,23,42,0.7)",
    backdropFilter: "blur(18px)",
    borderRadius: "28px",
    padding: "36px 30px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
    border: "1px solid rgba(148,163,184,0.5)",
    color: "#e5e7eb",
  },
  title: {
    marginBottom: "6px",
    fontSize: "26px",
    fontWeight: "700",
  },
  subtitle: {
    marginBottom: "20px",
    fontSize: "14px",
    color: "#9ca3af",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    fontSize: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    outline: "none",
  
    /* FIX autofill white background */
    WebkitBoxShadow: "0 0 0 1000px rgba(15,23,42,0.9) inset",
    WebkitTextFillColor: "#e5e7eb",
  },
  
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "13px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  checkbox: {
    accentColor: "#22c55e",
  },
  forgot: {
    border: "none",
    background: "transparent",
    color: "#a5b4fc",
    textDecoration: "underline",
    cursor: "pointer",
    padding: 0,
    fontSize: "13px",
  },
  error: {
    background: "rgba(248,113,113,0.15)",
    borderRadius: "12px",
    padding: "8px 10px",
    fontSize: "13px",
    border: "1px solid rgba(248,113,113,0.6)",
  },
  button: {
    marginTop: "8px",
    padding: "10px 16px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    background:
      "linear-gradient(90deg, rgba(59,130,246,1), rgba(56,189,248,1))",
    color: "#0b1120",
    fontWeight: "600",
    fontSize: "15px",
  },
  footerText: {
    marginTop: "16px",
    fontSize: "14px",
    textAlign: "center",
  },
  link: {
    color: "#a5b4fc",
    textDecoration: "underline",
  },
};

export default LoginPage;
