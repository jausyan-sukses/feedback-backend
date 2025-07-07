const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

// CORS untuk GitHub Pages
app.use(cors({
  origin: "https://jausyan-sukses.github.io"
}));

app.use(express.json());

// ✅ KONEKSI KE MONGODB ATLAS
mongoose.connect("mongodb+srv://admin:Pramuka2006@cluster0.1iivu1x.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});

// ✅ Buat Schema + Model
const feedbackSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// OPTIONS preflight
app.options("/feedback", cors());

// ✅ POST /feedback
app.post("/feedback", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const feedback = new Feedback({ name, email, message });
    await feedback.save();
    console.log("✅ Feedback saved:", feedback);
    res.json({ success: true, message: "Feedback received and stored!" });
  } catch (err) {
    console.error("❌ Error saving feedback:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/", (req, res) => {
  res.send("Feedback API is running.");
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
