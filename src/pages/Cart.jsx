import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, updateCartItem, removeCartItem } from '../api/cart';
import { getProductBySlug } from '../api/products';
import { getImageUrl } from '../utils/imageUrl';
import { useCurrency } from '../context/CurrencyContext';

export default function Cart() {
  const navigate = useNavigate();
  const { currency, convertPrice } = useCurrency();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(null);

  // Store product details fetched from API (slug -> product)
  const [products, setProducts] = useState({});

  useEffect(() => { fetchCart(); }, []);

  // When cart items change, fetch their product details
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

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getCart();
      if (res.ok) setCart(res.cart);
      else setError(res.error || 'Could not load cart');
    } catch (err) {
      setError('Failed to load cart');
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    setUpdating(itemId);
    try {
      const res = await updateCartItem(itemId, newQty);
      if (res.ok && res.cart) setCart(res.cart);
      else await fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to update quantity');
    } finally { setUpdating(null); }
  };

  const handleRemove = async (itemId) => {
    if (!window.confirm('Remove this item from your cart?')) return;
    setUpdating(itemId);
    try {
      const res = await removeCartItem(itemId);
      if (res.ok && res.cart) setCart(res.cart);
      else await fetchCart();
    } catch (err) {
      console.error(err);
      alert('Failed to remove item');
    } finally { setUpdating(null); }
  };

  const cartItems = cart?.items || [];
  const subtotal = Number(cart?.total || 0);   // backend uses 'total'
  const shipping = subtotal > 10000 ? 0 : 250;
  const total = subtotal + shipping;

  // Helper to display converted price
  const formatPrice = (price) => {
    if (!price) return '—';
    const converted = convertPrice(price);
    switch (currency) {
      case 'INR': return `₹${Number(converted).toLocaleString('en-IN')}`;
      case 'USD': return `$${converted.toLocaleString()}`;
      case 'EUR': return `€${converted.toLocaleString()}`;
      case 'GBP': return `£${converted.toLocaleString()}`;
      case 'AED': return `${converted.toLocaleString()} AED`;
      default: return `₹${Number(converted).toLocaleString('en-IN')}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-4xl md:text-5xl text-gold-700 text-center tracking-widest mb-4">
          Your Cart
        </h1>
        {error && <p className="text-center text-red-600 mb-8">{error}</p>}

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl font-serif text-gold-600 mb-4">Your cart is empty</p>
            <Link to="/shop" className="px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block mt-12">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-200 text-xs uppercase tracking-widest text-gold-600">
                    <th className="text-left pb-4 font-medium">Product</th>
                    <th className="text-right pb-4 font-medium">Price</th>
                    <th className="text-center pb-4 font-medium">Quantity</th>
                    <th className="text-right pb-4 font-medium">Total</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => {
                    const slug = item.product_slug || item.slug;
                    const product = products[slug];   // from product API
                    const imageUrl = product?.assets?.[0]?.url
                      ? getImageUrl(product.assets[0].url)
                      : '/placeholder.jpg';
                    const productTitle = product?.title || item.product_title || item.title;
                    const price = Number(item.unit_price || 0);
                    const qty = Number(item.quantity || 1);
                    const itemTotal = price * qty;
                    const itemId = item.item_id || item.id;

                    return (
                      <tr key={itemId} className="border-b border-gold-100">
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 flex-shrink-0 border border-gold-100">
                              <img
                                src={imageUrl}
                                alt={productTitle}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.src = '/placeholder.jpg')}
                              />
                            </div>
                            <div>
                              <Link
                                to={`/product/${slug}`}
                                className="font-serif text-charcoal hover:text-gold-600 transition"
                              >
                                {productTitle}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-right text-charcoal">{formatPrice(price)}</td>
                        <td className="py-5">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleQuantityChange(itemId, qty - 1)}
                              disabled={updating === itemId}
                              className="w-8 h-8 border border-gold-300 text-gold-600 hover:bg-gold-50 disabled:opacity-50"
                            >−</button>
                            <span className="w-10 text-center text-charcoal">{qty}</span>
                            <button
                              onClick={() => handleQuantityChange(itemId, qty + 1)}
                              disabled={updating === itemId}
                              className="w-8 h-8 border border-gold-300 text-gold-600 hover:bg-gold-50 disabled:opacity-50"
                            >+</button>
                          </div>
                        </td>
                        <td className="py-5 text-right font-medium text-charcoal">{formatPrice(itemTotal)}</td>
                        <td className="py-5 text-right">
                          <button
                            onClick={() => handleRemove(itemId)}
                            disabled={updating === itemId}
                            className="text-red-500 hover:text-red-700 text-sm uppercase tracking-widest disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden mt-8 space-y-6">
              {cartItems.map((item) => {
                const slug = item.product_slug || item.slug;
                const product = products[slug];
                const imageUrl = product?.assets?.[0]?.url
                  ? getImageUrl(product.assets[0].url)
                  : '/placeholder.jpg';
                const productTitle = product?.title || item.product_title || item.title;
                const price = Number(item.unit_price || 0);
                const qty = Number(item.quantity || 1);
                const itemTotal = price * qty;
                const itemId = item.item_id || item.id;

                return (
                  <div key={itemId} className="border border-gold-200 bg-white p-4 rounded-sm">
                    <div className="flex gap-4">
                      <div className="w-20 h-20 flex-shrink-0 border border-gold-100">
                        <img
                          src={imageUrl}
                          alt={productTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = '/placeholder.jpg')}
                        />
                      </div>
                      <div className="flex-1">
                        <Link to={`/product/${slug}`} className="font-serif text-charcoal">
                          {productTitle}
                        </Link>
                        <p className="text-gold-600 mt-1">{formatPrice(price)}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleQuantityChange(itemId, qty - 1)} className="w-7 h-7 border border-gold-300 text-gold-600">−</button>
                            <span className="w-8 text-center text-sm">{qty}</span>
                            <button onClick={() => handleQuantityChange(itemId, qty + 1)} className="w-7 h-7 border border-gold-300 text-gold-600">+</button>
                          </div>
                          <span className="font-medium text-charcoal">{formatPrice(itemTotal)}</span>
                          <button onClick={() => handleRemove(itemId)} className="text-red-500 text-xs uppercase tracking-widest">Remove</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals */}
            <div className="mt-12 border-t border-gold-200 pt-8 flex flex-col items-end">
              <div className="w-full max-w-sm space-y-4">
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm uppercase tracking-widest">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-charcoal">
                  <span className="text-sm uppercase tracking-widest">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-serif text-gold-700 pt-4 border-t border-gold-200">
                  <span>Total</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-3 bg-gold-500 text-white uppercase tracking-widest text-sm font-medium hover:bg-gold-600 transition"
                >
                  Proceed to Checkout
                </button>
                <Link to="/shop" className="block text-center text-sm text-gold-600 hover:text-gold-700 underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}