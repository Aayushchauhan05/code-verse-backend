const express = require("express");
const Battle = require("../models/Battle");

const router = express.Router();

router.post("/create", async (req, res) => {
    const { player1, player2, problem } = req.body;
    const battle = new Battle({ player1, player2, problem });
    await battle.save();
    res.json(battle);
});

router.get("/:id", async (req, res) => {
    const battle = await Battle.findById(req.params.id).populate("player1 player2");
    res.json(battle);
});

router.post("/:id/submit", async (req, res) => {
    const { userId, code } = req.body;
    const battle = await Battle.findById(req.params.id);
    
    if (battle.player1.toString() === userId) battle.player1Code = code;
    if (battle.player2.toString() === userId) battle.player2Code = code;

    await battle.save();
    res.json({ message: "Code submitted" });
});

module.exports = router;
