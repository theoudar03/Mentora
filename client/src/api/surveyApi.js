import apiClient from './apiClient';

export const fetchSurveyQuestions = () => {
  return apiClient.get('/survey/questions');
};
