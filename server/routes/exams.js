const express = require('express');
const multer = require('multer');
const { ROLES, authenticate, requireRoles } = require('../lib/auth');
const { createId, readCollection, writeCollection } = require('../lib/store');
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

function getUsersById() {
  return new Map(readCollection('users').map((user) => [user.id, user]));
}

function createExamRecord({ title, question, correctAnswer, instructorId }) {
  const exams = readCollection('exams');
  const exam = {
    id: createId('exam'),
    title: String(title).trim(),
    question: String(question).trim(),
    correctAnswer: String(correctAnswer).trim(),
    instructorId,
    createdAt: new Date().toISOString(),
  };

  exams.push(exam);
  writeCollection('exams', exams);
  return exam;
}

router.post('/', authenticate, requireRoles(ROLES.INSTRUCTOR), (req, res) => {
  try {
    const { title, question, correctAnswer } = req.body;

    if (!title || !question || !correctAnswer) {
      return res.status(400).json({ error: 'Title, question, and correct answer are required.' });
    }

    const exam = createExamRecord({
      title,
      question,
      correctAnswer,
      instructorId: req.user.id,
    });

    res.status(201).json({ exam });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Unable to create exam.' });
  }
});

router.post(
  '/upload',
  authenticate,
  requireRoles(ROLES.INSTRUCTOR),
  upload.fields([
    { name: 'questionFile', maxCount: 1 },
    { name: 'correctAnswerFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title } = req.body;
      const files = req.files || {};

      if (!title || !String(title).trim()) {
        return res.status(400).json({ error: 'Title is required.' });
      }

      if (!files.questionFile || !files.correctAnswerFile) {
        return res.status(400).json({
          error: 'Please upload both questionFile and correctAnswerFile.',
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

      const [question, correctAnswer] = await Promise.all([
        extractTextFromFile(files.questionFile[0]),
        extractTextFromFile(files.correctAnswerFile[0]),
      ]);

      if (!question.trim() || !correctAnswer.trim()) {
        return res.status(400).json({ error: 'Uploaded files must contain readable text.' });
      }

      const exam = createExamRecord({
        title,
        question,
        correctAnswer,
        instructorId: req.user.id,
      });

      res.status(201).json({ exam });
    } catch (error) {
      res.status(500).json({ error: error.message || 'Unable to create exam from files.' });
    }
  }
);

router.get('/student', authenticate, requireRoles(ROLES.STUDENT), (req, res) => {
  const exams = readCollection('exams');
  const submissions = readCollection('submissions');
  const usersById = getUsersById();

  const data = exams.map((exam) => {
    const latestSubmission = submissions
      .filter((submission) => submission.examId === exam.id && submission.studentId === req.user.id)
      .sort((a, b) => new Date(b.evaluatedAt) - new Date(a.evaluatedAt))[0];

    return {
      id: exam.id,
      title: exam.title,
      question: exam.question,
      instructorName: usersById.get(exam.instructorId)?.name || 'Instructor',
      createdAt: exam.createdAt,
      submission: latestSubmission || null,
    };
  });

  res.json({ exams: data });
});

router.get('/instructor', authenticate, requireRoles(ROLES.INSTRUCTOR), (req, res) => {
  const exams = readCollection('exams').filter((exam) => exam.instructorId === req.user.id);
  const submissions = readCollection('submissions');
  const usersById = getUsersById();

  const data = exams.map((exam) => ({
    ...exam,
    submissions: submissions
      .filter((submission) => submission.examId === exam.id)
      .sort((a, b) => new Date(b.evaluatedAt) - new Date(a.evaluatedAt))
      .map((submission) => ({
        ...submission,
        studentName: usersById.get(submission.studentId)?.name || 'Student',
        studentUsername: usersById.get(submission.studentId)?.username || '',
      })),
  }));

  res.json({ exams: data });
});

router.post('/:examId/submissions', authenticate, requireRoles(ROLES.STUDENT), async (req, res) => {
  try {
    const { examId } = req.params;
    const { answer } = req.body;

    if (!answer || !String(answer).trim()) {
      return res.status(400).json({ error: 'Student answer is required.' });
    }

    const exams = readCollection('exams');
    const exam = exams.find((item) => item.id === examId);
    if (!exam) {
      return res.status(404).json({ error: 'Exam not found.' });
    }

    const evaluation = await evaluateWithAI(exam.question, exam.correctAnswer, String(answer).trim());
    const submissions = readCollection('submissions');
    const existingIndex = submissions.findIndex(
      (item) => item.examId === examId && item.studentId === req.user.id
    );

    const submission = {
      id: existingIndex >= 0 ? submissions[existingIndex].id : createId('submission'),
      examId,
      studentId: req.user.id,
      answer: String(answer).trim(),
      score: evaluation.score,
      feedback: evaluation.feedback,
      suggestions: evaluation.suggestions,
      questionBreakdown: evaluation.questionBreakdown,
      evaluatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      submissions[existingIndex] = submission;
    } else {
      submissions.push(submission);
    }

    writeCollection('submissions', submissions);
    res.json({ submission });
  } catch (error) {
    console.error('Submission evaluation error:', error.message);
    res.status(500).json({ error: error.message || 'Unable to evaluate student answer.' });
  }
});

module.exports = router;