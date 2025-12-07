import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path
      ? { color: "#fff", fontWeight: "600" }
      : { color: "#9ca3af" };
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.leftSection}>
        <h2 style={styles.logo} onClick={() => navigate("/dashboard")}>
          FinanceApp
        </h2>

        <button style={{ ...styles.link, ...isActive("/dashboard") }}
          onClick={() => navigate("/dashboard")}
        >
          Dashboard
        </button>

        <button style={{ ...styles.link, ...isActive("/transactions") }}
          onClick={() => navigate("/transactions")}
        >
          Transactions
        </button>
      </div>

      <div style={styles.rightSection}>
        <span style={styles.email}>{user?.email}</span>

        <button style={styles.logoutButton} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    width: "100%",
    padding: "14px 24px",
    background: "rgba(15,23,42,0.75)",
    borderBottom: "1px solid rgba(148,163,184,0.25)",
    backdropFilter: "blur(12px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
  },
  logo: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "700",
    color: "#22c55e",
    cursor: "pointer",
  },
  link: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "15px",
    padding: "4px 6px",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  email: {
    fontSize: "14px",
    color: "#9ca3af",
  },
  logoutButton: {
    background: "#ef4444",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "999px",
    border: "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
};

export default Navbar;
