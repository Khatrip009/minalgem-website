// src/api/orders.api.js
import apiClient from './client';

/**
 * Get all orders of the logged-in user
 * GET /api/sales/orders/my
 */
export const getMyOrders = () =>
  apiClient.get('/sales/orders/my').then(res => res.data);

/**
 * Get single order with items and shipments
 * GET /api/sales/orders/:id
 */
export const getOrder = (id) => {
  if (!id) throw new Error('order_id_required');
  return apiClient.get(`/sales/orders/${id}`).then(res => res.data);
};

/**
 * Get order timeline (status history)
 * GET /api/internal/order-status-history/:id
 */
export const getOrderTimeline = (id) => {
  if (!id) throw new Error('order_id_required');
  return apiClient.get(`/internal/order-status-history/${id}`).then(res => res.data);
};

// ------------------------- ADMIN FUNCTIONS -------------------------

/**
 * List all orders (admin)
 * GET /api/sales/orders
 */
export const listOrders = (params = {}) =>
  apiClient.get('/sales/orders', { params }).then(res => res.data);

/**
 * Update order status (admin)
 * PATCH /api/sales/orders/:id/status
 */
export const updateOrderStatus = (id, payload) =>
  apiClient.patch(`/sales/orders/${id}/status`, payload).then(res => res.data);

/**
 * Export orders CSV (admin)
 * GET /api/sales/orders/export/csv
 */
export const exportOrdersCSV = () =>
  apiClient.get('/sales/orders/export/csv', { responseType: 'blob' }).then(res => res.data);

/**
 * Export orders PDF report (admin)
 * GET /api/sales/orders/export/pdf
 */
export const exportOrdersPDF = () =>
  apiClient.get('/sales/orders/export/pdf', { responseType: 'blob' }).then(res => res.data);

/**
 * Export shipping labels PDF (admin)
 * GET /api/sales/orders/export/shipping-labels
 */
export const exportShippingLabelsPDF = () =>
  apiClient.get('/sales/orders/export/shipping-labels', { responseType: 'blob' }).then(res => res.data);

/**
 * Get shipping quote for an order
 * POST /api/sales/orders/:id/shipping/quote
 */
export const getShippingQuote = (id, body = {}) =>
  apiClient.post(`/sales/orders/${id}/shipping/quote`, body).then(res => res.data);

// Constants
export const ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
export const PAYMENT_STATUS_OPTIONS = ['pending', 'paid', 'failed', 'refunded'];
export const FULFILLMENT_STATUS_OPTIONS = ['unfulfilled', 'partial', 'fulfilled'];

/**
 * Download invoice PDF for an order (customer)
 * GET /api/sales/orders/:id/invoice-pdf
 */
export const downloadOrderInvoice = (orderId) =>
  apiClient.get(`/sales/orders/${orderId}/invoice-pdf`, { responseType: 'blob' })
    .then(res => res.data);