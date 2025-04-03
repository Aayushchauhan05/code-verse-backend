const express = require("express");
const Battle = require("../models/Battle");
// const { protect } = require("../middlewares/auth");
const router = express.Router();

// @route    POST api/battles
// @desc     Create a new battle
// @access   Private
router.post("/", async (req, res) => {
  try {
    const { opponentId, problemId, language } = req.body;
    
    // Validate input
    if (!opponentId || !problemId) {
      return res.status(400).json({ message: "Please provide opponent and problem" });
    }

    const battle = new Battle({ 
      player1: req.user.id,
      player2: opponentId,
      problem: problemId,
      language: language || 'javascript',
      status: 'pending'
    });

    await battle.save();
    
    // Populate user details for the response
    await battle.populate('player1 player2 problem');
    
    res.status(201).json(battle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/battles/:id
// @desc     Get battle details
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id)
      .populate("player1 player2 problem")
      .lean();

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    // Check if the requesting user is part of this battle
    if (battle.player1._id.toString() !== req.user.id && 
        battle.player2._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to view this battle" });
    }

    // Don't send full code to opponent until both have submitted
    if (battle.player1._id.toString() !== req.user.id && !battle.player2Code) {
      battle.player1Code = "Hidden until you submit your solution";
    }
    if (battle.player2._id.toString() !== req.user.id && !battle.player1Code) {
      battle.player2Code = "Hidden until you submit your solution";
    }

    res.json(battle);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    POST api/battles/:id/submit
// @desc     Submit code for a battle
// @access   Private
router.post("/:id/submit", async (req, res) => {
  try {
    const { code, testResults } = req.body;
    const battle = await Battle.findById(req.params.id);

    if (!battle) {
      return res.status(404).json({ message: "Battle not found" });
    }

    // Check if user is part of this battle
    const isPlayer1 = battle.player1.toString() === req.user.id;
    const isPlayer2 = battle.player2.toString() === req.user.id;
    
    if (!isPlayer1 && !isPlayer2) {
      return res.status(403).json({ message: "Not authorized to submit to this battle" });
    }

    // Update code submission
    if (isPlayer1) {
      battle.player1Code = code;
      if (testResults) {
        battle.player1Result = testResults;
      }
    } else {
      battle.player2Code = code;
      if (testResults) {
        battle.player2Result = testResults;
      }
    }

    // Check if both players have submitted
    if (battle.player1Code && battle.player2Code) {
      battle.status = 'completed';
      battle.endTime = new Date();
      
      // Determine winner based on test results
      if (battle.player1Result && battle.player2Result) {
        const p1Score = battle.player1Result.passed * 100 - battle.player1Result.executionTime;
        const p2Score = battle.player2Result.passed * 100 - battle.player2Result.executionTime;
        
        if (p1Score > p2Score) {
          battle.winner = battle.player1;
        } else if (p2Score > p1Score) {
          battle.winner = battle.player2;
        }
        // If scores are equal, it remains a tie (winner stays null)
      }
    }

    await battle.save();
    res.json({ message: "Code submitted successfully", battle });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/battles/user/active
// @desc     Get user's active battles
// @access   Private
router.get("/user/active", async (req, res) => {
  try {
    const battles = await Battle.find({
      $or: [{ player1: req.user.id }, { player2: req.user.id }],
      status: { $in: ['pending', 'in-progress'] }
    })
    .populate("player1 player2 problem")
    .sort({ createdAt: -1 });

    res.json(battles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;