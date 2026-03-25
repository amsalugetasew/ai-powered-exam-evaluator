const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { OpenAI } = require('openai');

const router = express.Router();

function getConfiguredApiKey() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  const lower = key.toLowerCase();

  if (!key || lower === 'your_openai_api_key_here' || lower === 'your_openai_key_here') {
    throw new Error('OPENAI_API_KEY is missing or still set to a placeholder. Add a valid key in your .env file.');
  }

  return key;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function extractTextFromFile(file) {
  const { mimetype, buffer } = file;

  if (mimetype === 'application/pdf') {
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (
    mimetype ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  if (mimetype === 'text/plain') {
    return buffer.toString('utf-8');
  }

  throw new Error(`Unsupported file type: ${mimetype}`);
}

async function evaluateWithAI(question, correctAnswer, studentAnswer) {
  const openai = new OpenAI({ apiKey: getConfiguredApiKey() });

  const userPrompt = [
    `Question: ${question}`,
    ``,
    `Correct Answer: ${correctAnswer}`,
    ``,
    `Student Answer: ${studentAnswer}`,
    ``,
    `Evaluate the student's answer against the correct answer. Return ONLY a JSON object with these fields:`,
    `- "score": integer 0–100`,
    `- "feedback": string with detailed, constructive feedback`,
    `- "suggestions": array of strings with specific improvement tips`,
    `- "questionBreakdown": array of objects where each object includes:`,
    `   - "question": short question text`,
    `   - "percentage": integer 0-100 for that specific question`,
    `   - "why": short explanation of why that percentage was given`,
    `If the input contains multiple questions, return one "questionBreakdown" item per question.`,
    `If there is only one question, return one item in "questionBreakdown".`,
  ].join('\n');

  let response;
  try {
    response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert exam evaluator. Be fair, specific, and constructive. Always respond with valid JSON only.',
        },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
  } catch (error) {
    if (error.status === 401) {
      throw new Error('Invalid OPENAI_API_KEY. Update your .env with a valid OpenAI API key and restart the server.');
    }

    if (error.status === 429) {
      throw new Error('OpenAI quota exceeded. Check your OpenAI billing, usage limits, and project quota, then try again.');
    }

    if (error.status === 403) {
      throw new Error('OpenAI request was forbidden. Verify this API key has access to the requested model and project.');
    }

    throw error;
  }

  const raw = response.choices[0].message.content;
  const result = JSON.parse(raw);

  if (
    typeof result.score !== 'number' ||
    typeof result.feedback !== 'string' ||
    !Array.isArray(result.suggestions)
  ) {
    throw new Error('Unexpected response format from AI model.');
  }

  result.score = Math.max(0, Math.min(100, Math.round(result.score)));
  result.questionBreakdown = Array.isArray(result.questionBreakdown)
    ? result.questionBreakdown
        .map((item) => {
          const percentage = Number(item?.percentage);
          if (!Number.isFinite(percentage)) return null;

          return {
            question: typeof item?.question === 'string' ? item.question : 'Question',
            percentage: Math.max(0, Math.min(100, Math.round(percentage))),
            why:
              typeof item?.why === 'string' && item.why.trim()
                ? item.why
                : 'The response quality for this question is reflected in the score.',
          };
        })
        .filter(Boolean)
    : [];

  if (result.questionBreakdown.length === 0) {
    result.questionBreakdown = [
      {
        question: 'Question',
        percentage: result.score,
        why: 'Single-answer evaluation based on correctness, completeness, and clarity.',
      },
    ];
  }

  return result;
}

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
