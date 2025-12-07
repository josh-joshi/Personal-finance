const express = require("express");
const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes protected
router.use(auth);

// Helper to get ObjectId from user id
const getUserObjectId = (req) =>
  new mongoose.Types.ObjectId(req.user.id);

// GET /api/dashboard/summary
// { income, expense, balance }
router.get("/summary", async (req, res) => {
  try {
    const userId = getUserObjectId(req);

    const result = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
        },
      },
    ]);

    let income = 0;
    let expense = 0;

    result.forEach((row) => {
      if (row._id === "income") income = row.total;
      if (row._id === "expense") expense = row.total;
    });

    const balance = income - expense;

    res.json({ income, expense, balance });
  } catch (err) {
    console.error("GET /api/dashboard/summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/monthly-trend?months=12
// [
//   { month: "2025-01", income: 1234, expense: 567 },
//   ...
// ]
router.get("/monthly-trend", async (req, res) => {
  try {
    const userId = getUserObjectId(req);
    const months = parseInt(req.query.months, 10) || 12;

    const fromDate = new Date();
    fromDate.setDate(1); // start of month
    fromDate.setMonth(fromDate.getMonth() - (months - 1));

    const agg = await Transaction.aggregate([
      {
        $match: {
          userId,
          date: { $gte: fromDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Reshape in JS
    const map = {};

    agg.forEach((row) => {
      const { year, month, type } = row._id;
      const key = `${year}-${month.toString().padStart(2, "0")}`;

      if (!map[key]) {
        map[key] = { month: key, income: 0, expense: 0 };
      }
      if (type === "income") map[key].income += row.total;
      if (type === "expense") map[key].expense += row.total;
    });

    const data = Object.values(map);

    res.json(data);
  } catch (err) {
    console.error("GET /api/dashboard/monthly-trend error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/dashboard/category-breakdown
// Used by your dual pie charts
// [
//   { category: "Food", type: "expense", total: 1234 },
//   { category: "Salary", type: "income", total: 50000 },
//   ...
// ]
router.get("/category-breakdown", async (req, res) => {
  try {
    const userId = getUserObjectId(req);

    const result = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id.category",
          type: "$_id.type", // "income" or "expense"
          total: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("GET /api/dashboard/category-breakdown error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
