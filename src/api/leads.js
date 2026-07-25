// src/api/leads.js
import { supabase } from '../lib/supabase'

/**
 * Submit a new lead (contact form, enquiry, etc.)
 * @param {Object} leadData – the lead fields (name, email, phone, message, etc.)
 * @returns {Object} – the inserted lead record
 */
export const submitLead = async (leadData) => {
  const { data, error } = await supabase
    .from('leads')
    .insert([leadData])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}