const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // penting untuk Railway PostgreSQL
  }
});

app.use(cors({
  origin: "https://jausyan-sukses.github.io" // ganti dengan domain GitHub Pages kamu
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Feedback API is connected to PostgreSQL!");
});

app.post("/feedback", async (req, res) => {
  const { name, email, message } = req.body;
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    );

    await pool.query(
      "INSERT INTO feedback (name, email, message) VALUES ($1, $2, $3)",
      [name, email, message]
    );

    res.json({ success: true, message: "Feedback saved to PostgreSQL!" });
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
