import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { getCategories } from '../api/categories';
import { getProducts } from '../api/products';
import { getImageUrl } from '../utils/imageUrl';   // ✅ unified storage URL helper

export default function FeaturedProducts({ categoryLimit = 3, productLimit = 3 }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // getCategories now returns an array
        const categories = await getCategories();
        if (!categories?.length) return;
        const limited = categories.slice(0, categoryLimit);

        const sectionPromises = limited.map(async (cat) => {
          const { products } = await getProducts({
            category: cat.id,
            limit: productLimit,
          });
          // products already contain 'product_assets' from the Supabase query
          return {
            category: cat,
            products: products || [],
          };
        });

        const allSections = await Promise.all(sectionPromises);
        setSections(allSections.filter(s => s.products.length > 0));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryLimit, productLimit]);

  if (loading || sections.length === 0) return null;

  return (
    <div className="space-y-24">
      {sections.map(({ category, products }) => (
        <div key={category.id}>
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-serif text-3xl md:text-4xl text-gold-700 tracking-widest">
              {category.name}
            </h2>
            <Link
              to={`/shop?category=${category.id}`}
              className="text-sm uppercase tracking-widest text-gold-600 hover:text-gold-700 transition border-b border-transparent hover:border-gold-400"
            >
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Separate product card component with its own Swiper
function ProductCard({ product }) {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const uniqueNav = {
    prevEl: `prev-${product.id}`,
    nextEl: `next-${product.id}`,
  };

  // Use product_assets directly from the product object
  const media = (product.product_assets || [])
    .filter(a => a.asset_type === 'image' || a.asset_type === 'video')
    .slice(0, 4);

  const renderSlide = (item, idx) => {
    const src = getImageUrl(item.url);
    if (!src) {
      return <img src="/placeholder.jpg" alt="No media" className="w-full h-full object-cover" />;
    }
    if (item.asset_type === 'video') {
      return (
        <video
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          poster={item.thumbnail_url ? getImageUrl(item.thumbnail_url) : undefined}
        >
          <source src={src} type="video/mp4" />
        </video>
      );
    }
    return (
      <img
        src={src}
        alt={`${product.title} ${idx + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => { e.target.src = '/placeholder.jpg'; }}
      />
    );
  };

  // Fallback primary image (if any asset is marked is_primary)
  const primaryAsset =
    media.find(a => a.is_primary && a.asset_type === 'image') ||
    media.find(a => a.asset_type === 'image') ||
    media[0];
  const fallbackImage = primaryAsset ? getImageUrl(primaryAsset.url) : '/placeholder.jpg';

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100 border border-gold-100 hover:shadow-lg transition-shadow duration-300">
        {media.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation]}
              navigation={{
                prevEl: `.${uniqueNav.prevEl}`,
                nextEl: `.${uniqueNav.nextEl}`,
              }}
              loop={media.length > 1}
              className="w-full h-full"
            >
              {media.map((item, idx) => (
                <SwiperSlide key={idx}>
                  {renderSlide(item, idx)}
                </SwiperSlide>
              ))}
            </Swiper>

            {media.length > 1 && (
              <>
                <button
                  className={`${uniqueNav.prevEl} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 text-charcoal hover:bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                  onClick={(e) => e.preventDefault()}
                  aria-label="Previous"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  className={`${uniqueNav.nextEl} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 text-charcoal hover:bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center`}
                  onClick={(e) => e.preventDefault()}
                  aria-label="Next"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          <img
            src={fallbackImage}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.jpg'; }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      </div>
      <div className="mt-4 text-center">
        <h3 className="font-serif text-lg text-charcoal tracking-wide">{product.title}</h3>
        <p className="text-sm text-gold-600 mt-1">
          ₹{Number(product.price).toLocaleString('en-IN')}
        </p>
      </div>
    </Link>
  );
}