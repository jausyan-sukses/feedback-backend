const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS: allow GitHub Pages
app.use(cors({
  origin: "https://jausyan-sukses.github.io"
}));

app.use(express.json());

app.post("/feedback", (req, res) => {
  const { name, email, message } = req.body;
  console.log("Feedback received:", name, email, message);
  res.json({ success: true, message: "Feedback received successfully!" });
});

app.get("/", (req, res) => {
  res.send("Feedback API is running.");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
