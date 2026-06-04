import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, getOrderTimeline, downloadOrderInvoice } from '../api/orders.api';
import { getImageUrl } from '../utils/imageUrl';
import { useCurrency } from '../context/CurrencyContext';

/* -------------------------------------------------------
   Inline SVG icons (no external dependency)
------------------------------------------------------- */
const Truck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const PackageIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24" />
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const MapPin = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const Calendar = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

/* -------------------------------------------------------
   OrderDetail Component
------------------------------------------------------- */
export default function OrderDetail() {
  const { id } = useParams();
  const { currency, convertPrice, loading: currencyLoading } = useCurrency();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  // Helper: currency symbol
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
    if (!id) return;
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    try {
      const res = await getOrder(id);
      if (res.ok) {
        setOrder(res.order);
        setItems(res.items || []);
      } else {
        setError('Order not found.');
        return;
      }

      try {
        const tlRes = await getOrderTimeline(id);
        if (tlRes.ok) {
          setTimeline(tlRes.rows || []);
        }
      } catch {
        setTimeline([]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const blob = await downloadOrderInvoice(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${order.order_number || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Invoice download failed:', err);
      alert('Could not download invoice. Please try again later.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center gap-4">
        <p className="text-xl font-serif text-gold-600">{error || 'Order not found'}</p>
        <Link
          to="/orders"
          className="px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const getStatusStyles = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed' || s === 'paid') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
    if (s === 'shipped') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gold-100 text-gold-700 border-gold-200';
  };

  const getPaymentBadge = (ps) => {
    const s = (ps || '').toLowerCase();
    if (s === 'paid') return 'bg-green-50 text-green-600 border-green-100';
    if (s === 'failed') return 'bg-red-50 text-red-600 border-red-100';
    return 'bg-cream text-gold-600 border-gold-200';
  };

  const shipments = order.shipments || [];

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center">
          <h1 className="font-serif text-4xl md:text-5xl text-gold-700 tracking-widest">
            Order {order.order_number || order.id?.slice(0, 8)}
          </h1>
          <p className="text-charcoal mt-2">
            Placed on{' '}
            {order.placed_at
              ? new Date(order.placed_at).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </p>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className={`px-4 py-1.5 text-xs uppercase tracking-widest border rounded-full ${getStatusStyles(order.status)}`}>
            {order.status || 'pending'}
          </span>
          <span className={`px-4 py-1.5 text-xs uppercase tracking-widest border rounded-full ${getPaymentBadge(order.payment_status)}`}>
            {order.payment_status || 'pending'}
          </span>
          {order.fulfillment_status && (
            <span className="px-4 py-1.5 text-xs uppercase tracking-widest border border-gold-200 text-gold-600 bg-cream rounded-full">
              {order.fulfillment_status}
            </span>
          )}
        </div>

        {/* Shipments */}
        {shipments.length > 0 && (
          <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
            <h2 className="font-serif text-2xl text-gold-600 mb-6 flex items-center gap-2">
              <Truck size={24} />
              Shipment Tracking
            </h2>
            <div className="space-y-4">
              {shipments.map((s) => (
                <div key={s.id} className="border border-gold-100 rounded p-4 flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-charcoal">Status:</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusStyles(s.status)}`}>
                        {s.status}
                      </span>
                    </div>
                    {s.carrier && (
                      <div className="flex items-center gap-2 text-sm text-charcoal">
                        <MapPin size={14} />
                        <span>Carrier: {s.carrier}</span>
                      </div>
                    )}
                    {s.tracking_number && (
                      <div className="flex items-center gap-2 text-sm text-charcoal">
                        <PackageIcon size={14} />
                        <span>Tracking: {s.tracking_number}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-gold-500">
                    {s.shipped_at && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Shipped: {new Date(s.shipped_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    )}
                    {s.delivered_at && (
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Delivered: {new Date(s.delivered_at).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Items</h2>
          <div className="space-y-4">
            {items.map((it) => {
              const qty = Number(it.quantity || 1);
              const unitPrice = Number(it.unit_price || 0);
              const lineTotal = Number(it.line_total || it.subtotal || unitPrice * qty);
              const imageUrl = it.primary_image ? getImageUrl(it.primary_image) : '/placeholder.jpg';

              return (
                <div key={it.id} className="flex items-center gap-4 pb-4 border-b border-gold-100 last:border-0 last:pb-0">
                  <div className="w-16 h-16 flex-shrink-0 border border-gold-100">
                    <img src={imageUrl} alt={it.title || 'Product'} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    {it.slug ? (
                      <Link to={`/product/${it.slug}`} className="font-serif text-charcoal hover:text-gold-600 transition">
                        {it.title || 'Product'}
                      </Link>
                    ) : (
                      <p className="font-serif text-charcoal">{it.title || 'Product'}</p>
                    )}
                    <p className="text-sm text-charcoal mt-1">
                      Qty: {qty} × {currencyLoading ? (
                        <span className="inline-block w-10 h-3 bg-gold-100 animate-pulse rounded"></span>
                      ) : (
                        formatPrice(unitPrice)
                      )}
                    </p>
                  </div>
                  <p className="font-medium text-charcoal">
                    {currencyLoading ? (
                      <span className="inline-block w-14 h-4 bg-gold-100 animate-pulse rounded"></span>
                    ) : (
                      formatPrice(lineTotal)
                    )}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Totals */}
        <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Order Summary</h2>
          <div className="space-y-3 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-charcoal">
              <span className="uppercase tracking-widest">Subtotal</span>
              <span>
                {currencyLoading ? (
                  <span className="inline-block w-16 h-4 bg-gold-100 animate-pulse rounded"></span>
                ) : (
                  formatPrice(Number(order.subtotal || 0))
                )}
              </span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between text-green-700">
                <span className="uppercase tracking-widest">Discount</span>
                <span>
                  {currencyLoading ? (
                    <span className="inline-block w-16 h-4 bg-gold-100 animate-pulse rounded"></span>
                  ) : (
                    `-${formatPrice(Number(order.discount_total || 0))}`
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between text-charcoal">
              <span className="uppercase tracking-widest">Shipping</span>
              <span>
                {currencyLoading ? (
                  <span className="inline-block w-16 h-4 bg-gold-100 animate-pulse rounded"></span>
                ) : (
                  (Number(order.shipping_total || 0) === 0 ? 'Free' : formatPrice(Number(order.shipping_total || 0)))
                )}
              </span>
            </div>
            <div className="flex justify-between text-charcoal">
              <span className="uppercase tracking-widest">Tax</span>
              <span>
                {currencyLoading ? (
                  <span className="inline-block w-16 h-4 bg-gold-100 animate-pulse rounded"></span>
                ) : (
                  formatPrice(Number(order.tax_total || 0))
                )}
              </span>
            </div>
            <hr className="border-gold-200" />
            <div className="flex justify-between text-lg font-serif text-gold-700">
              <span>Grand Total</span>
              <span>
                {currencyLoading ? (
                  <span className="inline-block w-20 h-5 bg-gold-100 animate-pulse rounded"></span>
                ) : (
                  formatPrice(Number(order.grand_total || 0))
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white border border-gold-200 p-6 rounded-sm shadow-sm">
          <h2 className="font-serif text-2xl text-gold-600 mb-6">Order Timeline</h2>
          {timeline.length === 0 ? (
            <p className="text-charcoal italic">No status updates yet.</p>
          ) : (
            <div className="space-y-5">
              {timeline.map((t, idx) => (
                <div key={t.id || idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-gold-500 mt-1.5" />
                    <div className="w-px h-full bg-gold-200" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize text-charcoal">
                        {t.from_status || 'start'} → {t.to_status || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gold-500">
                      {new Date(t.changed_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {t.note && <p className="text-sm text-charcoal mt-1">{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Link
            to="/orders"
            className="px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition"
          >
            Back to Orders
          </Link>
          <button
            onClick={handleDownloadInvoice}
            disabled={downloadingInvoice}
            className="px-8 py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm hover:bg-gold-50 transition disabled:opacity-50 flex items-center gap-2"
          >
            {downloadingInvoice ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-600 border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              'Download Invoice'
            )}
          </button>
          <Link
            to="/shop"
            className="px-8 py-3 bg-gold-500 text-white uppercase tracking-widest text-sm hover:bg-gold-600 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}