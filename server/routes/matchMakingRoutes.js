const express = require("express");
const Matchmaking = require("../models/Matchmaking");
const Battle = require("../models/Battle");
const Problem = require("../models/Problem");

const router = express.Router();

// Join Matchmaking Queue with WebSockets
router.post("/join", async (req, res) => {
  try {
    const { userId, eloRating } = req.body;
    const io = req.io;
    const connectedUsers = req.connectedUsers;

    // Check if user is already in matchmaking queue
    const existingEntry = await Matchmaking.findOne({ userId });
    if (existingEntry) return res.status(400).json({ message: "Already in matchmaking queue" });

    // Add user to matchmaking queue
    const newMatch = new Matchmaking({ userId, eloRating });
    await newMatch.save();

    // Try to find a match
    const opponent = await Matchmaking.findOne({
      userId: { $ne: userId },
      eloRating: { $gte: eloRating - 100, $lte: eloRating + 100 },
      status: "Searching"
    });

    if (opponent) {
      // Mark both users as matched
      await Matchmaking.updateOne({ _id: opponent._id }, { status: "Matched" });
      await Matchmaking.updateOne({ userId }, { status: "Matched" });

      // Select a random problem
      const problemCount = await Problem.countDocuments();
      const randomProblem = await Problem.findOne().skip(Math.floor(Math.random() * problemCount));

      // Create a battle
      const battle = new Battle({
        players: [{ user: userId }, { user: opponent.userId }],
        problem: randomProblem._id,
        status: "In Progress",
        startedAt: new Date()
      });

      await battle.save();

      // Notify both players via WebSocket
      if (connectedUsers.has(userId)) {
        connectedUsers.get(userId).emit("matchFound", { battleId: battle._id, opponentId: opponent.userId });
      }

      if (connectedUsers.has(opponent.userId)) {
        connectedUsers.get(opponent.userId).emit("matchFound", { battleId: battle._id, opponentId: userId });
      }

      return res.status(200).json({ message: "Match found!", battleId: battle._id, opponentId: opponent.userId });
    }

    res.status(200).json({ message: "Searching for an opponent..." });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Leave Matchmaking Queue
router.post("/leave", async (req, res) => {
  try {
    const { userId } = req.body;
    await Matchmaking.findOneAndDelete({ userId });
    res.status(200).json({ message: "Removed from matchmaking queue" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;
