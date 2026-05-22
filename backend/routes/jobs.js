const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Job = require("../models/Job");
const User = require("../models/User");

// @route   POST api/jobs
router.post("/", auth, async (req, res) => {
  try {
    const newJob = new Job({
      postedBy: req.user.id,
      district: req.user.district,
      ...req.body
    });

    const job = await newJob.save();
    const populatedJob = await job.populate("postedBy", "name phone district");
    
    // Emit new job event via socket
    req.io.emit("job:new", populatedJob);

    res.json(populatedJob);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/jobs
router.get("/", auth, async (req, res) => {
  try {
    const jobs = await Job.find({
      district: req.user.district,
      status: "active"
    })
      .sort({ createdAt: -1 })
      .populate("postedBy", "name phone district");
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/jobs/mine
router.get("/mine", auth, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 })
      .populate("postedBy", "name phone district");
    res.json(jobs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/jobs/:id/complete
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    // Make sure user owns job
    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    job.status = "completed";
    await job.save();
    res.json(job);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") return res.status(404).json({ msg: "Job not found" });
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/jobs/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ msg: "Job not found" });

    if (job.postedBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await job.deleteOne();
    res.json({ msg: "Job removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") return res.status(404).json({ msg: "Job not found" });
    res.status(500).send("Server Error");
  }
});

module.exports = router;
