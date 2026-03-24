# 🧠 AI Exam Evaluator

An AI-powered web application that evaluates student answers by comparing them with model answers and provides scores and feedback.

---

## 🚀 Features

* 📄 Upload exam documents (PDF, DOCX, TXT)
* ✍️ Manual text input for questions and answers
* 🤖 AI-based evaluation
* 📊 Score generation (0–100)
* 💡 Feedback and improvement suggestions
* 🌐 Clean and responsive UI

---

## 🛠️ Tech Stack

* **Frontend:** React (JSX) + Tailwind CSS (Vite)
* **Backend:** Node.js (Express)
* **AI:** OpenAI API (gpt-4o-mini)

---

## 📂 Project Structure

```
src/
 ├── components/    # Header, TextInput, FileUpload, EvaluationResult
 ├── pages/         # Home
 ├── services/      # api.js (axios)
 ├── App.jsx
 └── main.jsx

server/
 ├── server.js
 └── routes/
     └── evaluate.js
```

---

## 📥 Installation

```bash
git clone https://github.com/amsalugetasew/ai-powered-exam-evaluator.git
cd ai-powered-exam-evaluator
npm install
```

Copy the environment file and add your OpenAI API key:

```bash
cp .env.example .env
# Edit .env and set OPENAI_API_KEY=your_key_here
```

---

## ▶️ Run the Application

```bash
npm start
```

The app will be available at:

```
http://localhost:3000
```

The Express API server runs on port **3001**.

---

## 🧪 How It Works

1. Choose **Text Input** or **File Upload** mode
2. Provide the question, correct answer, and student answer
3. Click **Evaluate**
4. AI compares answers and returns:
   * Score (0–100)
   * Feedback
   * Improvement suggestions

---

## 🔌 API Reference

### `POST /evaluate` — text-based

**Request:**
```json
{
  "question": "What is AI?",
  "correctAnswer": "Artificial Intelligence is...",
  "studentAnswer": "AI is a technology..."
}
```

**Response:**
```json
{
  "score": 80,
  "feedback": "Good but lacks depth",
  "suggestions": ["Add definition", "Give examples"]
}
```

### `POST /evaluate/file` — file-based

Send a `multipart/form-data` request with fields:
* `questionFile` — PDF, DOCX, or TXT
* `correctAnswerFile` — PDF, DOCX, or TXT
* `studentAnswerFile` — PDF, DOCX, or TXT

---

## 🎯 Future Improvements

* Multi-student batch evaluation
* PDF result export
* Authentication system
* Teacher dashboard
* Plagiarism detection

---

## 📄 License

MIT License
