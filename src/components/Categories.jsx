import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../api/categories';

const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'https://apiminalgems.exotech.co.in';

export default function Categories({ limit }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = { include_counts: true };
    if (limit) params.limit = limit;

    getCategories(params)
      .then(res => {
        if (res.ok) setCategories(res.categories || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [limit]);

  // Don't render anything while loading or if no categories exist
  if (loading || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {categories.map(cat => (
        <Link
          key={cat.id}
          to={`/shop?category=${cat.id}`}
          className="group relative aspect-[3/4] overflow-hidden bg-gray-100 border border-gold-100 hover:shadow-2xl transition-shadow duration-500"
        >
          <img
            src={cat.image_url ? `${IMAGE_BASE}${cat.image_url}` : '/placeholder.jpg'}
            alt={cat.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="font-serif text-2xl text-white tracking-wide">
              {cat.name}
            </h3>
            {cat.product_count !== undefined && (
              <p className="text-sm text-gold-200 mt-1">{cat.product_count} Pieces</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}