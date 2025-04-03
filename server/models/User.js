const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true},
  email: { type: String, required: true },
  password: { type: String, required: true },
  eloRating: { type: Number, default: 1200 }, // Elo rating for matchmaking
  matchesPlayed: { type: Number, default: 0 },
  matchesWon: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

 const User= mongoose.model("User", userSchema);
 module.exports=User
