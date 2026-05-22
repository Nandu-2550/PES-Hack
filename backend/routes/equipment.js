const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Equipment = require("../models/Equipment");

// @route   POST api/equipment
router.post("/", auth, async (req, res) => {
  try {
    const newEquipment = new Equipment({
      owner: req.user.id,
      district: req.user.district,
      ...req.body
    });

    const equipment = await newEquipment.save();
    const populated = await equipment.populate("owner", "name");
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/equipment
router.get("/", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({
      district: req.user.district,
      available: true
    })
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/equipment/mine
router.get("/mine", auth, async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .populate("owner", "name");
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PATCH api/equipment/:id/toggle
router.patch("/:id/toggle", auth, async (req, res) => {
  try {
    let equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ msg: "Equipment not found" });

    if (equipment.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    equipment.available = !equipment.available;
    await equipment.save();
    res.json(equipment);
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") return res.status(404).json({ msg: "Equipment not found" });
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/equipment/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ msg: "Equipment not found" });

    if (equipment.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await equipment.deleteOne();
    res.json({ msg: "Equipment removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") return res.status(404).json({ msg: "Equipment not found" });
    res.status(500).send("Server Error");
  }
});

module.exports = router;
