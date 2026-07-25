import { supabase } from '../lib/supabase'

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

export const getCategoriesWithCounts = async () => {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (error) throw error

  // For each category, get the count of published products
  const withCounts = await Promise.all(
    categories.map(async (cat) => {
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', cat.id)
        .eq('is_published', true)
        .is('deleted_at', null)
      return { ...cat, product_count: count }
    })
  )
  return withCounts
}