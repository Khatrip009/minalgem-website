import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-serif text-5xl md:text-6xl text-gold-700 tracking-widest mb-8">
          About MINALGEMS
        </h1>
        <div className="mx-auto w-24 h-0.5 bg-gold-400 mb-10" />
        <div className="space-y-8 text-charcoal text-lg leading-relaxed">
          <p>
            For over three decades, <span className="font-semibold text-gold-600">MINALGEMS</span> has been synonymous
            with exceptional craftsmanship and timeless elegance. Every piece we create is a
            celebration of beauty, precision, and the finest materials.
          </p>
          <p>
            From ethically sourced diamonds to hallmarked gold, we ensure that every jewel
            meets the highest standards. Our artisans blend traditional techniques with
            contemporary design to bring you jewellery that lasts generations.
          </p>
          <p>
            Whether you're looking for a statement necklace, a delicate bracelet, or the
            perfect engagement ring, MINALGEMS promises a personal, luxurious experience
            from the moment you step into our world.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-block mt-12 px-10 py-3 border border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white transition uppercase tracking-widest text-sm"
        >
          Explore the Collection
        </Link>
      </div>
    </div>
  );
}