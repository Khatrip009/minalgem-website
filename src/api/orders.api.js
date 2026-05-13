import apiClient from './client';

/**
 * Get all orders of the logged-in user
 * GET /api/sales/orders/my
 */
export const getMyOrders = () =>
  apiClient.get('/sales/orders/my').then(res => res.data);

/**
 * Get single order with items
 * GET /api/sales/orders/:id
 */
export const getOrder = (id) => {
  if (!id) throw new Error('order_id_required');
  return apiClient.get(`/sales/orders/${id}`).then(res => res.data);
};

/**
 * Get order timeline (status history)
 * GET /api/sales/orders/:id/timeline
 * Note: if the backend doesn't have a dedicated timeline route,
 * it may be part of the order detail response already.
 */
// ✅ Get order status timeline (uses internal route)
export const getOrderTimeline = (id) => {
  if (!id) throw new Error('order_id_required');
  return apiClient.get(`/internal/order-status-history/${id}`).then(res => res.data);
};