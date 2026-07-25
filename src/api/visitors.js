// src/api/visitors.js
import { supabase } from '../lib/supabase'

/**
 * Identify a visitor by session ID. Creates a new visitor record if one
 * doesn't exist, or updates the last_seen timestamp.
 * @param {string} session_id
 * @param {Object} meta – any extra metadata
 * @returns {Object} the visitor record (including id)
 */
export const identifyVisitor = async (session_id, meta = {}) => {
  // Check if a visitor with this session already exists
  const { data: existing, error: lookupErr } = await supabase
    .from('visitors')
    .select('id, session_id, meta_data')
    .eq('session_id', session_id)
    .maybeSingle()

  if (lookupErr) throw new Error(lookupErr.message)

  if (existing) {
    // Update last_seen and merge meta
    const newMeta = { ...existing.meta_data, ...meta }
    const { data: updated, error: updateErr } = await supabase
      .from('visitors')
      .update({ last_seen: new Date().toISOString(), meta_data: newMeta })
      .eq('id', existing.id)
      .select()
      .single()

    if (updateErr) throw new Error(updateErr.message)
    return updated
  }

  // Create new visitor
  const { data: created, error: insertErr } = await supabase
    .from('visitors')
    .insert([{
      session_id,
      first_seen: new Date().toISOString(),
      last_seen: new Date().toISOString(),
      meta_data: meta,
    }])
    .select()
    .single()

  if (insertErr) throw new Error(insertErr.message)
  return created
}

/**
 * Track an event for a visitor.
 * @param {string} visitor_id
 * @param {string} event_type – e.g. 'page_view', 'product_click'
 * @param {Object} event_props – any extra data
 * @returns {Object} the created event
 */
export const trackEvent = async (visitor_id, event_type, event_props = {}) => {
  const { data, error } = await supabase
    .from('visitor_events')
    .insert([{
      visitor_id,
      event_type,
      event_props,
    }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}