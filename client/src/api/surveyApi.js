import apiClient from './apiClient';

export const fetchSurveyQuestions = () => {
  return apiClient.get('/survey/weekly');
};
