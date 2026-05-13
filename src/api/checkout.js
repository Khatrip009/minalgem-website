import apiClient from './client';

/**
 * Fetch checkout summary (subtotal, shipping, tax, available promos, etc.)
 * POST /api/checkout/summary
 */
export const getCheckoutSummary = (cartId, shippingAddress = null) => {
  const body = { cart_id: cartId };
  if (shippingAddress) body.shipping_address = shippingAddress;
  return apiClient.post('/checkout/summary', body).then(res => res.data);
};

/**
 * Place the order (creates order, marks cart as converted)
 * POST /api/checkout/place-order
 */
export const placeOrder = (cartId, shippingAddress, billingAddress, notes = '', promoCode = null) => {
  const body = {
    cart_id: cartId,
    shipping_address: shippingAddress,
    billing_address: billingAddress || shippingAddress,
    notes,
  };
  if (promoCode) body.promo_code = promoCode;
  return apiClient.post('/checkout/place-order', body).then(res => res.data);
};

/**
 * Pay for order (simulated test payment)
 * POST /api/checkout/pay
 */
export const payForOrder = (orderId, amount, paymentMethod = 'test_manual') =>
  apiClient
    .post('/checkout/pay', {
      order_id: orderId,
      amount,
      payment_method: paymentMethod,
    })
    .then(res => res.data);

/**
 * Apply a promo code (returns discount & promo details)
 * POST /api/sales/promos/apply
 */
export const applyPromoCode = (code, subtotal) =>
  apiClient
    .post('/sales/promos/apply', { promo_code: code, subtotal })
    .then(res => res.data);
    /** Create a Razorpay order for real payment */
export const createPaymentOrder = (orderId) =>
  apiClient.post('/checkout/create-payment', { order_id: orderId }).then(res => res.data);

/** Verify Razorpay payment signature and mark order as paid */
export const verifyPayment = (payload) =>
  apiClient.post('/checkout/verify-payment', payload).then(res => res.data);