import apiClient from './client';

export const identifyVisitor = (session_id, meta = {}) =>
  apiClient.post('/analytics/visitors/identify', { session_id, meta }).then(res => res.data);

export const trackEvent = (visitor_id, event_type, event_props = {}) =>
  apiClient.post('/analytics/visitors/event', { visitor_id, event_type, event_props }).then(res => res.data);