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
    cb(
      null,
      Date.now() + path.extname(file.originalname)
    );
  },
});


const upload = multer({ storage });

router.post("/add", upload.single("faceImage"), async (req, res) => {
  try {
    const {
      name,
      rollNo,
      email,
      course,
      semester,
      section,
    } = req.body;

    // Roll Number Check
    const existingRollNo = await Student.findOne({ rollNo });

    if (existingRollNo) {
      return res.status(400).json({
        message: "Roll Number already exists",
      });
    }

    // Email Check
    const existingEmail = await Student.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const student = new Student({
      name,
      rollNo,
      email,
      course,
      semester,
      section,
      faceImage: req.file
        ? `/uploads/${req.file.filename}`
        : "",
    });

    await student.save();

    res.status(201).json({
      message: "Student added successfully",
      student,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const students = await Student.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(500).json({
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

    // Delete attendance
    await Attendance.deleteMany({
      rollNo: student.rollNo,
    });

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    // Check remaining students in same class
    const remainingStudents = await Student.countDocuments({
      course: student.course,
      section: student.section,
    });

    // If no students left → delete class
    if (remainingStudents === 0) {
      await ClassModel.findOneAndDelete({
        course: student.course,
        section: student.section,
      });
    }

    res.json({
      success: true,
      message: "Student, attendance and empty class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
});

module.exports = router;