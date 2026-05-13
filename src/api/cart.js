import apiClient from './client';

// GET /api/cart
export const getCart = () =>
  apiClient.get('/cart').then(res => res.data);

// POST /api/cart/items  → body: { product_id, quantity }
export const addToCart = (product_id, quantity = 1) =>
  apiClient.post('/cart/items', { product_id, quantity }).then(res => res.data);

// PATCH /api/cart/items/:itemId  → body: { quantity }
export const updateCartItem = (itemId, quantity) =>
  apiClient.patch(`/cart/items/${itemId}`, { quantity }).then(res => res.data);

// DELETE /api/cart/items/:itemId
export const removeCartItem = (itemId) =>
  apiClient.delete(`/cart/items/${itemId}`).then(res => res.data);

// POST /api/cart/attach  → body: { anon_cart_id }
export const attachAnonymousCart = (anonCartId) =>
  apiClient.post('/cart/attach', { anon_cart_id: anonCartId }).then(res => res.data);