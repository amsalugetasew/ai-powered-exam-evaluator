import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

let authToken = localStorage.getItem('exam-evaluator-token') || '';

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${authToken}`;
  }

  return config;
});

export const setAuthToken = (token) => {
  authToken = token || '';
  if (token) {
    localStorage.setItem('exam-evaluator-token', token);
  } else {
    localStorage.removeItem('exam-evaluator-token');
  }
};

export const getStoredUser = () => {
  const raw = localStorage.getItem('exam-evaluator-user');
  return raw ? JSON.parse(raw) : null;
};

export const setStoredUser = (user) => {
  if (user) {
    localStorage.setItem('exam-evaluator-user', JSON.stringify(user));
  } else {
    localStorage.removeItem('exam-evaluator-user');
  }
};

export const login = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const listUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const createUser = async (payload) => {
  const response = await api.post('/users', payload);
  return response.data;
};

export const updateUser = async (userId, payload) => {
  const response = await api.put(`/users/${userId}`, payload);
  return response.data;
};

export const changeUserPassword = async (userId, password) => {
  const response = await api.put(`/users/${userId}/password`, { password });
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

export const createExam = async (payload) => {
  const response = await api.post('/exams', payload);
  return response.data;
};

export const createExamWithFiles = async ({ title, questionFile, correctAnswerFile }) => {
  const formData = new FormData();
  formData.append('title', title);
  formData.append('questionFile', questionFile);
  formData.append('correctAnswerFile', correctAnswerFile);

  const response = await api.post('/exams/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const getInstructorExams = async () => {
  const response = await api.get('/exams/instructor');
  return response.data;
};

export const getStudentExams = async () => {
  const response = await api.get('/exams/student');
  return response.data;
};

export const submitStudentAnswer = async (examId, answer) => {
  const response = await api.post(`/exams/${examId}/submissions`, { answer });
  return response.data;
};

export const evaluateText = async (question, correctAnswer, studentAnswer) => {
  const response = await api.post('/evaluate', {
    question,
    correctAnswer,
    studentAnswer,
  });
  return response.data;
};

export default api;

export const evaluateFiles = async (questionFile, correctAnswerFile, studentAnswerFile) => {
  const formData = new FormData();
  formData.append('questionFile', questionFile);
  formData.append('correctAnswerFile', correctAnswerFile);
  formData.append('studentAnswerFile', studentAnswerFile);

  const response = await api.post('/evaluate/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
