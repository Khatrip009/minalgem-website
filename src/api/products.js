import apiClient from './client';

const BASE = '/masters/products';

export const getProducts = (params = {}) =>
  apiClient.get(BASE, { params }).then(res => res.data);

export const getProductBySlug = (slug) =>
  apiClient.get(`${BASE}/${slug}`).then(res => res.data);