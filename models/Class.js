const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    course: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

classSchema.index({ course: 1, section: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);