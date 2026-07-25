import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getAddresses } from '../api/profiles.api';
import { getProductBySlug } from '../api/products';
import { getImageUrl } from '../utils/imageUrl';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cart
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
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

  // Order placement
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Product details fetched from Supabase
  const [products, setProducts] = useState({});

  // --------------- Cart fetching (Supabase) ---------------
  const getOrCreateCart = async (userId, visitorId) => {
    let query = supabase
      .from('carts')
      .select('*, cart_items (*)')
      .eq('status', 'active');

    if (userId) query = query.eq('user_id', userId);
    else if (visitorId) query = query.eq('visitor_id', visitorId);
    else return null;

    const { data, error } = await query.maybeSingle();
    if (error) throw error;
    if (data) return data;

    const newCart = {
      user_id: userId || null,
      visitor_id: visitorId || null,
      status: 'active',
      currency: 'INR',
      subtotal: 0,
      discount_total: 0,
      tax_total: 0,
      shipping_total: 0,
      grand_total: 0,
    };
    const { data: created, error: createErr } = await supabase
      .from('carts')
      .insert([newCart])
      .select('*, cart_items (*)')
      .single();
    if (createErr) throw createErr;
    return created;
  };

  const loadCartAndAddresses = async () => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    setError('');
    setLoadingCart(true);
    setAddressLoading(true);

    try {
      if (!localStorage.getItem('visitor_id')) {
        localStorage.setItem('visitor_id', crypto.randomUUID());
      }
      const visitorId = localStorage.getItem('visitor_id');

      const cartData = await getOrCreateCart(user.id, visitorId);
      if (!cartData || !cartData.cart_items?.length) {
        navigate('/cart');
        return;
      }
      setCart(cartData);
      setCartItems(cartData.cart_items);

      const addrList = await getAddresses();
      setAddresses(addrList);
      const def = addrList.find(a => a.is_default_shipping) || addrList[0] || null;
      if (def) setSelectedAddressId(def.id);
    } catch (err) {
      console.error(err);
      setError('Unable to load checkout data. Please refresh.');
    } finally {
      setLoadingCart(false);
      setAddressLoading(false);
    }
  };

  useEffect(() => { loadCartAndAddresses(); }, [user]);

  // Fetch product details when cart items change
  useEffect(() => {
    if (!cartItems.length) return;
    const slugs = cartItems.map(item => item.product_slug).filter(Boolean);
    const uniqueSlugs = [...new Set(slugs)];
    Promise.all(
      uniqueSlugs.map(slug =>
        getProductBySlug(slug)
          .then(product => ({ [slug]: product }))
          .catch(() => ({}))
      )
    ).then(results => {
      const merged = Object.assign({}, ...results);
      setProducts(prev => ({ ...prev, ...merged }));
    }).catch(console.error);
  }, [cartItems]);

  // Summary calculation
  const computeSummary = async () => {
    if (!cart || !selectedAddressId) return;
    setSummaryLoading(true);
    try {
      const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
      let shippingCost = 0;
      const { data: shippingRules } = await supabase.from('shipping_rules').select('*').eq('active', true).limit(1);
      if (shippingRules && shippingRules.length > 0) {
        const rule = shippingRules[0];
        if (rule.type === 'flat') shippingCost = Number(rule.amount);
        else if (rule.type === 'order_value' && subtotal < (rule.min_order_value || 0)) shippingCost = Number(rule.amount);
      } else {
        shippingCost = subtotal > 10000 ? 0 : 250;
      }
      let taxAmount = 0;
      const { data: taxRates } = await supabase.from('tax_rates').select('*').eq('is_active', true).eq('country', 'IN');
      if (taxRates && taxRates.length > 0) {
        const totalRate = taxRates.reduce((sum, tr) => sum + Number(tr.rate), 0);
        taxAmount = (subtotal * totalRate) / 100;
      }
      let discount = 0;
      if (appliedPromo) {
        if (appliedPromo.type === 'percent') discount = (subtotal * Number(appliedPromo.value)) / 100;
        else if (appliedPromo.type === 'fixed') discount = Number(appliedPromo.value);
        else if (appliedPromo.type === 'free_shipping') shippingCost = 0;
      }
      const grandTotal = subtotal - discount + shippingCost + taxAmount;
      setSummary({
        subtotal, discount, shipping: shippingCost, tax: taxAmount,
        grandTotal: Math.round(grandTotal * 100) / 100,
      });
    } catch (err) {
      console.error(err);
      setError('Could not calculate order summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (cart && selectedAddressId) computeSummary();
  }, [cart, selectedAddressId, appliedPromo]);

  // --------------- Promo code handling ---------------
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setPromoApplying(true);
    setPromoError('');
    try {
      const { data: promo, error: promoErr } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (promoErr || !promo) {
        setPromoError('Invalid promo code');
        setAppliedPromo(null);
        return;
      }

      const subtotal = summary?.subtotal || 0;
      if (subtotal < Number(promo.min_order)) {
        setPromoError(`Minimum order of ₹${promo.min_order} required`);
        setAppliedPromo(null);
        return;
      }

      setAppliedPromo(promo);
      setPromoError('');
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

  // --------------- Place Order (with customer fix & Razorpay) ---------------
  const handlePlaceOrder = async () => {
    if (!selectedAddressId || !cart || !summary) {
      alert('Please select a shipping address.');
      return;
    }

    setPlacingOrder(true);
    setError('');

    try {
      // ----- Ensure customer record exists -----
      let customerId;
      const { data: existingCustomer, error: custLookupErr } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (custLookupErr) throw custLookupErr;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const addr = addresses.find(a => a.id === selectedAddressId);
        const { data: newCustomer, error: custCreateErr } = await supabase
          .from('customers')
          .insert([{
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Customer',
            email: user.email,
            phone: addr?.phone || '',
          }])
          .select()
          .single();

        if (custCreateErr) throw custCreateErr;
        customerId = newCustomer.id;
      }

      // ----- Create order -----
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

      const orderNumber = 'OFF-' + Date.now().toString(36).toUpperCase();
      const { data: orderData, error: orderErr } = await supabase
        .from('orders')
        .insert([{
          order_number: orderNumber,
          user_id: user.id,
          customer_id: customerId,   // ✅ real customer ID
          status: 'pending',
          subtotal: summary.subtotal,
          shipping_cost: summary.shipping,
          tax_amount: summary.tax,
          discount_amount: summary.discount,
          grand_total: summary.grandTotal,
          currency: 'INR',
          shipping_address: shippingPayload,
          billing_address: shippingPayload,
          customer_note: '',
        }])
        .select()
        .single();

      if (orderErr) throw orderErr;
      setOrderId(orderData.id);

      // Insert order items
      const itemsToInsert = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_title: item.product_title,
        product_slug: item.product_slug,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        currency: 'INR',
        discount_amount: 0,
        tax_amount: (item.unit_price * item.quantity * (summary.tax / summary.subtotal)) || 0,
        metadata: item.metadata || {},
      }));
      await supabase.from('order_items').insert(itemsToInsert);

      // Insert invoice
      const invoiceNumber = 'INV-' + orderNumber + '-' + Math.random().toString(36).substring(2, 6);
      await supabase.from('invoices').insert([{
        order_id: orderData.id,
        invoice_number: invoiceNumber,
        status: 'unpaid',
        subtotal: summary.subtotal,
        tax_amount: summary.tax,
        shipping_cost: summary.shipping,
        total: summary.grandTotal,
        currency: 'INR',
      }]);

      // Insert tax lines
      if (summary.tax > 0) {
        await supabase.from('order_tax_lines').insert([{
          order_id: orderData.id,
          tax_type: 'CGST+SGST',
          tax_rate: (summary.tax / summary.subtotal) * 100,
          taxable_amount: summary.subtotal,
          tax_amount: summary.tax,
        }]);
      }

      // Create Razorpay order
      const amountInPaise = Math.round(summary.grandTotal * 100);
      const { data: razorpayRes, error: razorpayErr } = await supabase.functions.invoke('create-razorpay-order', {
        body: { order_id: orderData.id, amount: amountInPaise },
      });

      if (razorpayErr || !razorpayRes?.razorpay_order_id) {
        setError('Could not initiate payment. Please retry.');
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: amountInPaise,
        currency: 'INR',
        name: 'Minal Gems',
        description: `Order ${orderData.order_number}`,
        order_id: razorpayRes.razorpay_order_id,
        handler: async function (response) {
          const { data: verifyRes, error: verifyErr } = await supabase.functions.invoke('verify-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData.id,
            },
          });

          if (verifyErr || !verifyRes?.success) {
            setError('Payment verification failed. Please contact support.');
            return;
          }

          setOrderPlaced(true);
          navigate(`/order-success/${orderData.id}`);
        },
        modal: {
          ondismiss: function () {
            setError('Payment cancelled. You can retry.');
          },
        },
        prefill: {
          name: user?.full_name || '',
          email: user?.email || '',
        },
        theme: { color: '#B8860B' },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // --------------- Render (unchanged) ---------------
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
          {/* Left Column */}
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

            {/* Order Items */}
            <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
              <h2 className="font-serif text-2xl text-gold-600 mb-4">Your Items</h2>
              <div className="space-y-6">
                {cartItems.map(item => {
                  const slug = item.product_slug;
                  const product = products[slug];
                  const price = Number(item.unit_price || 0);
                  const qty = Number(item.quantity || 1);
                  const imageUrl = product?.product_assets?.[0]?.url
                    ? getImageUrl(product.product_assets[0].url)
                    : '/placeholder.jpg';
                  const title = product?.title || item.product_title;

                  return (
                    <div key={item.id} className="flex items-center gap-5 border-b border-gold-100 pb-4">
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

          {/* Right Column */}
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
            ) : summary ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Subtotal</span>
                  <span>₹{summary.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {summary.discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span className="uppercase tracking-widest">Discount</span>
                    <span>-₹{summary.discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Shipping</span>
                  <span>{summary.shipping === 0 ? 'Free' : `₹${summary.shipping}`}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="uppercase tracking-widest">Tax</span>
                  <span>₹{summary.tax.toLocaleString('en-IN')}</span>
                </div>
                <hr className="border-gold-200" />
                <div className="flex justify-between text-lg font-serif text-gold-700">
                  <span>Grand Total</span>
                  <span>₹{summary.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ) : null}

            {!orderPlaced && (
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !selectedAddressId}
                className="mt-6 w-full py-3 bg-gold-500 text-white uppercase tracking-widest text-sm font-medium hover:bg-gold-600 transition disabled:opacity-50"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order & Pay'}
              </button>
            )}

            {orderPlaced && (
              <div className="mt-6 text-center text-green-700 font-serif text-lg">
                Order placed! Redirecting...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}