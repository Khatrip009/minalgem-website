import apiClient from './client';

/**
 * Fetch categories (optionally include product counts)
 * Backend returns: { ok: true, categories: [...], page, limit, total, total_pages }
 * Each category: { id, slug, name, description, parent_id, trade_type, image_url, product_count? }
 */
export const getCategories = (params = {}) =>
  apiClient.get('/masters/categories', { params }).then(res => res.data);