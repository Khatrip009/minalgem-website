import apiClient from './client';

export const getReviews = (type, id) =>
  apiClient.get(`/reviews/${type}/${id}`).then(res => res.data);

export const getReviewSummary = (type, id) =>
  apiClient.get(`/reviews/${type}/${id}/summary`).then(res => res.data);

export const submitReview = (payload) =>
  apiClient.post('/reviews', payload).then(res => res.data);