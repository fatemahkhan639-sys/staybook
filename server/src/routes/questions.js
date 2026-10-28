const express = require('express');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const Question = require('../models/Question');
const { requireAuth } = require('../middleware/auth');

// Mounted at /api/hotels/:id/questions, so mergeParams is what
// makes the hotel id visible here.
const router = express.Router({ mergeParams: true });

// GET — every question for this stay, newest first, with answers.
router.get('/', async (req, res) => {
  const questions = await Question.find({ hotel: req.params.id })
    .populate('user', 'name')
    .populate('answers.user', 'name')
    .sort({ createdAt: -1 });
  return res.json(questions);
});

// POST — ask something. Signed-in guests only; the question shows
// under the guest's name.
router.post('/', requireAuth, async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ message: 'A question is required.' });

  const hotel = await Hotel.findById(req.params.id);
  if (!hotel) return res.status(404).json({ message: 'Hotel not found.' });

  const created = await Question.create({
    hotel: hotel._id,
    user: req.userId,
    question,
  });
  return res.status(201).json(created);
});

// POST /:qid/answers — the host or an admin replies. Anyone else
// gets a 403: guests cannot answer each other's questions.
router.post('/:qid/answers', requireAuth, async (req, res) => {
  const { answer } = req.body;
  if (!answer) return res.status(400).json({ message: 'An answer is required.' });

  const [hotel, question] = await Promise.all([
    Hotel.findById(req.params.id),
    Question.findById(req.params.qid),
  ]);
  if (!hotel || !question) return res.status(404).json({ message: 'Question not found.' });

  const me = await User.findById(req.userId);
  const isHost = hotel.listedBy && hotel.listedBy.toString() === req.userId;
  if (!isHost && me?.role !== 'admin') {
    return res.status(403).json({ message: 'Only the host or an admin can answer.' });
  }

  question.answers.push({ user: req.userId, answer });
  await question.save();
  return res.status(201).json(question);
});

module.exports = router;
