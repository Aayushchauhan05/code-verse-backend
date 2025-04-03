const express = require("express");
const mongoose = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const authRoutes = require("./routes/authRoutes");
const battleRoutes = require("./routes/battleRoutes");
const matchmakingRoutes = require("./routes/matchMakingRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/battle", battleRoutes);
app.use("/api/matchmaking", matchmakingRoutes);

// Store connected users
const connectedUsers = new Map();

io.on("connection", (socket) => {
    console.log(`🔗 New connection: ${socket.id}`);

    // Store user connection
    socket.on("registerUser", (userId) => {
        connectedUsers.set(userId, socket);
        console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    // Join battle room
    socket.on("joinBattle", (battleId) => {
        socket.join(battleId);
        console.log(`🎮 User joined battle room: ${battleId}`);
    });

    // Real-time code update broadcasting
    socket.on("codeUpdate", ({ battleId, code }) => {
        socket.to(battleId).emit("updateCode", code);
    });

    // Matchmaking WebSocket Handling
    socket.on("joinMatchmaking", (userId) => {
        connectedUsers.set(userId, socket);
        console.log(`🔍 User ${userId} is searching for a match`);
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        for (let [userId, sock] of connectedUsers) {
            if (sock === socket) {
                connectedUsers.delete(userId);
                console.log(`🗑 Removed user ${userId} from matchmaking`);
                break;
            }
        }
    });
});

// Attach Socket.io instance and connected users map to requests
app.use((req, res, next) => {
    req.io = io;
    req.connectedUsers = connectedUsers;
    next();
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
