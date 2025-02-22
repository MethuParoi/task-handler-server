require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectToDatabase = require("./database/mongoClient");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://my-task-handler.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Main Function
async function main() {
  try {
    const client = await connectToDatabase();
    const db = client.db("task-handler");

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/user", userRoutes(db));

    //err handle
    app.get("/favicon.ico", (req, res) => res.status(204).end());
    app.get("/favicon.png", (req, res) => res.status(204).end());

    // Root Endpoint
    app.get("/", (req, res) => {
      res.send("TaskHandler server running");
    });

    // Start Server
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port: ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error);
  }
}

main();
