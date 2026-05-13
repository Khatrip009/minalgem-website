// src/api/account.api.js
import apiClient from './client';

/**
 * Account Overview – dashboard summary
 * GET /api/account/overview
 */
export const getAccountOverview = () =>
  apiClient.get('/account/overview').then(res => res.data);

/**
 * Get profile (user + customer merged)
 * GET /api/account/profile
 */
export const getAccountProfile = () =>
  apiClient.get('/account/profile').then(res => res.data);

/**
 * Update profile (user full_name + customer fields)
 * PUT /api/account/profile
 * @param {Object} data - { full_name, name, phone, country, company, metadata, email }
 */
export const updateAccountProfile = (data) =>
  apiClient.put('/account/profile', data).then(res => res.data);

/**
 * Change password
 * PUT /api/account/password
 * @param {string} current_password
 * @param {string} new_password
 */
export const changePassword = (current_password, new_password) =>
  apiClient.put('/account/password', { current_password, new_password }).then(res => res.data);

/**
 * Get order timeline (status history)
 * GET /api/account/orders/:id/timeline
 * @param {string|number} orderId
 */
export const getOrderTimeline = (orderId) =>
  apiClient.get(`/account/orders/${orderId}/timeline`).then(res => res.data);