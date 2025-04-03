const mongoose = require("mongoose");

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
  category: { type: String, required: true }, // e.g., "Arrays", "Graphs"
  tags: [{ type: String }], // e.g., ["DP", "Sorting"]
  examples: [{ input: String, output: String }], // Visible examples
  testCases: [{ input: String, output: String, hidden: { type: Boolean, default: false } }], // Hidden cases
  constraints: [String],
  timeLimit: { type: Number, default: 1000 }, // in milliseconds
  memoryLimit: { type: Number, default: 256 }, // in MB
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Reference to user
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Problem", problemSchema);
