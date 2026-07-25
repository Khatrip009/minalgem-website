// src/api/profiles.api.js
import { supabase } from '../lib/supabase'
import { uploadFile, getAssetUrl } from '../utilities/storage'

/* ======================================================
   PROFILE
====================================================== */

/** Fetch the logged-in user's profile + customer data */
export const getMyProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch customer record (if any)
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

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
    notes: customer?.notes || '',
    metadata: customer?.metadata || {},
  }
}

/** Update profile fields and customer fields */
export const updateProfile = async (payload) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Split into profile and customer updates
  const profileFields = {}
  if (payload.full_name !== undefined) profileFields.full_name = payload.full_name
  if (payload.avatar_url !== undefined) profileFields.avatar_url = payload.avatar_url

  const customerFields = {}
  if (payload.name !== undefined) customerFields.name = payload.name
  if (payload.phone !== undefined) customerFields.phone = payload.phone
  if (payload.country !== undefined) customerFields.country = payload.country
  if (payload.company !== undefined) customerFields.company = payload.company
  if (payload.notes !== undefined) customerFields.notes = payload.notes
  if (payload.metadata !== undefined) customerFields.metadata = payload.metadata

  // Update email separately if provided
  if (payload.email && payload.email !== user.email) {
    await supabase.auth.updateUser({ email: payload.email })
  }

  // Update profile
  if (Object.keys(profileFields).length > 0) {
    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...profileFields })
    if (profileErr) throw new Error(profileErr.message)
  }

  // Update or create customer record
  if (Object.keys(customerFields).length > 0) {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      const { error: custErr } = await supabase
        .from('customers')
        .update(customerFields)
        .eq('id', existing.id)
      if (custErr) throw new Error(custErr.message)
    } else {
      // Only create customer if name is provided
      if (customerFields.name) {
        const { error: insertErr } = await supabase
          .from('customers')
          .insert([{ user_id: user.id, ...customerFields }])
        if (insertErr) throw new Error(insertErr.message)
      }
    }
  }

  return { success: true }
}

/** Upload avatar to custom storage and return the public URL */
export const uploadAvatar = async (file) => {
  // Upload to 'avatars' folder
  const relativePath = await uploadFile(file, 'avatars')

  // Update the profile with the new avatar path
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase.from('profiles').upsert({ id: user.id, avatar_url: relativePath })
  }

  return { url: getAssetUrl(relativePath), relativePath }
}

/* ======================================================
   ADDRESSES
====================================================== */

/** Get all addresses for the current customer */
export const getAddresses = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Get customer id
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) return []

  const { data, error } = await supabase
    .from('customer_addresses')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/** Create a new address */
export const createAddress = async (data) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // Get customer id (create customer if not exists? maybe not)
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!customer) throw new Error('Customer record not found – please update your profile first')

  const { data: address, error } = await supabase
    .from('customer_addresses')
    .insert([{ ...data, customer_id: customer.id }])
    .select()
    .single()

  if (error) throw new Error(error.message)
  return address
}

/** Update an existing address */
export const updateAddress = async (id, data) => {
  const { error } = await supabase
    .from('customer_addresses')
    .update(data)
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

/** Delete an address */
export const deleteAddress = async (id) => {
  const { error } = await supabase
    .from('customer_addresses')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

/** Set an address as default shipping */
export const setDefaultShipping = async (id) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  // First, unset any existing default shipping for this customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (customer) {
    await supabase
      .from('customer_addresses')
      .update({ is_default_shipping: false })
      .eq('customer_id', customer.id)
      .eq('is_default_shipping', true)
  }

  // Now set the new default
  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default_shipping: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

/** Set an address as default billing */
export const setDefaultBilling = async (id) => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (customer) {
    await supabase
      .from('customer_addresses')
      .update({ is_default_billing: false })
      .eq('customer_id', customer.id)
      .eq('is_default_billing', true)
  }

  const { error } = await supabase
    .from('customer_addresses')
    .update({ is_default_billing: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}