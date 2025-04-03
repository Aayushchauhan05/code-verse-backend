const mongoose = require("mongoose");

const matchmakingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  eloRating: { type: Number, required: true },
  status: { type: String, enum: ["Searching", "Matched"], default: "Searching" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Matchmaking", matchmakingSchema);
