import apiClient from './apiClient';

export const fetchStudents = () => apiClient.get('/students');
