import apiClient from './client';

export const getHeroSlides = () =>
  apiClient.get('/masters/hero').then(res => res.data);