import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signup(email, password); // calls /api/auth/signup
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message || "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create account</h1>
        <p style={styles.subtitle}>Start tracking your money in minutes</p>

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
            Password (min 6 chars)
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" style={styles.button} disabled={submitting}>
            {submitting ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Log in
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
      "linear-gradient(135deg, rgba(14,165,233,1), rgba(109,40,217,1))",
  },
  card: {
    background: "rgba(15,23,42,0.75)",
    backdropFilter: "blur(18px)",
    borderRadius: "28px",
    padding: "34px 28px",
    width: "100%",
    maxWidth: "380px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
    border: "1px solid rgba(148,163,184,0.5)",
    color: "#e5e7eb",
  },
  title: {
    marginBottom: "6px",
    fontSize: "24px",
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
      "linear-gradient(90deg, rgba(34,197,94,1), rgba(16,185,129,1))",
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

export default SignupPage;
