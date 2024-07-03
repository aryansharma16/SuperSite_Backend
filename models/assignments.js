const mongoose = require("mongoose");
const MCQ = require("./mcqSchema");

const assignmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    syllabus: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    totalAssignmentMarks: {
      type: Number,
      required: true,
    },
    marksNeededToPass: {
      type: Number,
      required: true,
    },
    questions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "MCQ"
    }],
    totalAssignmentTime: {
      type: Number, // Total time for the entire assignment in seconds
      required: true,
    },
    singleAnswerOnly: {
      type: Boolean,
      default: true, // Assuming by default only one answer is allowed
    },
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
