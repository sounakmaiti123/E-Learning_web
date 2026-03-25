require('dotenv').config();
const express = require("express");
const path = require("path");
const connectDB = require("./database/db");
const routes = require("./database/routes");

const app = express();

// Connect MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", routes);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});