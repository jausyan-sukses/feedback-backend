const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const { Parser } = require("json2csv");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL config
let pool;
try {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  pool.connect((err, client, release) => {
    if (err) {
      console.error("❌ Error connecting to PostgreSQL:", err.stack);
    } else {
      console.log("✅ Connected to PostgreSQL database");
      release();
    }
  });
} catch (error) {
  console.error("❌ Pool setup error:", error);
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.use(cors({
  origin: "https://jausyan-sukses.github.io",
}));
app.use(express.json());

// 🟢 Root route
app.get("/", (req, res) => {
  console.log("✅ GET / called");
  res.send("Feedback API connected to PostgreSQL 🎉");
});

// 🟠 Handle feedback submission
app.post("/feedback", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📥 Feedback received:", { name, email, phone, message });

  try {
    const insertQuery = "INSERT INTO feedback (name, email, phone, message) VALUES ($1, $2, $3, $4)";
    await pool.query(insertQuery, [name, email, phone, message]);
    console.log("✅ Feedback saved to database");

    // Kirim email
    const mailOptions = {
      from: `"Feedback Form" <${process.env.EMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      subject: "New Feedback Received",
      html: `
        <h3>New Feedback Received</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully");

    res.json({ success: true, message: "Feedback received and email sent!" });

  } catch (err) {
    console.error("❌ Error saving feedback or sending email:", err);
    res.status(500).json({ success: false, message: "Something went wrong." });
  }
});

// 🟡 Export feedbacks to CSV
app.get("/export", async (req, res) => {
  try {
    console.log("📤 Export requested");
    const result = await pool.query("SELECT * FROM feedback ORDER BY created_at DESC");
    const feedbacks = result.rows;

    const fields = ["id", "name", "email", "phone", "message", "created_at"];
    const parser = new Parser({ fields });
    const csv = parser.parse(feedbacks);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=feedback.csv");
    res.status(200).end(csv);

    console.log("✅ Exported feedbacks to CSV");
  } catch (error) {
    console.error("❌ Export error:", error);
    res.status(500).send("Failed to export feedback");
  }
});

// 🔵 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
