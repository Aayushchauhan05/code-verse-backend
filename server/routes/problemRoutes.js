const express = require("express");
const Problem = require("../models/Problem");

const router = express.Router();

// ✅ Get all problems
router.get("/", async (req, res) => {
    try {
        const problems = await Problem.find();
        res.json(problems);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Get a single problem by ID
router.get("/:id", async (req, res) => {
    try {
        const problem = await Problem.findById(req.params.id);
        if (!problem) return res.status(404).json({ error: "Problem not found" });
        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// ✅ Create a new problem
router.post("/", async (req, res) => {
    try {
        const { title, description, difficulty, category, tags, examples, testCases, constraints, timeLimit, memoryLimit, author } = req.body;
        const newProblem = new Problem({ title, description, difficulty, category, tags, examples, testCases, constraints, timeLimit, memoryLimit, author });
        await newProblem.save();
        res.status(201).json(newProblem);
    } catch (error) {
        res.status(400).json({ error: "Invalid data" });
    }
});

// ✅ Update a problem
router.put("/:id", async (req, res) => {
    try {
        const { title, description, difficulty, category, tags, examples, testCases, constraints, timeLimit, memoryLimit, author } = req.body;
        const updatedProblem = await Problem.findByIdAndUpdate(
            req.params.id,
            { title, description, difficulty, category, tags, examples, testCases, constraints, timeLimit, memoryLimit, author },
            { new: true }
        );
        if (!updatedProblem) return res.status(404).json({ error: "Problem not found" });
        res.json(updatedProblem);
    } catch (error) {
        res.status(400).json({ error: "Invalid update data" });
    }
});

// ✅ Delete a problem
router.delete("/:id", async (req, res) => {
    try {
        const deletedProblem = await Problem.findByIdAndDelete(req.params.id);
        if (!deletedProblem) return res.status(404).json({ error: "Problem not found" });
        res.json({ message: "Problem deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
