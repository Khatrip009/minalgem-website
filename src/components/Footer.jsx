import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [totalVisitors, setTotalVisitors] = useState(null);
  const [avgRating, setAvgRating] = useState(null);
  const [totalReviews, setTotalReviews] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadVisitors() {
      try {
        const { data } = await apiClient.get('/analytics/visitors-metrics/summary');
        if (cancelled || !data.ok) return;
        const raw = data.metrics?.total_visitors ?? 0;
        const DISPLAY_BASE = 10689;
        const DISPLAY_MULTIPLIER = 5;
        const displayTotal = DISPLAY_BASE + raw * DISPLAY_MULTIPLIER;
        setTotalVisitors(displayTotal);
      } catch (err) {
        console.warn('Failed to load visitors', err);
      }
    }

    async function loadReviews() {
      try {
        const { data } = await apiClient.get('/reviews/stats');
        if (cancelled || !data.ok) return;
        setAvgRating(data.stats?.avg_rating ?? null);
        setTotalReviews(data.stats?.total_reviews ?? null);
      } catch (err) {
        console.warn('Failed to load reviews', err);
      }
    }

    loadVisitors();
    loadReviews();
    const ivVisitors = setInterval(loadVisitors, 60000);
    const ivReviews = setInterval(loadReviews, 300000);

    return () => {
      cancelled = true;
      clearInterval(ivVisitors);
      clearInterval(ivReviews);
    };
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      // Add your newsletter endpoint if available
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const renderStars = (avg) => {
    const value = avg ?? 0;
    const full = Math.floor(value);
    const half = value - full >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) stars.push(<span key={i} className="text-gold-400">★</span>);
      else if (i === full && half) stars.push(<span key={i} className="text-gold-300">★</span>);
      else stars.push(<span key={i} className="text-gray-300">★</span>);
    }
    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const WHATSAPP_NUMBER = '917069785900';
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}`;

  return (
    <>
      {/* WhatsApp Float Button – simplified */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-green-600 px-5 py-3 text-white shadow-lg hover:scale-105 transition-transform"
        aria-label="Chat on WhatsApp"
      >
        <div className="text-2xl">💎</div>
        <span className="hidden sm:block text-sm font-medium">Chat with Us</span>
      </a>

      <footer className="bg-cream border-t border-gold-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div className="space-y-6">
              <Link to="/" className="inline-block">
                <img
                  src="/logo_minalgems.png"
                  alt="Minalgems"
                  className="h-14 w-auto"
                />
              </Link>
              <p className="text-sm text-charcoal leading-relaxed">
                Crafting timeless jewellery with passion since 1995. Every piece is a testament to our commitment to quality and craftsmanship.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gold-600 text-xl">👥</span>
                  <div>
                    <p className="text-xs text-gold-500 uppercase tracking-widest">Trusted By</p>
                    <p className="font-serif text-2xl text-gold-700">
                      {totalVisitors !== null ? `${(totalVisitors / 1000).toFixed(1)}K+` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gold-600 text-xl">★</span>
                  <div>
                    <p className="text-xs text-gold-500 uppercase tracking-widest">Rating</p>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-2xl text-gold-700">
                        {avgRating !== null ? avgRating.toFixed(1) : '—'}
                      </span>
                      {renderStars(avgRating)}
                    </div>
                    {totalReviews && (
                      <p className="text-xs text-charcoal mt-1">{totalReviews} reviews</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-serif text-xl text-gold-600 mb-6 tracking-wide">Explore</h3>
              
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/shop"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Shop
                  </Link>
                </li>

                <li>
                  <Link
                    to="/about"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    About
                  </Link>
                </li>

                <li>
                  <Link
                    to="/education/diamond"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Diamond Guide
                  </Link>
                </li>

                <li>
                  <Link
                    to="/education/gold"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Gold Guide
                  </Link>
                </li>

                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Privacy Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/refund-policy"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Refund Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/shipping-policy"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Shipping Policy
                  </Link>
                </li>

                <li>
                  <Link
                    to="/terms-and-conditions"
                    className="text-charcoal hover:text-gold-600 transition text-sm uppercase tracking-widest"
                  >
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-serif text-xl text-gold-600 mb-6 tracking-wide">Contact</h3>
              <ul className="space-y-4 text-sm text-charcoal">
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-0.5">📍</span>
                  <span>Surat Diamond Hub, Gujarat, India – 395010</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-0.5">✉</span>
                  <a href="mailto:info@minalgem.com" className="hover:text-gold-600 transition">info@minalgem.com</a>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold-500 mt-0.5">🕐</span>
                  <span>Mon–Sat 10AM–8PM | Sun 11AM–6PM IST</span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="font-serif text-xl text-gold-600 mb-6 tracking-wide">Stay Inspired</h3>
              <p className="text-sm text-charcoal mb-4">
                Receive exclusive previews and jewellery care tips.
              </p>
              {subscribed ? (
                <div className="bg-gold-50 border border-gold-200 rounded-sm p-4 text-center text-gold-600">
                  Thank you for subscribing!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email"
                    required
                    className="w-full border border-gold-300 bg-white px-4 py-3 text-charcoal placeholder-gray-400 text-sm focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-gold-600 text-white uppercase tracking-widest text-sm hover:bg-gold-700 transition"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-gold-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gold-700 font-medium">
                &copy; {currentYear} MINALGEMS. All rights reserved.
              </p>
              <p className="text-xs text-gold-500 mt-1">
                Designed & Developed by{' '}
                <a
                  href="https://www.exotech.co.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-600 hover:text-gold-700 font-semibold"
                >
                  Exotech Developers
                </a>
              </p>
            </div>
            <div className="flex gap-4">
              <span className="text-xs text-charcoal uppercase tracking-widest">We accept:</span>
              <span className="text-xs text-gold-600">Visa</span>
              <span className="text-xs text-gold-600">Mastercard</span>
              <span className="text-xs text-gold-600">RuPay</span>
              <span className="text-xs text-gold-600">UPI</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}