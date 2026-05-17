const express = require("express");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const ClassModel = require("../models/Class");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/add", async (req, res) => {
  try {
    const { name, rollNo, email, course, semester, section, faceImage } = req.body;

    const finalCourse = course.toUpperCase();
    const finalSection = section.toUpperCase();

    const existingRollNo = await Student.findOne({ rollNo });
    if (existingRollNo) {
      return res.status(400).json({ message: "Roll Number already exists" });
    }

    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const student = new Student({
      name,
      rollNo,
      email,
      course: finalCourse,
      semester,
      section: finalSection,
      faceImage,
    });

    await student.save();

    await ClassModel.findOneAndUpdate(
      { course: finalCourse, section: finalSection },
      { course: finalCourse, section: finalSection },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Student and class added successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      students,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Students not found",
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await Attendance.deleteMany({
      rollNo: student.rollNo,
    });

    await Student.findByIdAndDelete(req.params.id);

    const remainingStudents = await Student.countDocuments({
      course: student.course,
      section: student.section,
    });

    if (remainingStudents === 0) {
      await ClassModel.findOneAndDelete({
        course: student.course,
        section: student.section,
      });
    }

    return res.json({
      success: true,
      message: "Student, attendance and empty class deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
});

module.exports = router;