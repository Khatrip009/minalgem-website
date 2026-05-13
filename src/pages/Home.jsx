import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHeroSlides } from '../api/hero';
import { getCategories } from '../api/categories';
import { getProducts } from '../api/products';
import { getImageUrl } from '../utils/imageUrl';
import CategoryCarousel from '../components/CategoryCarousel';
import { useCurrency } from '../context/CurrencyContext';

const FALLBACK_HERO_IMAGES = [
  '/images/hero/hero1.jpg',
  '/images/hero/hero2.jpg',
  '/images/hero/hero3.jpg',
  '/images/hero/hero4.jpg',
];

const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'https://apiminalgems.exotech.co.in';

export default function Home() {
  const { currency, convertPrice, loading: currencyLoading } = useCurrency();
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroBg, setHeroBg] = useState('');
  const [loading, setLoading] = useState(true);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState({});

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
    if (!priceInINR) return null;
    const converted = convertPrice(priceInINR);
    const symbol = getCurrencySymbol(currency);
    if (currency === 'AED') return `${converted.toLocaleString()} ${symbol}`;
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // Fetch hero slides
  useEffect(() => {
    getHeroSlides()
      .then(res => {
        if (res.ok) setHeroSlides(res.slides || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Preload hero image
  useEffect(() => {
    const hero = heroSlides[0] || null;
    if (hero?.image_url) {
      setHeroBg(getImageUrl(hero.image_url));
    } else {
      const randomIndex = Math.floor(Math.random() * FALLBACK_HERO_IMAGES.length);
      setHeroBg(FALLBACK_HERO_IMAGES[randomIndex]);
    }
  }, [heroSlides]);

  useEffect(() => {
    if (heroBg && !heroSlides[0]?.video_url) {
      const img = new Image();
      img.src = heroBg;
      img.onload = () => setHeroImageLoaded(true);
    } else {
      setHeroImageLoaded(true);
    }
  }, [heroBg, heroSlides]);

  // Fetch categories with products
  useEffect(() => {
    getCategories({ include_counts: true })
      .then(res => {
        if (res.ok) {
          const cats = (res.categories || []).filter(cat => (cat.product_count || 0) > 0);
          setCategories(cats);
          cats.forEach(cat => {
            getProducts({ category: cat.id, limit: 4 })
              .then(prodRes => {
                if (prodRes.ok) {
                  setCategoryProducts(prev => ({
                    ...prev,
                    [cat.id]: prodRes.products || []
                  }));
                }
              })
              .catch(console.error);
          });
        }
      })
      .catch(console.error);
  }, []);

  const hero = heroSlides[0] || null;
  const showVideo = hero?.video_url;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="font-sans overflow-x-hidden">

      {/* ========== HERO ========== */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {!heroImageLoaded && (
          <div className="absolute inset-0 bg-cream flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {showVideo ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={getImageUrl(hero.video_url)} type="video/mp4" />
          </video>
        ) : (
          <img
            src={heroBg}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
            decoding="sync"
          />
        )}
        {/* Optional subtle overlay (no text, just for depth) */}
        
      </section>

      {/* ========== OUR CRAFT (Category Carousel) ========== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-gold-600 text-center mb-10 sm:mb-12 md:mb-16 tracking-widest">
          Our Craft
        </h2>
        <CategoryCarousel />
      </section>

      {/* ========== DYNAMIC CATEGORY SECTIONS ========== */}
      <div className="space-y-16 sm:space-y-20">
        {categories.map(category => {
          const products = categoryProducts[category.id] || [];
          if (products.length === 0) return null;

          return (
            <section key={category.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-baseline mb-5 sm:mb-6 flex-wrap gap-2">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-gold-600 tracking-widest">
                  {category.name}
                </h2>
                <Link
                  to={`/shop?category=${category.id}`}
                  className="text-xs sm:text-sm uppercase tracking-widest text-gold-500 hover:text-gold-700 transition border-b border-gold-300 pb-0.5"
                >
                  View All →
                </Link>
              </div>

              {/* Product grid – responsive gap and columns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {products.map(product => (
                  <Link
                    to={`/product/${product.slug}`}
                    key={product.id}
                    className="group block transition-shadow hover:shadow-md rounded-sm"
                  >
                    <div className="aspect-square overflow-hidden bg-white border border-gold-100">
                      <img
                        src={product.primary_image ? `${IMAGE_BASE}${product.primary_image}` : '/placeholder.jpg'}
                        alt={product.title}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 will-change-transform"
                      />
                    </div>
                    <div className="mt-2 sm:mt-3 text-center">
                      <h3 className="font-serif text-xs sm:text-sm md:text-base text-charcoal tracking-wide line-clamp-1">
                        {product.title}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-gold-600 mt-1">
                        {currencyLoading ? (
                          <span className="inline-block w-10 h-2.5 bg-gold-100 animate-pulse rounded"></span>
                        ) : product.price ? (
                          formatPrice(product.price)
                        ) : (
                          'Price on Request'
                        )}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* ========== ABOUT – fully responsive ========== */}
      <section className="bg-cream py-12 sm:py-16 md:py-24 mt-16 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-16 items-center">
          <div className="aspect-[4/5] overflow-hidden border border-gold-100 shadow-lg order-2 md:order-1">
            <img
              src="/images/hero/feature.jpg"
              alt="Artisan at work"
              className="w-full h-full object-cover hover:scale-105 transition duration-700 will-change-transform"
              loading="lazy"
            />
          </div>
          <div className="space-y-5 sm:space-y-6 md:space-y-8 text-center md:text-left order-1 md:order-2">
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gold-700 tracking-widest">
              A Legacy of Excellence
            </h2>
            <p className="text-charcoal leading-relaxed text-sm sm:text-base lg:text-lg font-light">
              For over three decades, Minalgems has celebrated the art of fine jewellery.
              Each piece is crafted with uncompromising passion, using ethically sourced
              gemstones and precious metals. From the sketch of a master artisan to the
              final polish, every detail is a testament to our devotion to beauty.
            </p>
            <Link
              to="/about"
              className="inline-block mt-2 px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 md:py-3 border border-gold-600 text-gold-600 hover:bg-gold-600 hover:text-white transition uppercase tracking-widest text-xs sm:text-sm"
            >
              Discover Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ========== TESTIMONIALS ========== */}
      <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16 md:py-24 text-center">
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gold-600 mb-10 sm:mb-12 md:mb-16 tracking-widest">
          Words of Love
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {[
            { quote: "Absolutely breathtaking craftsmanship. My engagement ring is a masterpiece.", author: "Priya S." },
            { quote: "The attention to detail is unmatched. I felt like royalty wearing Minalgems.", author: "Ananya M." },
            { quote: "From the packaging to the product, everything screams luxury. Worth every penny.", author: "Kavita R." },
          ].map((t, i) => (
            <div
              key={i}
              className="p-5 sm:p-6 md:p-8 border border-gold-100 bg-white/50 backdrop-blur-sm rounded-sm shadow-sm hover:shadow-md transition-all duration-300"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-gold-400 mx-auto mb-3 sm:mb-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-charcoal italic text-sm sm:text-base mb-3 sm:mb-4">{t.quote}</p>
              <p className="text-gold-600 font-serif text-sm sm:text-base lg:text-lg">— {t.author}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}