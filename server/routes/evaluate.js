const express = require('express');
const multer = require('multer');
const {
  ALLOWED_MIME_TYPES,
  evaluateWithAI,
  extractTextFromFile,
} = require('../services/evaluator');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /evaluate — text-based evaluation
router.post('/', async (req, res) => {
  try {
    const { question, correctAnswer, studentAnswer } = req.body;

    if (!question || !correctAnswer || !studentAnswer) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: question, correctAnswer, studentAnswer' });
    }

    const result = await evaluateWithAI(question, correctAnswer, studentAnswer);
    res.json(result);
  } catch (err) {
    console.error('Text evaluation error:', err.message);
    res.status(500).json({ error: err.message || 'Evaluation failed' });
  }
});

// POST /evaluate/file — file-based evaluation
router.post(
  '/file',
  upload.fields([
    { name: 'questionFile', maxCount: 1 },
    { name: 'correctAnswerFile', maxCount: 1 },
    { name: 'studentAnswerFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const files = req.files || {};

      if (!files.questionFile || !files.correctAnswerFile || !files.studentAnswerFile) {
        return res.status(400).json({
          error:
            'Missing files. Please upload questionFile, correctAnswerFile, and studentAnswerFile.',
        });
      }

      for (const [fieldName, fileList] of Object.entries(files)) {
        const file = fileList[0];
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return res.status(400).json({
            error: `Invalid file type for "${fieldName}". Only PDF, DOCX, and TXT are allowed.`,
          });
        }
      }

      const [question, correctAnswer, studentAnswer] = await Promise.all([
        extractTextFromFile(files.questionFile[0]),
        extractTextFromFile(files.correctAnswerFile[0]),
        extractTextFromFile(files.studentAnswerFile[0]),
      ]);

      if (!question.trim() || !correctAnswer.trim() || !studentAnswer.trim()) {
        return res.status(400).json({ error: 'One or more uploaded files contain no text.' });
      }

      const result = await evaluateWithAI(question, correctAnswer, studentAnswer);
      res.json(result);
    } catch (err) {
      console.error('File evaluation error:', err.message);
      res.status(500).json({ error: err.message || 'File evaluation failed' });
    }
  }
);

module.exports = router;
