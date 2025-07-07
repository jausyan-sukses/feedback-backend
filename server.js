const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS untuk GitHub Pages
app.use(cors({
  origin: "https://jausyan-sukses.github.io"
}));

// Middleware untuk JSON
app.use(express.json());

// Preflight untuk /feedback
app.options("/feedback", cors());

// POST /feedback
app.post("/feedback", (req, res) => {
  const { name, email, message } = req.body;
  console.log("=== Feedback Received ===");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message:", message);

  // Validasi input (opsional)
  if (!name || !email || !message) {
    console.log("⚠️ Incomplete data");
    return res.status(400).json({ success: false, message: "All fields required." });
  }

  res.json({ success: true, message: "Feedback received successfully!" });
});

// GET /
app.get("/", (req, res) => {
  res.send("Feedback API is running.");
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
