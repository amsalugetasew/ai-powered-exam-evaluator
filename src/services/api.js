import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

export const evaluateText = async (question, correctAnswer, studentAnswer) => {
  const response = await api.post('/evaluate', {
    question,
    correctAnswer,
    studentAnswer,
  });
  return response.data;
};

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
