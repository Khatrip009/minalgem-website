import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import { getCategories } from '../api/categories';
import { getImageUrl } from '../utils/imageUrl';

export default function CategoryCarousel() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories({ include_counts: true })
      .then(res => {
        if (res.ok) setCategories(res.categories || []);
      })
      .catch(console.error);
  }, []);

  if (categories.length === 0) return null;

  return (
    <div className="relative">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-r from-cream to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 bg-gradient-to-l from-cream to-transparent pointer-events-none" />

      <Swiper
        modules={[Autoplay]}
        loop={true}
        autoplay={{ delay: 0, disableOnInteraction: false }}
        speed={4000}
        spaceBetween={24}
        slidesPerView="auto"
        breakpoints={{
          320: { slidesPerView: 1.5 },
          640: { slidesPerView: 2.5 },
          1024: { slidesPerView: 3.5 },
          1280: { slidesPerView: 4.5 },
        }}
      >
        {categories.map(cat => {
          // 1. Try database image → 2. Try local slug.jpg → 3. Fallback placeholder
          const imageSrc = cat.image_url
            ? getImageUrl(cat.image_url)
            : `/categories/${cat.slug}.jpg`;                     // ✅ local fallback

          return (
            <SwiperSlide key={cat.id} className="!h-auto">
              <Link
                to={`/shop?category=${cat.id}`}
                className="group relative aspect-[3/4] overflow-hidden bg-gray-100 border border-gold-100 hover:shadow-2xl transition-shadow duration-500 block h-full"
              >
                <img
                  src={imageSrc}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                  <h3 className="font-serif text-2xl text-white tracking-wide">{cat.name}</h3>
                  {cat.product_count !== undefined && (
                    <p className="text-sm text-gold-200 mt-1">{cat.product_count} Pieces</p>
                  )}
                </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}