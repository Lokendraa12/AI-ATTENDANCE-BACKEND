const express = require("express");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

const router = express.Router();

router.post("/mark", async (req, res) => {
  try {
    const { rollNo } = req.body;

    const student = await Student.findOne({ rollNo });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({
      rollNo,
      date: today,
    });

    if (alreadyMarked) {
      return res.json({
        success: false,
        message: "Attendance already marked today",
      });
    }

    const now = new Date();

    const attendance = new Attendance({
      studentId: student._id,
      rollNo: student.rollNo,
      studentName: student.name,
      course: student.course,
      semester: student.semester,
      date: today,
      time: now.toLocaleTimeString(),
      status: "Present",
    });

    await attendance.save();

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Attendance not marked",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const attendance = await Attendance.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      attendance,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Attendance not found",
    });
  }
});

module.exports = router;