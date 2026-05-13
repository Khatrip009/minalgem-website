import { useState } from 'react';
import { getImageUrl } from '../utils/imageUrl';

export default function CartImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const finalSrc = src ? getImageUrl(src) : '/placeholder.jpg';

  return (
    <div className="relative w-full h-full bg-gold-50">
      <img
        src={error ? '/placeholder.jpg' : finalSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
      />
    </div>
  );
}