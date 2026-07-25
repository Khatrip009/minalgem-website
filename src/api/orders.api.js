// src/api/orders.api.js
import { supabase } from '../lib/supabase'

// ------------------------------------------------------------
//  CUSTOMER FUNCTIONS
// ------------------------------------------------------------

/**
 * Get all orders of the currently logged‑in user.
 */
export const getMyOrders = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not logged in')

  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items ( quantity, unit_price ), invoices ( invoice_number )`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Get a single order with full details (items, invoice, payments, tax lines, shipments).
 * Only the order owner can view it (RLS enforced).
 */
export const getOrder = async (id) => {
  if (!id) throw new Error('order_id_required')

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      customers ( name, email, phone ),
      order_items ( * ),
      invoices ( * ),
      order_payments ( * ),
      order_tax_lines ( * ),
      shipments ( * )
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data
}

/**
 * Get order timeline (status history).
 * Builds a timeline from payment records and current status.
 */
export const getOrderTimeline = async (id) => {
  if (!id) throw new Error('order_id_required')

  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, status, created_at')
    .eq('id', id)
    .single()

  if (orderErr || !order) throw new Error('Order not found')

  const timeline = [
    { status: 'created', date: order.created_at, note: 'Order placed' },
  ]

  const { data: payments } = await supabase
    .from('order_payments')
    .select('amount, paid_at, payment_method, status')
    .eq('order_id', id)
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

  timeline.push({
    status: order.status,
    date: new Date().toISOString(),
    note: `Current status: ${order.status}`,
  })

  return timeline
}

/**
 * Download invoice PDF for an order (customer).
 * Placeholder – you need to copy the `invoicepdf.js` utility from the admin project
 * into `src/utilities/invoicepdf.js` and then uncomment the code below.
 */
export const downloadOrderInvoice = async (orderId) => {
  // For now, just notify that the feature requires the invoice generator.
  throw new Error('Invoice PDF feature not yet enabled. Please copy the invoice utility from the admin project.')

  /*
  // After copying the utility, use this code:
  const { data: org } = await supabase.from('organizations').select('*').eq('slug', 'minal-gems').single()
  const order = await getOrder(orderId)

  const invoice = order.invoices?.[0]
  if (!invoice) throw new Error('No invoice found')

  // Dynamically import the invoice generator
  const { generateInvoicePDF } = await import('../utilities/invoicepdf')

  generateInvoicePDF({
    organization: org,
    invoice: {
      ...invoice,
      customer_name: order.customers?.name,
      shipping_address: order.shipping_address,
      order_number: order.order_number,
      created_at: invoice.created_at,
    },
    items: order.order_items || [],
    taxLines: order.order_tax_lines || [],
    payments: order.order_payments || [],
  })
  */
}

// ------------------------------------------------------------
//  ADMIN FUNCTIONS (if the website has an admin area)
// ------------------------------------------------------------

/**
 * List all orders (admin).
 * Optional filters: status, search, pagination.
 */
export const listOrders = async (params = {}) => {
  let query = supabase
    .from('orders')
    .select(`*, customers ( name ), order_items ( quantity )`)
    .order('created_at', { ascending: false })

  if (params.status) query = query.eq('status', params.status)
  if (params.search) query = query.or(`order_number.ilike.%${params.search}%,customers.name.ilike.%${params.search}%`)
  if (params.limit) query = query.limit(params.limit)
  if (params.offset) query = query.range(params.offset, params.offset + (params.limit || 20) - 1)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

/**
 * Update order status (admin).
 */
export const updateOrderStatus = async (id, payload) => {
  const { error } = await supabase
    .from('orders')
    .update({ status: payload.status })
    .eq('id', id)

  if (error) throw new Error(error.message)
  return { success: true }
}

/**
 * Export orders CSV (admin).
 * Returns a Blob for download.
 */
export const exportOrdersCSV = async () => {
  const { data } = await supabase.from('orders').select('*').csv()
  return new Blob([data], { type: 'text/csv' })
}

/**
 * Export orders PDF report (admin) – placeholder.
 */
export const exportOrdersPDF = async () => {
  return new Blob(['PDF report placeholder'], { type: 'application/pdf' })
}

/**
 * Export shipping labels PDF (admin) – placeholder.
 */
export const exportShippingLabelsPDF = async () => {
  return new Blob(['Shipping labels placeholder'], { type: 'application/pdf' })
}

/**
 * Get shipping quote for an order – placeholder.
 */
export const getShippingQuote = async (id, body = {}) => {
  return { carrier: 'Dummy', price: 0, estimated_days: 3 }
}

// Status options (shared)
export const ORDER_STATUS_OPTIONS = ['pending', 'confirmed', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']
export const PAYMENT_STATUS_OPTIONS = ['pending', 'completed', 'failed', 'refunded', 'partially_refunded']
export const FULFILLMENT_STATUS_OPTIONS = ['unfulfilled', 'partial', 'fulfilled']