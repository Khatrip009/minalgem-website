// src/components/Header.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getCart } from '../api/cart';
import NotificationBell from './NotificationBell';

export default function Header() {
  const { user, logout } = useAuth();
  const { currency, changeCurrency } = useCurrency();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [educationOpen, setEducationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const educationRef = useRef(null);
  const profileRef = useRef(null);

  // Fetch cart count
  useEffect(() => {
    if (user) {
      fetchCartCount();
    } else {
      setCartCount(0);
    }
  }, [user]);

  const fetchCartCount = async () => {
    try {
      const res = await getCart();
      if (res.ok && res.cart) {
        const items = res.cart.items || [];
        const count = items.reduce((sum, item) => sum + Number(item.quantity || 1), 0);
        setCartCount(count);
      }
    } catch {
      setCartCount(0);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (educationRef.current && !educationRef.current.contains(event.target)) {
        setEducationOpen(false);
      }
    };
    if (educationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [educationOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const handleLogout = async () => {
    await logout();
    setProfileOpen(false);
    setCartCount(0);
  };

  return (
    <header className="border-b border-gold-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2 sm:gap-4">

          {/* Logo - responsive height */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/logo_minalgems.png"
              alt="Minalgems"
              className="h-10 sm:h-12 md:h-14 w-auto"
            />
          </Link>

          {/* Desktop Navigation (hidden on mobile) */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-8 text-xs md:text-sm uppercase tracking-widest text-charcoal">
            <Link to="/" className="hover:text-gold-600 transition py-2">Home</Link>
            <Link to="/shop" className="hover:text-gold-600 transition py-2">Shop</Link>
            <Link to="/about" className="hover:text-gold-600 transition py-2">About</Link>
            <Link to="/contact" className="hover:text-gold-600 transition py-2">Contact</Link>

            {/* Education Dropdown */}
            <div className="relative" ref={educationRef}>
              <button
                onClick={() => setEducationOpen(!educationOpen)}
                className="hover:text-gold-600 transition flex items-center gap-1 py-2"
              >
                Education
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {educationOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gold-100 shadow-lg rounded-sm z-20">
                  <Link
                    to="/education/diamond"
                    className="block px-4 py-2.5 text-sm hover:bg-gold-50 hover:text-gold-600 transition"
                    onClick={() => setEducationOpen(false)}
                  >
                    Diamond
                  </Link>
                  <Link
                    to="/education/gold"
                    className="block px-4 py-2.5 text-sm hover:bg-gold-50 hover:text-gold-600 transition"
                    onClick={() => setEducationOpen(false)}
                  >
                    Gold
                  </Link>
                </div>
              )}
            </div>

            {/* Currency Switcher */}
            <select
              value={currency}
              onChange={(e) => changeCurrency(e.target.value)}
              className="text-charcoal text-xs md:text-sm border border-gold-300 bg-white px-2 py-1.5 rounded-sm cursor-pointer"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
              <option value="GBP">£ GBP</option>
              <option value="AED">AED</option>
            </select>

            {/* Auth Section */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 hover:text-gold-600 transition py-2"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center text-xs font-bold uppercase">
                    {user.full_name ? user.full_name.charAt(0) : user.email?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden xl:inline text-xs md:text-sm uppercase tracking-widest">
                    {user.full_name || 'My Account'}
                  </span>
                </button>
                {profileOpen && (
                  <div className="absolute top-full right-0 mt-1 w-44 bg-white border border-gold-100 shadow-lg rounded-sm z-20">
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm hover:bg-gold-50 hover:text-gold-600 transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2.5 text-sm hover:bg-gold-50 hover:text-gold-600 transition"
                      onClick={() => setProfileOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2.5 text-sm hover:bg-gold-50 hover:text-gold-600 transition border-t border-gold-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:text-gold-600 transition py-2">Login</Link>
            )}
          </nav>

          {/* Right side icons – always visible */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notification Bell - responsive sizing */}
            <div className="scale-90 sm:scale-100">
              <NotificationBell />
            </div>

            {/* Cart with improved touch target */}
            <Link
              to="/cart"
              className="relative text-charcoal hover:text-gold-600 transition p-1.5 sm:p-2 -my-1"
              aria-label="Shopping cart"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 text-[9px] sm:text-[10px] font-bold text-white bg-gold-500 rounded-full">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-charcoal hover:text-gold-600 p-1.5 -my-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu – visible when toggled */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 pb-6 border-t border-gold-100 mt-2">
            <nav className="flex flex-col space-y-3 text-sm uppercase tracking-widest text-charcoal">
              <Link to="/" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>Shop</Link>
              <Link to="/about" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>About</Link>
              <Link to="/contact" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

              {/* Education submenu on mobile */}
              <div className="pt-1">
                <span className="text-xs text-gold-500">Education</span>
                <div className="pl-4 mt-1 flex flex-col gap-2">
                  <Link to="/education/diamond" className="py-1 hover:text-gold-600" onClick={() => setMobileMenuOpen(false)}>Diamond</Link>
                  <Link to="/education/gold" className="py-1 hover:text-gold-600" onClick={() => setMobileMenuOpen(false)}>Gold</Link>
                </div>
              </div>

              {/* Currency Switcher (full width) */}
              <select
                value={currency}
                onChange={(e) => changeCurrency(e.target.value)}
                className="text-charcoal text-sm border border-gold-300 bg-white px-3 py-2 rounded-sm w-full max-w-[140px]"
              >
                <option value="INR">₹ INR</option>
                <option value="USD">$ USD</option>
                <option value="EUR">€ EUR</option>
                <option value="GBP">£ GBP</option>
                <option value="AED">AED</option>
              </select>

              {user ? (
                <>
                  <Link to="/profile" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>My Profile</Link>
                  <Link to="/orders" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-left hover:text-gold-600 py-2"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="hover:text-gold-600 py-2" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}