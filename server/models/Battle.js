const mongoose = require("mongoose");

const battleSchema = new mongoose.Schema({
    player1: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    player2: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    problem: { type: String, required: true },
    player1Code: { type: String, default: "" },
    player2Code: { type: String, default: "" },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["waiting", "ongoing", "completed"], default: "waiting" },
    startTime: { type: Date, default: Date.now },
}, { timestamps: true });

const Battle = mongoose.model("Battle", battleSchema);
module.exports = Battle;
