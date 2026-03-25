require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

const evaluateRouter = require('./routes/evaluate');

const app = express();
const PORT = process.env.PORT || 3001;

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again after 15 minutes.' },
});

const evaluateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many evaluation requests. Please try again after 15 minutes.' },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use('/evaluate', evaluateLimiter, evaluateRouter);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'dist')));
  app.get('*', generalLimiter, (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  const apiKey = (process.env.OPENAI_API_KEY || '').trim().toLowerCase();
  if (!apiKey || apiKey === 'your_openai_api_key_here' || apiKey === 'your_openai_key_here') {
    console.warn('OPENAI_API_KEY is missing or placeholder. Evaluation will fail until it is configured in .env');
  }
});
