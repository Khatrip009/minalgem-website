import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart } from '../api/cart';
import { getAddresses } from '../api/profiles.api';
import {
  getCheckoutSummary,
  placeOrder,
  applyPromoCode,
  createPaymentOrder,   // ✅ new
  verifyPayment,        // ✅ new
} from '../api/checkout';
import { useAuth } from '../context/AuthContext';
import { getProductBySlug } from '../api/products';
import { getImageUrl } from '../utils/imageUrl';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cart
  const [cart, setCart] = useState(null);
  const [loadingCart, setLoadingCart] = useState(true);

  // Addresses
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);

  // Checkout summary
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [error, setError] = useState('');

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoApplying, setPromoApplying] = useState(false);

  // Order & payment
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Product details (fetched from API)
  const [products, setProducts] = useState({});

  // Load cart & addresses on mount
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    loadCartAndAddresses();
  }, [user]);

  // Fetch product details when cart items change
  useEffect(() => {
    if (!cart?.items?.length) return;
    const slugs = cart.items
      .map(item => item.product_slug || item.slug)
      .filter(Boolean);
    const uniqueSlugs = [...new Set(slugs)];
    Promise.all(
      uniqueSlugs.map(slug =>
        getProductBySlug(slug)
          .then(res => (res.ok ? { [slug]: res.product } : {}))
          .catch(() => ({}))
      )
    ).then(results => {
      const merged = Object.assign({}, ...results);
      setProducts(prev => ({ ...prev, ...merged }));
    }).catch(console.error);
  }, [cart?.items]);

  const loadCartAndAddresses = async () => {
    setError('');
    try {
      const cartRes = await getCart();
      if (!cartRes.ok || !cartRes.cart || !cartRes.cart.items?.length) {
        navigate('/cart');
        return;
      }
      setCart(cartRes.cart);

      const addrRes = await getAddresses();
      if (addrRes.ok) {
        const list = addrRes.addresses || [];
        setAddresses(list);
        const def = list.find(a => a.is_default_shipping) || list[0] || null;
        if (def) setSelectedAddressId(def.id);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load checkout data. Please refresh.');
    } finally {
      setLoadingCart(false);
      setAddressLoading(false);
    }
  };

  // Re‑fetch summary whenever address or cart changes
  useEffect(() => {
    if (!cart?.id || !selectedAddressId) return;
    fetchSummary();
  }, [cart?.id, selectedAddressId]);

  const fetchSummary = async () => {
    setSummaryLoading(true);
    setError('');
    try {
      const addr = addresses.find(a => a.id === selectedAddressId);
      const payload = addr
        ? {
            full_name: addr.full_name,
            phone: addr.phone,
            line1: addr.line1,
            line2: addr.line2,
            city: addr.city,
            state: addr.state,
            postal_code: addr.postal_code,
            country: addr.country,
          }
        : null;

      const res = await getCheckoutSummary(cart.id, payload);
      if (res.ok) {
        setSummary(res);
      } else {
        setError('Could not load order summary.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load order summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoApplying(true);
    setPromoError('');
    try {
      const subtotal = summary?.amounts?.subtotal || 0;
      const res = await applyPromoCode(promoCode.trim().toUpperCase(), subtotal);
      if (res.ok && res.promo) {
        setAppliedPromo(res.promo);
        setPromoError('');
      } else {
        setPromoError(res.error || 'Invalid promo code');
        setAppliedPromo(null);
      }
    } catch (err) {
      console.error(err);
      setPromoError('Could not apply promo');
      setAppliedPromo(null);
    } finally {
      setPromoApplying(false);
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setAppliedPromo(null);
    setPromoError('');
  };

  // Compute final totals
  const getFinalAmounts = () => {
    if (!summary) return null;
    const base = summary.amounts;
    let subtotal = base.subtotal;
    let discount = base.discount_total || 0;
    let shipping = base.shipping_total || 0;
    let tax = base.tax_total || 0;

    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        discount += (subtotal * Number(appliedPromo.value || 0)) / 100;
      } else if (appliedPromo.type === 'fixed') {
        discount += Number(appliedPromo.value || 0);
      } else if (appliedPromo.type === 'free_shipping') {
        shipping = 0;
      }
    }
    const grand = subtotal - discount + shipping + tax;
    return { subtotal, discount, shipping, tax, grandTotal: Number(grand.toFixed(2)) };
  };

  const finalAmounts = getFinalAmounts();

  // ===== PLACE ORDER + INITIATE RAZORPAY PAYMENT =====
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address.');
      return;
    }
    setPlacingOrder(true);
    setError('');
    try {
      const addr = addresses.find(a => a.id === selectedAddressId);
      const shippingPayload = {
        full_name: addr.full_name,
        phone: addr.phone,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
      };
      // 1. Place the order
      const res = await placeOrder(
        cart.id,
        shippingPayload,
        shippingPayload,
        '',
        appliedPromo?.code || null
      );
      if (!res.ok || !res.order) {
        setError(res.error || 'Could not place order.');
        return;
      }

      const placedOrderId = res.order.id;
      setOrderId(placedOrderId);
      setOrderPlaced(true);

      // 2. Create Razorpay order
      const paymentRes = await createPaymentOrder(placedOrderId);
      if (!paymentRes.ok) {
        setError('Could not initialise payment. Please retry.');
        return;
      }

      // 3. Open Razorpay checkout modal
      const options = {
        key: paymentRes.key_id,
        amount: paymentRes.amount,
        currency: paymentRes.currency,
        name: 'MINALGEMS',
        description: `Order ${placedOrderId.slice(0, 8)}`,
        order_id: paymentRes.razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: placedOrderId,
            });
            if (verifyRes.ok) {
              setPaymentDone(true);
              setTimeout(() => navigate(`/order-success/${placedOrderId}`), 1000);
            } else {
              setError('Payment verification failed. Please contact support.');
            }
          } catch (e) {
            console.error(e);
            setError('Payment verification error.');
          }
        },
        modal: {
          ondismiss: function () {
            setError('Payment was cancelled. You can retry by placing the order again.');
          },
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        notes: {
          order_id: placedOrderId,
        },
        theme: {
          color: '#C68A1A',   // your gold theme
        },
      };
      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      setError('Failed to place order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loadingCart) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
        <p className="text-xl font-serif text-gold-600 mb-4">Your cart is empty</p>
        <button onClick={() => navigate('/shop')} className="px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition">
          Continue Shopping
        </button>
      </div>
    );
  }

  const cartItems = cart.items || [];

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl md:text-5xl text-gold-700 text-center tracking-widest mb-10">
          Checkout
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-8">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Left Column: Address & Items */}
          <div className="lg:col-span-2 space-y-8">
            {/* Address Selection */}
            <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
              <h2 className="font-serif text-2xl text-gold-600 mb-4">Shipping Address</h2>
              {addresses.length === 0 ? (
                <p className="text-charcoal text-sm">No saved addresses. Please add one in your profile.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label
                      key={addr.id}
                      className={`block border p-4 rounded-sm cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'border-gold-500 bg-gold-50'
                          : 'border-gold-200 hover:border-gold-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="hidden"
                      />
                      <div className="text-sm text-charcoal">
                        <p className="font-medium">{addr.full_name}</p>
                        <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                        <p>{addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postal_code}</p>
                        <p>{addr.country}</p>
                        <p>{addr.phone}</p>
                        {addr.is_default_shipping && (
                          <span className="text-xs text-gold-600 uppercase tracking-widest">Default Shipping</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Order Items – using product details from API */}
            <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
              <h2 className="font-serif text-2xl text-gold-600 mb-4">Your Items</h2>
              <div className="space-y-6">
                {cartItems.map(item => {
                  const slug = item.product_slug || item.slug;
                  const product = products[slug];
                  const price = Number(item.unit_price || 0);
                  const qty = Number(item.quantity || 1);
                  const imageUrl = product?.assets?.[0]?.url
                    ? getImageUrl(product.assets[0].url)
                    : '/placeholder.jpg';
                  const title = product?.title || item.product_title || item.title;

                  return (
                    <div key={item.item_id || item.id} className="flex items-center gap-5 border-b border-gold-100 pb-4">
                      <div className="w-20 h-20 flex-shrink-0 border border-gold-100">
                        <img
                          src={imageUrl}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = '/placeholder.jpg')}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-serif text-charcoal">{title}</p>
                        <p className="text-sm text-charcoal">Qty: {qty}</p>
                        <p className="text-sm text-gold-600">₹{price.toLocaleString('en-IN')}</p>
                      </div>
                      <p className="font-medium text-charcoal">₹{(price * qty).toLocaleString('en-IN')}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Totals, Promo, Place Order */}
          <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm h-fit">
            <h2 className="font-serif text-2xl text-gold-600 mb-6">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={e => setPromoCode(e.target.value)}
                  disabled={!!appliedPromo}
                  className="flex-1 border border-gold-300 px-4 py-2 text-charcoal text-sm focus:outline-none focus:border-gold-500 disabled:bg-gold-50"
                  placeholder="Enter code"
                />
                {appliedPromo ? (
                  <button
                    onClick={handleRemovePromo}
                    className="px-4 py-2 border border-gold-500 text-gold-600 text-sm uppercase tracking-widest hover:bg-gold-50 transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={handleApplyPromo}
                    disabled={promoApplying || !promoCode.trim()}
                    className="px-4 py-2 bg-gold-500 text-white text-sm uppercase tracking-widest hover:bg-gold-600 transition disabled:opacity-50"
                  >
                    {promoApplying ? '...' : 'Apply'}
                  </button>
                )}
              </div>
              {promoError && <p className="text-xs text-red-600 mt-1">{promoError}</p>}
              {appliedPromo && (
                <p className="text-xs text-green-700 mt-1">
                  {appliedPromo.code} applied – {appliedPromo.description || ''}
                </p>
              )}
            </div>

            {/* Amounts */}
            {summaryLoading ? (
              <p className="text-sm text-charcoal">Calculating...</p>
            ) : finalAmounts ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span>₹{finalAmounts.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {finalAmounts.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="uppercase tracking-widest">Discount</span>
                    <span>-₹{finalAmounts.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Shipping</span>
                  <span>{finalAmounts.shipping === 0 ? 'Free' : `₹${finalAmounts.shipping}`}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Tax</span>
                  <span>₹{finalAmounts.tax.toLocaleString('en-IN')}</span>
                </div>
                <hr className="border-gold-200" />
                <div className="flex justify-between text-lg font-serif text-gold-700">
                  <span>Grand Total</span>
                  <span>₹{finalAmounts.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : null}

            {/* Place Order button (launches Razorpay) */}
            {!paymentDone && (
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId}
                className="mt-6 w-full py-3 bg-gold-500 text-white uppercase tracking-widest text-sm font-medium hover:bg-gold-600 transition disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order & Pay'}
              </button>
            )}

            {paymentDone && (
              <div className="mt-6 text-center text-green-700 font-serif text-lg">
                Payment successful! Redirecting...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}