import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../api/products';
import { getReviews, getReviewSummary } from '../api/reviews';
import { registerStockAlert } from '../api/stockAlerts';
import { addToCart } from '../api/cart';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useGoldRate } from '../context/GoldRateContext';
import ProductGallery from '../components/ProductGallery';

export default function Product() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency, convertPrice } = useCurrency();
  const { getGoldValue, loading: goldLoading } = useGoldRate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingSummary, setRatingSummary] = useState(null);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState('');

  useEffect(() => {
    if (!slug) return;
    getProductBySlug(slug)
      .then(res => {
        if (res.ok) setProduct(res.product);
      })
      .catch(console.error);
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    getReviews('product', product.id)
      .then(res => setReviews(res.reviews || []))
      .catch(console.error);
    getReviewSummary('product', product.id)
      .then(res => setRatingSummary(res.summary))
      .catch(console.error);
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || !product.id) {
      alert('Product information not loaded yet.');
      return;
    }
    if (!user) {
      navigate('/login', { state: { from: `/product/${slug}` } });
      return;
    }

    setAddingToCart(true);
    setCartMessage('');
    try {
      const response = await addToCart(product.id, 1);
      console.log('Add to cart response:', response);
      setCartMessage('Added to cart ✓');
      setTimeout(() => setCartMessage(''), 3000);
    } catch (err) {
      console.error(err);
      const serverError =
        err?.response?.data?.error ||
        err.message ||
        'Could not add to cart. Please try again.';
      alert(`Failed to add to cart: ${serverError}`);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleStockAlert = async () => {
    try {
      await registerStockAlert(product.id, user ? undefined : alertEmail);
      alert('You’ll be notified when this item is back in stock.');
      setShowAlertForm(false);
    } catch (err) {
      alert('Could not register alert.');
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  // Extract metadata safely
  const meta = product.metadata || {};
  const purity = meta.purity || null;
  const material = meta.material || null;
  const stone = meta.stone || null;
  const gender = meta.gender || null;
  const origin = meta.origin || null;
  const certification = meta.certification || null;
  const occasions = Array.isArray(meta.occasion) ? meta.occasion : [];
  const diamondDetails = Array.isArray(product.diamonds)
    ? product.diamonds
    : product.diamonds
      ? JSON.parse(product.diamonds)
      : [];

  const isOutOfStock = Number(product.available_qty) === 0;
  const metalDisplay =
    product.metal_type && product.gold_carat
      ? `${product.metal_type.replace(/_/g, ' ')} ${product.gold_carat}K`
      : product.metal_type?.replace(/_/g, ' ') || null;

  // ---------- Currency & Gold value helpers ----------
  const formatPrice = (price) => {
    if (!price) return 'Price on Request';
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

  const goldValue =
    !goldLoading && product.gold_weight > 0 && product.gold_carat
      ? getGoldValue(product.gold_weight, product.gold_carat)
      : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Left: Gallery */}
        <ProductGallery assets={product.assets} />

        {/* Right: Product Info */}
        <div className="flex flex-col justify-center">
          {/* Title – scales gracefully */}
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-600 mb-4">
            {product.title}
          </h1>
          {/* Short description – slight downscale on mobile */}
          <p className="text-charcoal leading-relaxed text-base sm:text-lg">
            {product.short_description}
          </p>

          {/* Price */}
          <div className="mt-6 text-2xl sm:text-3xl text-gold-600 font-semibold">
            {formatPrice(product.price)}
          </div>

          {/* Estimated Gold Value */}
          {goldValue && (
            <p className="mt-2 text-sm text-charcoal">
              <span className="text-gold-600 font-medium">Approx. Gold Value:</span>{' '}
              {formatPrice(goldValue)}
            </p>
          )}

          <div className="mt-6 text-sm text-charcoal">
            {product.available_qty > 0 ? (
              <span className="text-green-600">In Stock ({product.available_qty} available)</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Add to Cart / Stock Alert */}
          <div className="mt-8">
            {!isOutOfStock ? (
              <div>
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full sm:w-auto px-10 py-3 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white transition uppercase tracking-widest text-sm disabled:opacity-50"
                >
                  {addingToCart ? 'Adding…' : 'Add to Cart'}
                </button>
                {cartMessage && (
                  <p className="mt-2 text-sm text-green-700 font-medium">{cartMessage}</p>
                )}
              </div>
            ) : (
              <div>
                <button
                  onClick={() => setShowAlertForm(!showAlertForm)}
                  className="w-full sm:w-auto px-10 py-3 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white transition uppercase tracking-widest text-sm"
                >
                  Notify Me When Available
                </button>
                {showAlertForm && !user && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-2 max-w-md">
                    <input
                      type="email"
                      value={alertEmail}
                      onChange={e => setAlertEmail(e.target.value)}
                      placeholder="Your email"
                      className="border border-gold-300 px-4 py-2 flex-1"
                    />
                    <button
                      onClick={handleStockAlert}
                      className="bg-gold-500 text-white px-6 py-2 uppercase text-sm tracking-wider"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Description */}
          {product.description && (
            <div className="mt-10">
              <h3 className="font-serif text-lg sm:text-xl text-gold-600 mb-2">Description</h3>
              <div className="text-charcoal leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {product.description}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== SPECIFICATIONS / DETAILS ========== */}
      <div className="mt-16 border-t border-gold-200 pt-12 sm:pt-16">
        <h2 className="font-serif text-2xl sm:text-3xl text-gold-600 mb-8 tracking-widest">
          Product Details
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {material && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Material</p>
              <p className="text-charcoal font-medium">{material}</p>
            </div>
          )}
          {purity && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Purity</p>
              <p className="text-charcoal font-medium">{purity}</p>
            </div>
          )}
          {product.total_weight > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Gross Weight</p>
              <p className="text-charcoal font-medium">{product.total_weight} g</p>
            </div>
          )}
          {product.gold_weight > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Net Weight</p>
              <p className="text-charcoal font-medium">{product.gold_weight} g</p>
            </div>
          )}
          {metalDisplay && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Metal</p>
              <p className="text-charcoal font-medium">{metalDisplay}</p>
            </div>
          )}
          {stone && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Stone Type</p>
              <p className="text-charcoal font-medium">{stone}</p>
            </div>
          )}
          {gender && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Gender</p>
              <p className="text-charcoal font-medium">{gender}</p>
            </div>
          )}
          {origin && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Origin</p>
              <p className="text-charcoal font-medium">{origin}</p>
            </div>
          )}
          {certification && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Certification</p>
              <p className="text-charcoal font-medium">{certification}</p>
            </div>
          )}
          {occasions.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-widest text-gold-500 mb-1">Occasion</p>
              <p className="text-charcoal font-medium">{occasions.join(', ')}</p>
            </div>
          )}
        </div>

        {/* Diamond details – horizontal scroll on small screens */}
        {product.diamond_pcs > 0 && (
          <div className="mt-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
              <p className="text-xs uppercase tracking-widest text-gold-500">Diamonds</p>
              <span className="text-charcoal text-sm">
                {product.diamond_pcs} pcs – {Number(product.diamond_carat).toFixed(2)} carats total
              </span>
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <table className="w-full text-sm border border-gold-100 min-w-[500px]">
                <thead>
                  <tr className="bg-gold-50 text-left text-gold-700">
                    <th className="px-4 py-2 font-medium">Shape</th>
                    <th className="px-4 py-2 font-medium">Pieces</th>
                    <th className="px-4 py-2 font-medium">Carat</th>
                    <th className="px-4 py-2 font-medium">Color</th>
                    <th className="px-4 py-2 font-medium">Clarity</th>
                    <th className="px-4 py-2 font-medium">Rate/ct</th>
                  </tr>
                </thead>
                <tbody>
                  {diamondDetails.map((d, i) => (
                    <tr key={i} className="border-t border-gold-100">
                      <td className="px-4 py-2">{d.shape || '-'}</td>
                      <td className="px-4 py-2">{d.pcs || 0}</td>
                      <td className="px-4 py-2">{d.carat ? Number(d.carat).toFixed(2) : '—'}</td>
                      <td className="px-4 py-2">{d.color || '-'}</td>
                      <td className="px-4 py-2">{d.clarity || '-'}</td>
                      <td className="px-4 py-2">{d.rate ? `₹${Number(d.rate).toLocaleString()}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========== REVIEWS ========== */}
      <div className="mt-20">
        <h2 className="font-serif text-2xl sm:text-3xl text-gold-600 mb-8 tracking-widest">
          Customer Reviews
        </h2>
        {ratingSummary && (
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl text-gold-600">★ {Number(ratingSummary.avg_rating).toFixed(1)}</span>
            <span className="text-charcoal text-sm">({ratingSummary.rating_count} reviews)</span>
          </div>
        )}
        <div className="space-y-8">
          {reviews.length === 0 ? (
            <p className="text-charcoal italic">No reviews yet. Be the first to review this product.</p>
          ) : (
            reviews.map(r => (
              <div key={r.id} className="border-b border-gold-100 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-charcoal">{r.author_name}</span>
                  <span className="text-gold-500">★ {r.rating}</span>
                </div>
                {r.title && <h4 className="font-medium text-charcoal">{r.title}</h4>}
                <p className="text-charcoal mt-1 text-sm sm:text-base">{r.body}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}