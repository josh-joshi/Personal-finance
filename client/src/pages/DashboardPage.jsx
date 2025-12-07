import { useEffect, useState, useMemo } from "react";
import apiClient from "../api/apiClient";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, b] = await Promise.all([
        apiClient.get("/dashboard/summary"),
        apiClient.get("/dashboard/category-breakdown"),
      ]);

      setSummary(s.data || { income: 0, expense: 0, balance: 0 });
      setBreakdown(b.data || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) =>
    `₹${(Number(val) || 0).toLocaleString("en-IN")}`;

  // Split breakdown into income vs expense
  const { expenseData, incomeData } = useMemo(() => {
    const expense = [];
    const income = [];

    breakdown.forEach((item) => {
      if (item.type === "expense") expense.push(item);
      if (item.type === "income") income.push(item);
    });

    return { expenseData: expense, incomeData: income };
  }, [breakdown]);

  const COLORS = [
    "#22c55e",
    "#60a5fa",
    "#a855f7",
    "#f97316",
    "#f43f5e",
    "#14b8a6",
    "#eab308",
    "#f472b6",
    "#4ade80",
  ];

  // Custom tooltip with bright text
  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0];
    const category = item.payload.category;
    const value = item.value;

    return (
      <div style={styles.tooltipBox}>
        <div style={styles.tooltipCategory}>{category}</div>
        <div style={styles.tooltipValue}>{formatCurrency(value)}</div>
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* HEADER */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Your personal finance snapshot</p>
          </div>

          <button style={styles.refreshButton} onClick={loadData}>
            Refresh
          </button>
        </header>

        {/* LOADING / ERROR */}
        {loading ? (
          <div style={styles.loading}>Loading dashboard...</div>
        ) : error ? (
          <div style={styles.error}>{error}</div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div style={styles.cards}>
              <div
                style={{
                  ...styles.card,
                  background:
                    "linear-gradient(145deg, rgba(16,185,129,0.25), rgba(16,185,129,0.05))",
                  borderColor: "#22c55e",
                  boxShadow: "0 18px 40px rgba(16,185,129,0.25)",
                }}
              >
                <span style={styles.cardLabel}>Income</span>
                <p style={styles.cardValue}>
                  {formatCurrency(summary.income)}
                </p>
              </div>

              <div
                style={{
                  ...styles.card,
                  background:
                    "linear-gradient(145deg, rgba(248,113,113,0.25), rgba(248,113,113,0.05))",
                  borderColor: "#ef4444",
                  boxShadow: "0 18px 40px rgba(248,113,113,0.25)",
                }}
              >
                <span style={styles.cardLabel}>Expense</span>
                <p style={styles.cardValue}>
                  {formatCurrency(summary.expense)}
                </p>
              </div>

              <div
                style={{
                  ...styles.card,
                  background:
                    "linear-gradient(145deg, rgba(59,130,246,0.25), rgba(59,130,246,0.05))",
                  borderColor: "#3b82f6",
                  boxShadow: "0 18px 40px rgba(59,130,246,0.25)",
                }}
              >
                <span style={styles.cardLabel}>Balance</span>
                <p style={styles.cardValue}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN */}
            <section style={styles.section}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.sectionTitle}>Category Breakdown</h2>
                  <p style={styles.sectionSubtitle}>
                    Expense vs Income by category
                  </p>
                </div>
              </div>

              <div style={styles.chartRow}>
                {/* EXPENSE PIE */}
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Expenses</h3>

                  {expenseData.length === 0 ? (
                    <div style={styles.noData}>No expense data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={expenseData}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={3}
                          stroke="#020617"
                          strokeWidth={2}
                          isAnimationActive={true}
                          animationDuration={900}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        {/* Tooltip with bright text */}
                        <Tooltip content={renderTooltip} />

                        {/* Legend with white text */}
                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          wrapperStyle={{
                            color: "#ffffff",
                            fontSize: 12,
                          }}
                          formatter={(value) => (
                            <span style={styles.legendText}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* INCOME PIE */}
                <div style={styles.chartCard}>
                  <h3 style={styles.chartTitle}>Income</h3>

                  {incomeData.length === 0 ? (
                    <div style={styles.noData}>No income data yet</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={incomeData}
                          dataKey="total"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={50}
                          paddingAngle={3}
                          stroke="#020617"
                          strokeWidth={2}
                          isAnimationActive={true}
                          animationDuration={900}
                        >
                          {incomeData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <Tooltip content={renderTooltip} />

                        <Legend
                          verticalAlign="middle"
                          align="right"
                          layout="vertical"
                          wrapperStyle={{
                            color: "#ffffff",
                            fontSize: 12,
                          }}
                          formatter={(value) => (
                            <span style={styles.legendText}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------ STYLES ------------ */
const styles = {
  page: {
    padding: "24px 16px",
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #0ea5e9 0, #020617 40%, #020617 100%)",
    display: "flex",
    justifyContent: "center",
    color: "#e5e7eb",
  },
  container: {
    width: "100%",
    maxWidth: "1000px",
    background: "rgba(15,23,42,0.92)",
    padding: "26px",
    borderRadius: "24px",
    border: "1px solid rgba(148,163,184,0.4)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 2,
  },
  refreshButton: {
    borderRadius: 999,
    padding: "8px 18px",
    border: "1px solid rgba(148,163,184,0.6)",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: 13,
  },

  loading: {
    textAlign: "center",
    padding: 40,
    color: "#cbd5f5",
  },
  error: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(248,113,113,0.15)",
    border: "1px solid rgba(248,113,113,0.4)",
  },

  cards: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 200,
    borderRadius: 18,
    padding: "16px 18px",
    border: "1px solid rgba(148,163,184,0.3)",
    backdropFilter: "blur(10px)",
  },
  cardLabel: {
    fontSize: 13,
    color: "#cbd5f5",
  },
  cardValue: {
    marginTop: 8,
    fontSize: 24,
    fontWeight: 700,
  },

  section: {
    marginTop: 28,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },

  chartRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
  },
  chartCard: {
    flex: 1,
    minWidth: 280,
    borderRadius: 18,
    padding: "16px 14px 18px",
    background:
      "radial-gradient(circle at top, rgba(15,23,42,0.95), rgba(15,23,42,0.9))",
    border: "1px solid rgba(30,64,175,0.5)",
  },
  chartTitle: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 8,
  },
  noData: {
    padding: "28px 10px",
    textAlign: "center",
    fontSize: 13,
    color: "#9ca3af",
  },

  legendText: {
    color: "#e5e7eb",
    fontSize: 12,
  },

  // Tooltip styles (bright & on theme)
  tooltipBox: {
    background: "rgba(15,23,42,0.96)",
    border: "1px solid rgba(148,163,184,0.6)",
    borderRadius: 12,
    padding: "8px 10px",
    color: "#f9fafb",
    fontSize: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
  },
  tooltipCategory: {
    fontSize: 12,
    color: "#e5e7eb",
    marginBottom: 4,
  },
  tooltipValue: {
    fontSize: 13,
    fontWeight: 600,
    color: "#a5b4fc", // soft indigo
  },
};

export default DashboardPage;
