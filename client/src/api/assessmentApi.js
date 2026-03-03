import apiClient from './apiClient';

export const fetchAssessments = () => apiClient.get('/assessments');
export const checkWeeklyStatus = () => apiClient.get('/assessments/check-week');
export const submitAssessment = (payload) => apiClient.post('/assessments/submit', payload);
