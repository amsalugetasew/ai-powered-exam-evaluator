# 🧠 Copilot Instructions: AI Exam Evaluator

## 📌 Project Overview

This project is an AI-powered web application that evaluates student answers by comparing them with model answers and generating scores and feedback.

---

## 🎯 Objectives

* Build a clean, responsive web interface
* Allow users to upload documents OR input text manually
* Use AI to evaluate answers
* Return structured results: score, feedback, suggestions

---

## 🧱 Tech Stack Guidelines

### Frontend

* Use React (JSX syntax)
* Use functional components only
* Use hooks (`useState`, `useEffect`)
* Styling must be done using Tailwind CSS
* Avoid inline CSS unless necessary

### Backend

* Use Node.js with Express
* Use REST API structure
* Handle JSON input/output
* Keep controllers modular

### AI Integration

* Use OpenAI API (or similar LLM)
* Keep prompts structured and reusable
* Responses must be parsed into JSON format

---

## 📂 Folder Structure

```
src/
 ├── components/
 │   ├── FileUpload.jsx
 │   ├── TextInput.jsx
 │   ├── EvaluationResult.jsx
 │   └── Navbar.jsx
 │
 ├── pages/
 │   ├── Home.jsx
 │   └── Dashboard.jsx
 │
 ├── services/
 │   └── aiService.js
 │
 ├── App.jsx
 └── main.jsx
```

---

## 🧩 Component Rules

### FileUpload.jsx

* Accept PDF, DOCX, TXT
* Show file name after upload
* Convert file to text before sending to backend

### TextInput.jsx

* Provide 3 text areas:

  * Question
  * Correct Answer
  * Student Answer

### EvaluationResult.jsx

* Display:

  * Score (highlighted)
  * Feedback
  * Suggestions (list format)

---

## 🔌 API Design

### POST /evaluate

#### Request:

```json
{
  "question": "string",
  "correctAnswer": "string",
  "studentAnswer": "string"
}
```

#### Response:

```json
{
  "score": number,
  "feedback": "string",
  "suggestions": ["string"]
}
```

---

## 🤖 AI Prompt Rules

When generating evaluation logic, always:

* Compare student answer with correct answer
* Identify missing key points
* Provide constructive feedback
* Return result strictly in JSON format

### Prompt Template

```
Evaluate the student's answer based on the correct answer.

Return:
- Score (0-100)
- Feedback
- Missing points as suggestions

Question:
{question}

Correct Answer:
{correctAnswer}

Student Answer:
{studentAnswer}
```

---

## 🎨 UI/UX Rules

* Use Tailwind utility classes only
* Maintain spacing and readability
* Use cards (`shadow`, `rounded-xl`, `p-4`)
* Ensure mobile responsiveness
* Avoid cluttered layouts

---

## ⚙️ Coding Standards

* Use ES6+ syntax
* Use async/await instead of `.then()`
* Use meaningful variable names
* Keep components small and reusable
* Separate logic into services

---

## 🚫 Do NOT

* Do NOT use class components
* Do NOT use inline styles heavily
* Do NOT mix business logic inside UI components
* Do NOT return unstructured AI responses

---

## ▶️ Running the Project

Use:

```
npm start
```

Do NOT use:

```
npm run dev
```

---

## 🧪 Testing Expectations

* Validate empty inputs
* Handle API errors gracefully
* Show loading state during evaluation
* Ensure consistent JSON response handling

---

## 📈 Future Extensions

* Batch evaluation (multiple students)
* Authentication system
* Export results (PDF)
* Teacher dashboard
* Plagiarism detection

---

## 🧠 Copilot Behavior Guidelines

When generating code:

* Prefer simplicity and readability
* Follow the defined folder structure
* Reuse components when possible
* Ensure API integration is clean and modular
* Always assume Tailwind is available

---

## ✅ Output Expectations

All generated code should be:

* Clean
* Functional
* Ready to run
* Consistent with project structure

---
## 🧑‍💻 Developer Notes 