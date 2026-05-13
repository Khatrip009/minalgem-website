import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts } from '../api/products';
import { getCategories } from '../api/categories';
import { useCurrency } from '../context/CurrencyContext';

const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE || 'https://apiminalgems.exotech.co.in';

export default function Shop() {
  const { currency, convertPrice, loading: currencyLoading } = useCurrency();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const categoryId = searchParams.get('category') || '';
  const searchTerm = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(searchTerm);

  // Fetch categories
  useEffect(() => {
    getCategories({ include_counts: true })
      .then(res => {
        if (res.ok) setCategories(res.categories);
      })
      .catch(console.error);
  }, []);

  // Fetch products when filters or page change
  useEffect(() => {
    setLoading(true);
    const params = { page: currentPage };
    if (categoryId) params.category = categoryId;
    if (searchTerm) params.search = searchTerm;

    getProducts(params)
      .then(res => {
        if (res.ok) {
          setProducts(res.products);
          setPagination(res.pagination);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentPage, categoryId, searchTerm]);

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage);
      return newParams;
    });
  };

  const handleCategoryChange = (catId) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (catId) {
        newParams.set('category', catId);
      } else {
        newParams.delete('category');
      }
      newParams.delete('page');
      return newParams;
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      if (searchInput.trim()) {
        newParams.set('search', searchInput.trim());
      } else {
        newParams.delete('search');
      }
      newParams.delete('page');
      return newParams;
    });
  };

  const showEmpty = !loading && products.length === 0;
  const showPagination = pagination.pages > 1;

  // Helper: get currency symbol
  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'AED': return 'AED';
      default: return '₹';
    }
  };

  // Helper: format price with currency symbol and decimals
  const formatPrice = (priceInINR) => {
    if (!priceInINR) return null;
    const converted = convertPrice(priceInINR);
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-4xl md:text-5xl text-gold-600 text-center mb-16 tracking-widest">
        The Collection
      </h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* ========== SIDEBAR ========== */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8 lg:mb-10">
            <label className="block text-xs uppercase tracking-widest text-gold-600 mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search jewellery..."
                className="flex-1 border border-gold-300 bg-white px-4 py-2 text-charcoal text-sm focus:outline-none focus:border-gold-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gold-500 text-white uppercase text-xs tracking-widest hover:bg-gold-600 transition"
              >
                Go
              </button>
            </div>
          </form>

          {/* Categories */}
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gold-600 mb-4">
              Categories
            </h3>

            {/* Mobile horizontal scroll */}
            <div className="flex lg:hidden overflow-x-auto pb-4 gap-3">
              <button
                onClick={() => handleCategoryChange('')}
                className={`whitespace-nowrap px-4 py-2 border text-xs uppercase tracking-widest transition ${
                  !categoryId
                    ? 'bg-gold-500 text-white border-gold-500'
                    : 'border-gold-300 text-gold-600 hover:bg-gold-50'
                }`}
              >
                All
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 border text-xs uppercase tracking-widest transition ${
                    categoryId === cat.id
                      ? 'bg-gold-500 text-white border-gold-500'
                      : 'border-gold-300 text-gold-600 hover:bg-gold-50'
                  }`}
                >
                  {cat.name} ({cat.product_count || 0})
                </button>
              ))}
            </div>

            {/* Desktop vertical list */}
            <nav className="hidden lg:block space-y-1">
              <button
                onClick={() => handleCategoryChange('')}
                className={`block w-full text-left px-4 py-3 text-sm uppercase tracking-widest transition border-l-2 ${
                  !categoryId
                    ? 'bg-gold-50 text-gold-700 border-l-gold-500 font-semibold'
                    : 'text-charcoal border-l-transparent hover:bg-gold-50 hover:text-gold-600'
                }`}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`block w-full text-left px-4 py-3 text-sm uppercase tracking-widest transition border-l-2 ${
                    categoryId === cat.id
                      ? 'bg-gold-50 text-gold-700 border-l-gold-500 font-semibold'
                      : 'text-charcoal border-l-transparent hover:bg-gold-50 hover:text-gold-600'
                  }`}
                >
                  {cat.name}
                  {cat.product_count !== undefined && (
                    <span className="text-xs text-gold-500 ml-2">({cat.product_count})</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ========== PRODUCT GRID ========== */}
        <main className="flex-1 min-w-0">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
            </div>
          )}

          {showEmpty && (
            <div className="text-center py-20">
              <p className="text-2xl font-serif text-gold-600">No products found</p>
              <p className="text-charcoal mt-2">Try a different category or search term.</p>
            </div>
          )}

          {!loading && products.length > 0 && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products.map(product => {
                  const priceDisplay = product.price ? formatPrice(product.price) : null;
                  return (
                    <Link to={`/product/${product.slug}`} key={product.id} className="group block">
                      <div className="aspect-[3/4] overflow-hidden bg-white border border-gold-100 hover:shadow-lg transition-shadow duration-500">
                        <img
                          src={product.primary_image ? `${IMAGE_BASE}${product.primary_image}` : '/placeholder.jpg'}
                          alt={product.title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      </div>
                      <div className="mt-4 text-center">
                        <h3 className="font-serif text-lg text-charcoal tracking-wide">{product.title}</h3>
                        <p className="text-sm text-gold-600 mt-1">
                          {currencyLoading ? (
                            <span className="inline-block w-12 h-4 bg-gold-100 animate-pulse rounded"></span>
                          ) : priceDisplay ? (
                            priceDisplay
                          ) : (
                            'Price on Request'
                          )}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {showPagination && (
                <div className="flex justify-center mt-16 gap-4">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="px-4 py-2 border border-gold-300 text-gold-600 disabled:opacity-50 text-sm uppercase tracking-widest hover:bg-gold-50 transition"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-charcoal text-sm self-center">
                    {currentPage} / {pagination.pages}
                  </span>
                  <button
                    disabled={currentPage >= pagination.pages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-4 py-2 border border-gold-300 text-gold-600 disabled:opacity-50 text-sm uppercase tracking-widest hover:bg-gold-50 transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}