import apiClient from './client';

export const submitLead = (leadData) =>
  apiClient.post('/leads', leadData).then(res => res.data);