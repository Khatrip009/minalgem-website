import apiClient from './client';

export const registerStockAlert = (product_id, email) =>
  apiClient.post('/stock-alerts/register', { product_id, email }).then(res => res.data);