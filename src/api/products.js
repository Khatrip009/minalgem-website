// src/api/products.js
import { supabase } from '../lib/supabase'

/**
 * Fetch a list of products, optionally filtered by category, search, or limited.
 * @param {Object} params - { category, search, limit, offset }
 * @returns {Array} products with nested assets, diamonds, category, craftsman
 */
export const getProducts = async (params = {}) => {
  let query = supabase
    .from('products')
    .select(`*, product_assets (url, asset_type, is_primary), product_diamonds (*)`, { count: 'exact' })
    .eq('is_published', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (params.category) query = query.eq('category_id', params.category)
  if (params.search) query = query.or(`title.ilike.%${params.search}%,sku.ilike.%${params.search}%`)

  const page = params.page || 1
  const limit = params.limit || 12
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await query.range(from, to)

  if (error) throw error

  return {
    products: data || [],
    total: count || 0,
    page,
    pages: Math.ceil((count || 0) / limit),
  }
}
/**
 * Fetch a single product by its slug.
 * @param {string} slug
 * @returns {Object} product with nested assets, diamonds, category, craftsman
 */
export const getProductBySlug = async (slug) => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories ( name ),
      craftsmen ( name ),
      product_assets ( url, asset_type, is_primary ),
      product_diamonds ( * )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .is('deleted_at', null)
    .single()

  if (error) throw new Error(error.message)
  return data
}