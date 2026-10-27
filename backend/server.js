
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB when the API is called.
// Reuse the connection for subsequent requests.
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(process.env.MONGODB_URI);
}

app.get("/", (req, res) => {
  res.send("Recipe Book API is running!");
});

// Ensure MongoDB is connected before handling recipe requests.
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/recipes", require("./routes/recipes"));

// Export the Express app for Vercel.
module.exports = app;

// Run a regular server only during local development.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
