const mongoose = require("mongoose");

const mcqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: [
    {
      text: {
        type: String,
        required: true,
        trim: true,
      },
      image: {
        type: String, // Assuming image URLs will be stored
        trim: true,
      },
    },
  ],
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value < this.options.length;
      },
      message: "Correct answer index must be within the options array length"
    }
  },
  timeForQuestion: {
    type: Number, // Time in seconds
    required: true,
  },
  perQuestionMarks: {
    type: Number,
    required: true,
  },
});

const MCQ = mongoose.model("MCQ", mcqSchema);

module.exports = MCQ;
