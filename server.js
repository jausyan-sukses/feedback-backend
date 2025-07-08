const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { Parser } = require("json2csv");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }  // Railway requires SSL
});

app.use(cors({
  origin: "https://jausyan-sukses.github.io"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Feedback API connected to PostgreSQL 🎉");
});

app.post("/feedback", async (req, res) => {
  const { name, email, phone, message } = req.body;

  console.log("Received feedback:", { name, email, phone, message });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      `INSERT INTO feedback (name, email, phone, message) VALUES ($1, $2, $3, $4)`,
      [name, email, phone, message]
    );

    res.json({ success: true, message: "Feedback saved to PostgreSQL!" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/export", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");
    const feedbacks = result.rows;

    const fields = ["id", "name", "email", "phone", "message", "created_at"];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(feedbacks);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
    res.status(200).end(csv);
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).send("Failed to export feedback");
  }
});
