const express = require("express");
const connectDB = require("./config/db");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

// Connect to Database
connectDB();

// Set Limit

// Initialize Middleware
app.use(express.json({ strict: false, limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());

// app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define Routes
app.use("/api/users", require("./routes/api/users"));

// Serve Static assets in production
if (process.env.NODE_ENV === "production") {
  // Set Static Folder
  app.use(express.static("client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
}

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
