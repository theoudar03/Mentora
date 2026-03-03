import apiClient from './apiClient';

export const fetchMentorDashboard = () => apiClient.get('/mentor/dashboard');
export const addStudent = (studentData) => apiClient.post('/mentor/add-student', studentData);
