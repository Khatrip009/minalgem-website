// src/api/account.api.js
import { supabase } from '../lib/supabase'

/**
 * Account Overview – dashboard summary.
 * Returns: { orders: count, wishlist: count, ... }
 */
export async function getAccountOverview() {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not logged in')

  const [ordersRes, wishlistRes] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('wishlist_items').select('id', { count: 'exact', head: true })
      .in('wishlist_id', supabase.from('wishlists').select('id').eq('user_id', user.id))
  ])

  // Fallback if wishlist is empty
  let wishlistCount = 0
  if (!wishlistRes.error) {
    // We need to get the wishlist ID first
    const { data: wishlists } = await supabase.from('wishlists').select('id').eq('user_id', user.id)
    if (wishlists && wishlists.length > 0) {
      const { count } = await supabase.from('wishlist_items').select('id', { count: 'exact', head: true })
        .in('wishlist_id', wishlists.map(w => w.id))
      wishlistCount = count || 0
    }
  }

  return {
    orders: ordersRes.count || 0,
    wishlist: wishlistCount,
  }
}

/**
 * Get merged profile (user + customer).
 * Returns: { id, full_name, email, name, phone, country, company, avatar_url, role }
 */
export async function getAccountProfile() {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not logged in')

  // Fetch profile
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  // Fetch customer record (if exists)
  const { data: customer } = await supabase.from('customers').select('*').eq('user_id', user.id).maybeSingle()

  return {
    id: user.id,
    email: user.email,
    full_name: profile?.full_name || '',
    avatar_url: profile?.avatar_url || '',
    role: profile?.role || 'customer',
    name: customer?.name || '',
    phone: customer?.phone || '',
    country: customer?.country || '',
    company: customer?.company || '',
    metadata: customer?.metadata || {},
  }
}

/**
 * Update profile and customer data.
 * @param {Object} data – { full_name, name, phone, country, company, metadata, email }
 */
export async function updateAccountProfile(data) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not logged in')

  const profileUpdates = {}
  if (data.full_name !== undefined) profileUpdates.full_name = data.full_name
  if (data.avatar_url !== undefined) profileUpdates.avatar_url = data.avatar_url

  const customerUpdates = {}
  if (data.name !== undefined) customerUpdates.name = data.name
  if (data.phone !== undefined) customerUpdates.phone = data.phone
  if (data.country !== undefined) customerUpdates.country = data.country
  if (data.company !== undefined) customerUpdates.company = data.company
  if (data.metadata !== undefined) customerUpdates.metadata = data.metadata

  // Update email via auth if provided
  if (data.email && data.email !== user.email) {
    await supabase.auth.updateUser({ email: data.email })
  }

  // Update profile
  if (Object.keys(profileUpdates).length > 0) {
    await supabase.from('profiles').upsert({ id: user.id, ...profileUpdates })
  }

  // Update or create customer record
  if (Object.keys(customerUpdates).length > 0) {
    const { data: existing } = await supabase.from('customers').select('id').eq('user_id', user.id).maybeSingle()
    if (existing) {
      await supabase.from('customers').update(customerUpdates).eq('id', existing.id)
    } else {
      // Only create if at least name is provided
      if (customerUpdates.name) {
        await supabase.from('customers').insert({ user_id: user.id, ...customerUpdates })
      }
    }
  }

  return { success: true }
}

/**
 * Change password.
 * @param {string} current_password – not needed by Supabase (trusted session)
 * @param {string} new_password
 */
export async function changePassword(current_password, new_password) {
  const { error } = await supabase.auth.updateUser({ password: new_password })
  if (error) throw error
  return { success: true }
}

/**
 * Get order timeline (status history).
 * Since there's no dedicated order_events table, we return a synthetic timeline
 * consisting of the order creation and any payment records.
 * @param {string} orderId
 * @returns {Array<{ status: string, date: string, note?: string }>}
 */
export async function getOrderTimeline(orderId) {
  const user = (await supabase.auth.getUser()).data.user
  if (!user) throw new Error('Not logged in')

  // Fetch the order (ensure it belongs to the user)
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status, created_at, customer_note')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (orderErr || !order) throw new Error('Order not found')

  const timeline = [
    {
      status: 'created',
      date: order.created_at,
      note: order.customer_note || 'Order placed',
    },
  ]

  // Fetch payment records for this order
  const { data: payments } = await supabase
    .from('order_payments')
    .select('amount, paid_at, payment_method, status')
    .eq('order_id', orderId)
    .order('paid_at', { ascending: true })

  if (payments) {
    payments.forEach(p => {
      timeline.push({
        status: `payment_${p.status}`,
        date: p.paid_at || p.created_at,
        note: `${p.payment_method}: ₹${p.amount}`,
      })
    })
  }

  // Add current status at the end
  timeline.push({
    status: order.status,
    date: new Date().toISOString(),
    note: `Current status: ${order.status}`,
  })

  return timeline
}