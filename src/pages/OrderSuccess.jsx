import { useParams, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="relative max-w-xl w-full bg-white border border-gold-200 shadow-lg rounded-sm p-10 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gold-100 text-gold-600">
          <svg
            className="h-10 w-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl md:text-5xl text-gold-700 tracking-widest">
          Order Confirmed
        </h1>
        <p className="mt-4 text-charcoal text-lg">
          Thank you for choosing{' '}
          <span className="text-gold-600 font-semibold">MINALGEMS</span>.
        </p>

        {/* Order Reference */}
        <div className="mt-8 p-6 bg-cream border border-gold-200 rounded-sm">
          <p className="text-xs uppercase tracking-widest text-gold-600 mb-2">
            Order Reference
          </p>
          <p className="text-charcoal font-mono text-sm break-all">
            {id || '—'}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
          <Link
            to={`/orders/${id}`}
            className="block w-full py-3 bg-gold-500 text-white uppercase tracking-widest text-sm font-medium hover:bg-gold-600 transition"
          >
            View Order Details
          </Link>
          <Link
            to="/shop"
            className="block w-full py-3 border border-gold-500 text-gold-600 uppercase tracking-widest text-sm font-medium hover:bg-gold-50 transition"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Decorative diamond */}
        <div className="mt-8 text-gold-400 opacity-30 text-4xl">♦</div>
      </div>
    </div>
  );
}