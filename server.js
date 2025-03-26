// Import Swagger dependencies
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./swagger");

// Existing imports
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const connectDb = require("./config/db");
const path = require("path");
const bodyParser = require("body-parser");
const http = require("http"); // Import HTTP module
const { Server } = require("socket.io"); // Import Socket.io
const User = require("./Models/userModel"); // Import User model

const app = express();
const port = process.env.PORT || 5300;

// Create HTTP server and attach Express app
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow frontend connections (adjust for security)
  },
});

// Store online users in memory
const onlineUsers = new Map();

// MongoDB Configuration
connectDb()
  .then(() => {
    const allowedOrigins = [
      "http://localhost:5174",
      "https://teresa-server-f6a6f6000e18.herokuapp.com/",
    ];

    app.use(cors());

    // Middleware for JSON and URL-encoded data
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Swagger documentation route
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

    // Routes
    app.use("/api/user", require("./Routes/userRoute"));
    app.use("/api/families", require("./Routes/familyRoute"));
    app.use("/api/message", require("./Routes/messageRoute"));

    // Serve index.html for any other route (excluding OPTIONS method)
    app.get("*", (req, res) => {
      if (req.method !== "OPTIONS") {
        res.sendFile(path.join(__dirname, "public", "index.html"));
      }
    });

    // Handling Preflight OPTIONS requests
    app.options("*", cors());

    // WebSocket Connection Handling
    io.on("connection", async (socket) => {
      console.log(`User connected: ${socket.id}`);

      const userId = socket.handshake.query.userId;
      if (userId) {
        onlineUsers.set(userId, socket.id);
        await User.findByIdAndUpdate(userId, { onlineStatus: true, lastSeen: new Date() });

        // Notify others about online status
        io.emit("userStatusUpdate", { userId, onlineStatus: true });
        console.log(`User ${userId} is now online`);
      }

      // Handle user disconnection
      socket.on("disconnect", async () => {
        console.log(`User disconnected: ${socket.id}`);

        const disconnectedUser = [...onlineUsers.entries()].find(([id, sid]) => sid === socket.id);
        if (disconnectedUser) {
          const [userId] = disconnectedUser;
          onlineUsers.delete(userId);
          await User.findByIdAndUpdate(userId, { onlineStatus: false, lastSeen: new Date() });

          // Notify others about offline status
          io.emit("userStatusUpdate", { userId, onlineStatus: false });
          console.log(`User ${userId} is now offline`);
        }
      });
    });

    // Start the server
    server.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
