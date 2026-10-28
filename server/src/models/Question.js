const mongoose = require('mongoose');

// Questions guests ask about a stay, answered by the host or an
// admin. Answers live inside the question: they are only ever
// shown together, so there is no reason for a second collection.
const questionSchema = new mongoose.Schema(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, trim: true },
    answers: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        answer: { type: String, required: true, trim: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
