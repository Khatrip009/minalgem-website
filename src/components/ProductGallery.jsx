import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useCurrency } from '../context/CurrencyContext';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'http://localhost:4500';

function getFullUrl(url) {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${IMAGE_BASE}${url}`;
}

export default function ProductGallery({ assets, priceInINR, title }) {
  const { currency, convertPrice, loading: currencyLoading } = useCurrency();

  // Separate images and videos
  const media = (assets || []).filter(
    a => a.asset_type === 'image' || a.asset_type === 'video'
  );

  const displayPrice = priceInINR ? convertPrice(priceInINR) : null;

  if (media.length === 0) {
    return (
      <div className="space-y-4">
        <div className="aspect-square bg-gray-100 flex items-center justify-center border border-gold-100">
          <img
            src="/placeholder.jpg"
            alt="No image available"
            className="max-h-full max-w-full object-contain"
          />
        </div>
        {title && <h2 className="font-serif text-xl text-gold-600 text-center">{title}</h2>}
        {!currencyLoading && displayPrice !== null && (
          <div className="text-center text-2xl font-light text-charcoal">
            {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
            {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Gallery Swiper */}
      <div className="relative group">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation={{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          }}
          pagination={{ clickable: true }}
          loop={media.length > 1}
          className="aspect-square w-full border border-gold-100"
        >
          {media.map((item, idx) => {
            const src = getFullUrl(item.url);
            if (!src) {
              return (
                <SwiperSlide key={item.id || idx} className="bg-white flex items-center justify-center">
                  <img src="/placeholder.jpg" alt="No media" className="max-h-full max-w-full object-contain" />
                </SwiperSlide>
              );
            }

            if (item.asset_type === 'video') {
              return (
                <SwiperSlide key={item.id || idx} className="bg-white">
                  <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                    poster={getFullUrl(item.thumbnail_url) || undefined}
                  >
                    <source src={src} type="video/mp4" />
                  </video>
                </SwiperSlide>
              );
            }

            return (
              <SwiperSlide key={item.id || idx} className="bg-white">
                <img
                  src={src}
                  alt={`Product image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                />
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Navigation arrows */}
        <div className="swiper-button-prev !text-gold-600 !opacity-0 group-hover:!opacity-100 transition-opacity after:!text-2xl" />
        <div className="swiper-button-next !text-gold-600 !opacity-0 group-hover:!opacity-100 transition-opacity after:!text-2xl" />
      </div>

      {/* Product title + multi‑currency price */}
      {title && <h2 className="font-serif text-xl text-gold-600 text-center">{title}</h2>}
      {!currencyLoading && displayPrice !== null && (
        <div className="text-center text-2xl font-light text-charcoal">
          {currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency}
          {displayPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
}