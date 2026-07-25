// src/api/stockAlerts.js
import { supabase } from '../lib/supabase'

/**
 * Register a stock alert for a product.
 * @param {string} product_id – UUID of the product
 * @param {string} email – user's email address
 * @returns {Object} the created alert
 */
export const registerStockAlert = async (product_id, email) => {
  const { data, error } = await supabase
    .from('stock_alerts')
    .insert([{ product_id, email }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}