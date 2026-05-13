import { useState, useEffect } from 'react';
import { getProducts } from '../api/products';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    country: '',
    product_interest: '',
    message: '',
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Fetch products for dropdown
  useEffect(() => {
    getProducts({ limit: 100 })
      .then(res => {
        if (res.ok) {
          setProducts(res.products || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoadingProducts(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear previous status when user types
    if (submitStatus.message) setSubmitStatus({ type: '', message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.ok) {
        setSubmitStatus({ type: 'success', message: 'Thank you! We will get back to you shortly.' });
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          country: '',
          product_interest: '',
          message: '',
        });
      } else {
        setSubmitStatus({ type: 'error', message: data.error || 'Submission failed. Please try again.' });
      }
    } catch (err) {
      console.error(err);
      setSubmitStatus({ type: 'error', message: 'Network error. Please try again later.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-gold-700 tracking-widest">
            Contact Us
          </h1>
          <p className="text-charcoal mt-2 max-w-xl mx-auto">
            Have a question or special request? We’d love to hear from you.
            Fill out the form below and our team will respond promptly.
          </p>
        </div>

        <div className="bg-white border border-gold-200 rounded-sm shadow-sm p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Company (optional) */}
            <div>
              <label htmlFor="company" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Company (Optional)
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Country */}
            <div>
              <label htmlFor="country" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Country *
              </label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Product Interest - dropdown from live products */}
            <div>
              <label htmlFor="product_interest" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Product of Interest
              </label>
              <select
                id="product_interest"
                name="product_interest"
                value={formData.product_interest}
                onChange={handleChange}
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500 bg-white"
              >
                <option value="">Select a product (optional)</option>
                {loadingProducts ? (
                  <option disabled>Loading products...</option>
                ) : (
                  products.map(product => (
                    <option key={product.id} value={product.title}>
                      {product.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-xs uppercase tracking-widest text-gold-600 mb-1">
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full border border-gold-300 px-4 py-3 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
            </div>

            {/* Status message */}
            {submitStatus.message && (
              <div
                className={`text-sm p-3 rounded-sm ${
                  submitStatus.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {submitStatus.message}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-10 py-3 bg-gold-500 text-white uppercase tracking-widest text-sm hover:bg-gold-600 transition disabled:opacity-50"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Optional: additional contact info */}
        
      </div>
    </div>
  );
}