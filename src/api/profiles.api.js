import apiClient from './client';

/* ======================================================
   PROFILE
====================================================== */

/** Fetch the logged-in user's profile (public_name, bio, metadata, avatar…) */
export const getMyProfile = () =>
  apiClient.get('/system/profile/me').then(res => res.data);

/** Create or update the logged-in user's profile */
export const updateProfile = (payload) =>
  apiClient.put('/system/profile', payload).then(res => res.data);

/** Upload avatar (multipart/form-data) */
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return apiClient
    .post('/system/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(res => res.data);
};

/* ======================================================
   ADDRESSES
====================================================== */

export const getAddresses = () =>
  apiClient.get('/crm/customer-addresses').then(res => res.data);

export const createAddress = (data) =>
  apiClient.post('/crm/customer-addresses', data).then(res => res.data);

export const updateAddress = (id, data) =>
  apiClient.put(`/crm/customer-addresses/${id}`, data).then(res => res.data);

export const deleteAddress = (id) =>
  apiClient.delete(`/crm/customer-addresses/${id}`).then(res => res.data);

/** Set address as default shipping */
export const setDefaultShipping = (id) =>
  apiClient.post(`/customer-addresses/${id}/default-shipping`).then(res => res.data);

/** Set address as default billing */
export const setDefaultBilling = (id) =>
  apiClient.post(`/customer-addresses/${id}/default-billing`).then(res => res.data);