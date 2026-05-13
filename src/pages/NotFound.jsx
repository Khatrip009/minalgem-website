import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="max-w-md mx-auto">
        {/* Elegant decorative icon */}
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-gold-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="font-serif text-7xl md:text-8xl text-gold-600 mb-4 tracking-widest">404</h1>
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal mb-6">Page Not Found</h2>
        <p className="text-charcoal/70 mb-10 text-base">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white transition uppercase tracking-widest text-sm"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}