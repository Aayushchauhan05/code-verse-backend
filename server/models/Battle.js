const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const battleSchema = new Schema({
  player1: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  player2: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  player1Code: {
    type: String,
    default: ''
  },
  player2Code: {
    type: String,
    default: ''
  },
  player1Result: {
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 }
  },
  player2Result: {
    passed: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
    executionTime: { type: Number, default: 0 }
  },
  winner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  language: {
    type: String,
    enum: ['javascript', 'python', 'java', 'c++'],
    default: 'javascript'
  }
}, { timestamps: true });

// Add indexes for faster queries
battleSchema.index({ player1: 1, status: 1 });
battleSchema.index({ player2: 1, status: 1 });
battleSchema.index({ status: 1 });

module.exports = mongoose.model('Battle', battleSchema);