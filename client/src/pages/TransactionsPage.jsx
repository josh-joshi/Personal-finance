import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { useSmartCategories } from "../hooks/useSmartCategories";
import { getCategoryColor } from "../data/categoryColors";
import { useSmartAccounts } from "../hooks/useSmartAccounts";

function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteState, setDeleteState] = useState({ open: false, tx: null });
  const [deleting, setDeleting] = useState(false);

  // smart hooks
  const { categories, addCategory, icons } = useSmartCategories();
  const { accounts, addAccount, accountIcons, accountColors } =
    useSmartAccounts();

  // form
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    account: "",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
  });

  const [creating, setCreating] = useState(false);

  // NEW: UI filters
  const [filterType, setFilterType] = useState("all"); // all | income | expense
  const [filterAccount, setFilterAccount] = useState("all");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await apiClient.get("/transactions");
      setTransactions(res.data || []);
    } catch (err) {
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    const amountNum = Number(form.amount);
    if (!amountNum || amountNum <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!form.category.trim()) {
      setError("Category is required");
      return;
    }

    if (!form.account.trim()) {
      setError("Account is required");
      return;
    }

    addCategory(form.category);
    addAccount(form.account);

    setCreating(true);
    try {
      const payload = {
        type: form.type,
        amount: amountNum,
        category: form.category.trim(),
        accountId: form.account.trim(), // backend expects accountId
        date: form.date,
        notes: form.notes,
      };

      const res = await apiClient.post("/transactions", payload);
      setTransactions((prev) => [res.data, ...prev]);

      setForm((prev) => ({
        ...prev,
        amount: "",
        category: "",
        account: "",
        notes: "",
      }));
    } catch (err) {
      setError("Failed to add transaction");
    } finally {
      setCreating(false);
    }
  };

  const formatAmount = (tx) =>
    `${tx.type === "expense" ? "-" : "+"}₹${tx.amount.toFixed(2)}`;

  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  const openDeleteConfirm = (tx) => setDeleteState({ open: true, tx });

  const closeDeleteConfirm = () => {
    if (!deleting) setDeleteState({ open: false, tx: null });
  };

  const confirmDelete = async () => {
    if (!deleteState.tx) return;
    const tx = deleteState.tx;

    const prev = [...transactions];
    setDeleting(true);
    setError("");

    // optimistic
    setTransactions((curr) => curr.filter((t) => t._id !== tx._id));

    try {
      await apiClient.delete(`/transactions/${tx._id}`);
    } catch {
      setTransactions(prev);
      setError("Delete failed, please try again.");
    } finally {
      setDeleting(false);
      setDeleteState({ open: false, tx: null });
    }
  };

  // ---------- FILTERED LIST (UI only, backend unchanged) ----------
  const filteredTransactions = transactions.filter((tx) => {
    // type tab
    if (filterType === "income" && tx.type !== "income") return false;
    if (filterType === "expense" && tx.type !== "expense") return false;

    // account filter
    if (filterAccount !== "all" && tx.accountId !== filterAccount) return false;

    // date range
    const d = new Date(tx.date);
    if (filterFrom) {
      const from = new Date(filterFrom);
      if (d < from) return false;
    }
    if (filterTo) {
      const to = new Date(filterTo);
      // include the end date
      to.setHours(23, 59, 59, 999);
      if (d > to) return false;
    }

    // search filter - category / notes / account
    if (filterSearch.trim()) {
      const q = filterSearch.trim().toLowerCase();
      const haystack = [
        tx.category || "",
        tx.notes || "",
        tx.accountId || "",
        tx.type || "",
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(q)) return false;
    }

    return true;
  });

  const hasAny = transactions.length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.title}>Transactions</h1>
          <button style={styles.refreshButton} onClick={fetchTransactions}>
            Refresh
          </button>
        </header>

        {/* ---------- TABS + FILTER BAR ---------- */}
        <div style={styles.filterBar}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {["all", "income", "expense"].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterType(tab)}
                style={{
                  ...styles.tab,
                  ...(filterType === tab ? styles.tabActive : {}),
                }}
              >
                {tab === "all"
                  ? "All"
                  : tab === "income"
                  ? "Income"
                  : "Expenses"}
              </button>
            ))}
          </div>

          {/* Right filters */}
          <div style={styles.filterRight}>
            {/* Account filter */}
            <select
              value={filterAccount}
              onChange={(e) => setFilterAccount(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All accounts</option>
              {accounts.map((acc) => (
                <option key={acc} value={acc}>
                  {accountIcons[acc] || "➕"} {acc}
                </option>
              ))}
            </select>

            {/* Date range */}
            <input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              style={styles.filterInput}
              placeholder="From"
            />
            <input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              style={styles.filterInput}
              placeholder="To"
            />

            {/* Search */}
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              style={styles.searchInput}
              placeholder="Search category, notes, account..."
            />
          </div>
        </div>

        {/* ---------- ADD TRANSACTION FORM ---------- */}
        <form style={styles.form} onSubmit={handleCreate}>
          <div style={styles.formRow}>
            {/* Type */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Type</label>
              <select
                value={form.type}
                onChange={(e) => handleFormChange("type", e.target.value)}
                style={styles.select}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            {/* Amount */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Amount (₹)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
                required
                style={styles.input}
              />
            </div>

            {/* Category */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Category</label>
              <input
                list="category-list"
                value={form.category}
                onChange={(e) => {
                  handleFormChange("category", e.target.value);
                  addCategory(e.target.value);
                }}
                placeholder="Select or type"
                style={styles.input}
                required
              />
              <datalist id="category-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {icons[cat] || "🔖"} {cat}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Row 2: Account + Date + Notes */}
          <div style={styles.formRow}>
            {/* Account */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Account</label>
              <input
                list="account-list"
                value={form.account}
                onChange={(e) => {
                  handleFormChange("account", e.target.value);
                  addAccount(e.target.value);
                }}
                placeholder="Cash, Bank, Credit Card..."
                style={styles.input}
                required
              />
              <datalist id="account-list">
                {accounts.map((acc) => (
                  <option key={acc} value={acc}>
                    {accountIcons[acc] || "➕"} {acc}
                  </option>
                ))}
              </datalist>
            </div>

            {/* Date */}
            <div style={styles.formField}>
              <label style={styles.formLabel}>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {/* Notes */}
            <div style={{ ...styles.formField, flex: 2 }}>
              <label style={styles.formLabel}>Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder="Optional"
                style={styles.input}
              />
            </div>

            <div style={styles.formActions}>
              <button style={styles.createButton} disabled={creating}>
                {creating ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </form>

        {error && <div style={styles.error}>{error}</div>}

        {/* ---------- TABLE / EMPTY STATES ---------- */}
        {loading ? (
          <div style={styles.empty}>Loading...</div>
        ) : !hasAny ? (
          <div style={styles.empty}>No transactions yet. Add one above.</div>
        ) : filteredTransactions.length === 0 ? (
          <div style={styles.empty}>
            No transactions match the current filters.
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Account</th>
                  <th style={styles.th}>Amount</th>
                  <th style={styles.th}></th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} style={styles.row}>
                    <td style={styles.td}>{formatDate(tx.date)}</td>

                    {/* Type */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.badge,
                          backgroundColor:
                            tx.type === "income"
                              ? "rgba(22,163,74,0.2)"
                              : "rgba(239,68,68,0.2)",
                          color: tx.type === "income" ? "#4ade80" : "#fca5a5",
                        }}
                      >
                        {tx.type}
                      </span>
                    </td>

                    {/* Category */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.catTag,
                          backgroundColor: getCategoryColor(tx.category),
                        }}
                      >
                        {icons[tx.category] || "🔖"} {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.accTag,
                          backgroundColor:
                            accountColors[tx.accountId] || "#cbd5e1",
                        }}
                      >
                        {accountIcons[tx.accountId] || "➕"} {tx.accountId}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={styles.td}>{formatAmount(tx)}</td>

                    <td style={styles.tdRight}>
                      <button
                        style={styles.deleteButton}
                        onClick={() => openDeleteConfirm(tx)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELETE MODAL */}
        {deleteState.open && deleteState.tx && (
          <div style={styles.modalOverlay} onClick={closeDeleteConfirm}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Delete Transaction?</h2>

              <p style={styles.modalText}>
                Delete{" "}
                <strong>
                  {formatAmount(deleteState.tx)} on{" "}
                  {formatDate(deleteState.tx.date)}
                </strong>
                ?
                <br />
                This action cannot be undone.
              </p>

              <div style={styles.modalActions}>
                <button
                  style={styles.modalCancel}
                  onClick={closeDeleteConfirm}
                  disabled={deleting}
                >
                  Cancel
                </button>

                  <button
                  style={styles.modalDelete}
                  onClick={confirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- STYLES -------------------- */
const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px 16px",
    background:
      "radial-gradient(circle at top left, #0ea5e9 0, #020617 45%, #020617 100%)",
    display: "flex",
    justifyContent: "center",
    color: "#e5e7eb",
  },
  container: {
    width: "100%",
    maxWidth: "960px",
    background: "rgba(15,23,42,0.9)",
    borderRadius: "24px",
    padding: "20px",
    border: "1px solid rgba(148,163,184,0.5)",
    boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
  },
  refreshButton: {
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.8)",
    background: "transparent",
    padding: "6px 14px",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "13px",
  },

  /* NEW: filter bar + tabs */
  filterBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  tabs: {
    display: "flex",
    gap: "6px",
  },
  tab: {
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.6)",
    background: "rgba(15,23,42,0.8)",
    padding: "6px 14px",
    fontSize: "12px",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  tabActive: {
    background:
      "linear-gradient(90deg, rgba(59,130,246,1), rgba(56,189,248,1))",
    border: "none",
    color: "#0b1120",
    fontWeight: "600",
  },
  filterRight: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    flex: 1,
  },
  filterSelect: {
    minWidth: "120px",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "12px",
  },
  filterInput: {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "12px",
  },
  searchInput: {
    flex: 1,
    minWidth: "160px",
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    background: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    fontSize: "12px",
  },

  form: {
    marginBottom: "18px",
    padding: "12px",
    borderRadius: "18px",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid rgba(30,64,175,0.7)",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "8px",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
    minWidth: "140px",
  },
  formLabel: {
    color: "#9ca3af",
    fontSize: "13px",
  },
  input: {
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    padding: "10px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,0.7)",
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    outline: "none",
    fontFamily: "inherit",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    flex: 1,
  },
  createButton: {
    borderRadius: "999px",
    padding: "10px 18px",
    background:
      "linear-gradient(90deg, rgba(34,197,94,1), rgba(16,185,129,1))",
    border: "none",
    color: "#0b1120",
    cursor: "pointer",
    fontWeight: "600",
  },

  error: {
    marginTop: "8px",
    marginBottom: "12px",
    padding: "8px",
    borderRadius: "12px",
    background: "rgba(248,113,113,0.18)",
    border: "1px solid rgba(248,113,113,0.6)",
    fontSize: "13px",
  },
  empty: {
    padding: "40px 10px",
    textAlign: "center",
    fontSize: "14px",
    color: "#9ca3af",
  },

  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
  },
  th: {
    textAlign: "left",
    padding: "10px 8px",
    borderBottom: "1px solid rgba(51,65,85,1)",
    fontWeight: "600",
    fontSize: "13px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
  },
  row: {
    borderBottom: "1px solid rgba(30,41,59,1)",
    transition: "background 0.15s ease, transform 0.08s ease",
  },
  td: {
    padding: "10px 8px",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "10px 8px",
    textAlign: "right",
  },
  badge: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    textTransform: "capitalize",
  },
  catTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "999px",
    color: "#0b1120",
    fontWeight: "600",
    fontSize: "12px",
  },
  accTag: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    borderRadius: "999px",
    color: "#0b1120",
    fontWeight: "600",
    fontSize: "12px",
  },
  deleteButton: {
    borderRadius: "999px",
    padding: "6px 12px",
    fontSize: "12px",
    cursor: "pointer",
    background: "rgba(248,113,113,0.25)",
    color: "#fecaca",
    border: "none",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(15,23,42,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  modal: {
    background: "rgba(15,23,42,1)",
    borderRadius: "20px",
    padding: "20px 22px",
    width: "100%",
    maxWidth: "380px",
    border: "1px solid rgba(148,163,184,0.6)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
  },
  modalTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  modalText: {
    fontSize: "14px",
    color: "#cbd5f5",
    marginBottom: "18px",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  modalCancel: {
    padding: "6px 14px",
    borderRadius: "999px",
    background: "transparent",
    border: "1px solid rgba(148,163,184,0.8)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontSize: "13px",
  },
  modalDelete: {
    padding: "6px 14px",
    borderRadius: "999px",
    background: "rgba(248,113,113,1)",
    border: "none",
    color: "#0b1120",
    fontWeight: "600",
    cursor: "pointer",
    fontSize: "13px",
  },
};

export default TransactionsPage;
