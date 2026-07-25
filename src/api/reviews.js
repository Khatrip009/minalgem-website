// src/api/reviews.js
import { supabase } from '../lib/supabase'

/**
 * Get reviews for a specific item (product, category, etc.).
 * @param {string} type - 'product' or other about_type
 * @param {string} id   - UUID of the item
 * @returns {Array} reviews
 */
export const getReviews = async (type, id) => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('about_type', type)
    .eq('about_id', id)
    .eq('is_published', true)            // only show published reviews
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Get review summary (average rating, star distribution) for an item.
 * @param {string} type
 * @param {string} id
 * @returns {Object} aggregate
 */
export const getReviewSummary = async (type, id) => {
  const { data, error } = await supabase
    .from('review_aggregates')
    .select('*')
    .eq('about_type', type)
    .eq('about_id', id)
    .single()

  // If no aggregate exists yet, return a default empty summary
  if (error && error.code === 'PGRST116') {
    return {
      about_type: type,
      about_id: id,
      avg_rating: 0,
      rating_count: 0,
      rating_1: 0,
      rating_2: 0,
      rating_3: 0,
      rating_4: 0,
      rating_5: 0,
    }
  }
  if (error) throw new Error(error.message)
  return data
}

/**
 * Submit a new review.
 * @param {Object} payload – { about_type, about_id, rating, title, body, author_name, author_email }
 * @returns {Object} the inserted review
 */
export const submitReview = async (payload) => {
  // Ensure the user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new Error('You must be logged in to submit a review')

  const reviewData = {
    ...payload,
    author_id: user.id,
    is_published: false,   // reviews require moderation by default
    is_flagged: false,
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}