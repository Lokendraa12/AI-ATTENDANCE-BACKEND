const express = require("express");
const ClassModel = require("../models/Class");


const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { course, section } = req.body;

    const newClass = await ClassModel.create({
      course,
      section: section.toUpperCase(),
    });

    res.status(201).json({
      success: true,
      message: "Class added successfully",
      class: newClass,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Class already exists or not added",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ course: 1, section: 1 });

    res.json({
      success: true,
      totalClasses: classes.length,
      classes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Classes not found",
    });
  }
});


module.exports = router;