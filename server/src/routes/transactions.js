const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes below require JWT auth
router.use(auth);

// Helper to safely parse date
function parseDate(dateStr) {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/* ===============================
   GET /api/transactions  
   Query: from, to, type, accountId, limit, skip
================================ */
router.get("/", async (req, res) => {
  try {
    const { from, to, type, accountId, limit = 20, skip = 0 } = req.query;

    const filter = {
      userId: req.user.id, // strict user scoping
    };

    // Filter by income/expense
    if (type === "income" || type === "expense") {
      filter.type = type;
    }

    // Filter by account
    if (accountId && accountId.trim() !== "") {
      filter.accountId = accountId.trim();
    }

    // Date filtering
    if (from || to) {
      filter.date = {};

      if (from) {
        const fromDate = parseDate(from);
        if (!fromDate) return res.status(400).json({ message: "Invalid 'from' date" });
        filter.date.$gte = fromDate;
      }

      if (to) {
        const toDate = parseDate(to);
        if (!toDate) return res.status(400).json({ message: "Invalid 'to' date" });
        filter.date.$lte = toDate;
      }
    }

    const lim = Number(limit) || 20;
    const skp = Number(skip) || 0;

    const transactions = await Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skp)
      .limit(lim);

    res.json(transactions);
  } catch (err) {
    console.error("GET /api/transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   POST /api/transactions  
================================ */
router.post("/", async (req, res) => {
  try {
    const { type, amount, category, date, accountId, notes } = req.body;

    // Validate type
    if (type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: "Amount must be a number greater than 0" });
    }

    // Validate category
    if (!category || typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({ message: "Category is required" });
    }

    // Validate date
    const parsedDate = parseDate(date);
    if (!parsedDate) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      type,
      amount: numericAmount,
      category: category.trim(),
      date: parsedDate,
      accountId: accountId?.trim() || "Cash", // Default to Cash
      notes: notes || "",
    });

    res.status(201).json(transaction);
  } catch (err) {
    console.error("POST /api/transactions error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   PUT /api/transactions/:id  
================================ */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const existing = await Transaction.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (existing.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this transaction" });
    }

    const { type, amount, category, date, accountId, notes } = req.body;

    // Validate type
    if (type && type !== "income" && type !== "expense") {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Validate amount
    if (amount !== undefined) {
      const numericAmount = Number(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a number greater than 0" });
      }
      existing.amount = numericAmount;
    }

    // Validate category
    if (category !== undefined) {
      if (!category || category.trim() === "") {
        return res.status(400).json({ message: "Category is required" });
      }
      existing.category = category.trim();
    }

    // Validate date
    if (date !== undefined) {
      const parsedDate = parseDate(date);
      if (!parsedDate) {
        return res.status(400).json({ message: "Invalid date" });
      }
      existing.date = parsedDate;
    }

    // Update type, account, notes
    if (type) existing.type = type;
    if (accountId !== undefined) existing.accountId = accountId?.trim() || "Cash";
    if (notes !== undefined) existing.notes = notes || "";

    const updated = await existing.save();
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/transactions/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===============================
   DELETE /api/transactions/:id  
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid transaction id" });
    }

    const existing = await Transaction.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    if (existing.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this transaction" });
    }

    await existing.deleteOne();

    res.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/transactions/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
