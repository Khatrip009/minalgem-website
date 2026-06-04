import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, downloadOrderInvoice } from '../api/orders.api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

// Status badge styling helper (unchanged)
function getStatusStyles(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed' || s === 'paid')
    return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'cancelled')
    return 'bg-red-100 text-red-700 border-red-200';
  if (s === 'shipped')
    return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gold-100 text-gold-700 border-gold-200';
}

// Payment status badge (unchanged)
function getPaymentBadge(paymentStatus) {
  const s = (paymentStatus || '').toLowerCase();
  if (s === 'paid')
    return 'bg-green-50 text-green-600 border-green-100';
  if (s === 'failed')
    return 'bg-red-50 text-red-600 border-red-100';
  return 'bg-cream text-gold-600 border-gold-200';
}

export default function Orders() {
  const { user } = useAuth();
  const { currency, convertPrice, loading: currencyLoading } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  // Helper: get currency symbol (unchanged)
  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED';
      default: return '₹';
    }
  };

  const formatPrice = (priceInINR) => {
    if (!priceInINR && priceInINR !== 0) return null;
    const converted = convertPrice(priceInINR);
    const symbol = getCurrencySymbol(currency);
    if (currency === 'AED') return `${converted.toLocaleString()} ${symbol}`;
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    if (!user) return;
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getMyOrders();
      if (res.ok) setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    setDownloadingId(orderId);
    try {
      const blob = await downloadOrderInvoice(orderId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Could not download invoice. Please try again later.');
    } finally {
      setDownloadingId(null);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gold-700 tracking-widest">
            My Orders
          </h1>
          <p className="text-charcoal mt-2">
            Track your jewellery purchases and order history.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gold-200 rounded-sm shadow-sm">
            <p className="text-xl font-serif text-gold-600 mb-4">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/shop"
              className="inline-block px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const orderAmount = Number(order.grand_total || 0);
              const orderId = order.id || order.order_id;
              return (
                <div
                  key={orderId}
                  className="block bg-white border border-gold-200 rounded-sm shadow-sm hover:shadow-md hover:border-gold-400 transition p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Order Info */}
                    <div className="space-y-2">
                      <p className="font-serif text-lg text-charcoal">
                        Order #{order.order_number || orderId?.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gold-500">
                        {order.placed_at
                          ? new Date(order.placed_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })
                          : '—'}
                        {' · '}
                        {order.items_count || 0} items
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className={`inline-block px-3 py-1 text-xs uppercase tracking-widest border rounded-full ${getStatusStyles(order.status)}`}
                        >
                          {order.status || 'pending'}
                        </span>
                        <span
                          className={`inline-block px-3 py-1 text-xs uppercase tracking-widest border rounded-full ${getPaymentBadge(order.payment_status)}`}
                        >
                          {order.payment_status || 'pending'}
                        </span>
                        {order.fulfillment_status && (
                          <span className="inline-block px-3 py-1 text-xs uppercase tracking-widest border border-gold-200 text-gold-600 bg-cream rounded-full">
                            {order.fulfillment_status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Amount and Invoice Button */}
                    <div className="text-right">
                      {currencyLoading ? (
                        <div className="flex justify-end">
                          <div className="w-20 h-6 bg-gold-100 animate-pulse rounded"></div>
                        </div>
                      ) : (
                        <p className="text-2xl font-serif text-gold-700">
                          {formatPrice(orderAmount)}
                        </p>
                      )}
                      <div className="flex items-center justify-end gap-3 mt-2">
                        <Link
                          to={`/orders/${orderId}`}
                          className="text-xs text-gold-500 uppercase tracking-widest hover:text-gold-700 transition"
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={() => handleDownloadInvoice(orderId)}
                          disabled={downloadingId === orderId}
                          className="text-xs text-gold-600 uppercase tracking-widest border border-gold-300 px-2 py-1 rounded-sm hover:bg-gold-50 transition disabled:opacity-50"
                        >
                          {downloadingId === orderId ? '...' : 'Download Invoice'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}