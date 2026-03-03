import apiClient from './apiClient';

export const sendMessage    = (data) => apiClient.post('/chat/send', data);
export const getConversation = (userId) => apiClient.get(`/chat/conversation/${userId}`);
export const getChatList    = () => apiClient.get('/chat/list');
export const getContacts    = () => apiClient.get('/chat/contacts');
export const markRead       = (id) => apiClient.patch(`/chat/read/${id}`);
export const markDelivered  = (id) => apiClient.patch(`/chat/delivered/${id}`);
