import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoldRate } from '../context/GoldRateContext';

// ---------- Accordion ----------
const Accordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="space-y-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="border border-gold-200 bg-white rounded-sm shadow-sm overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="flex w-full items-center justify-between px-5 py-4 text-left font-medium text-charcoal hover:bg-gold-50 transition"
            >
              <span className="font-serif text-lg text-gold-700">{item.q}</span>
              <span
                className="text-2xl text-gold-500 transition-transform duration-200"
                style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              >
                {isOpen ? '›' : '+'}
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-4 text-sm text-charcoal leading-relaxed">
                  {item.a}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- Page ----------
export default function EducationGold() {
  const { goldRate24kPerGram, loading: goldLoading } = useGoldRate();

  return (
    <main className="bg-cream text-charcoal">
      {/* HERO */}
      <section
        className="relative flex h-[50vh] items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero/Gold-hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/70 to-cream/90" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl text-gold-700 tracking-widest drop-shadow-sm">
            All About Gold
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-charcoal font-light uppercase tracking-[0.2em]">
            History, Karats, Colours & Craft
          </p>
          <p className="mt-3 text-lg text-gold-600 italic">
            Expert guidance from Minalgems
          </p>
          <div className="mt-8 h-0.5 w-32 mx-auto bg-gold-400" />

          {/* Live gold rate */}
          {!goldLoading && goldRate24kPerGram > 0 && (
            <p className="mt-6 text-gold-600 font-serif text-lg">
              Current 24K Gold Rate: ₹{goldRate24kPerGram.toFixed(0)} / gram
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28">
        {/* INTRO */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 border border-gold-500 text-gold-600 text-sm uppercase tracking-widest">
              Essential Gold Guide
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-gold-700">Why Gold Matters</h2>
            <p className="text-lg leading-relaxed text-charcoal">
              Gold has been treasured since ancient times for its beauty, scarcity and stability.
              It has served as currency, a cultural symbol and a premium material in jewellery for centuries.
            </p>
            <div className="bg-gold-50 border border-gold-200 p-6 rounded-sm">
              <p className="text-charcoal font-medium">
                <span className="font-bold text-gold-600">Quick fact:</span> Gold (Au) is extremely
                malleable and resistant to tarnish – 1g can be beaten into a sheet of many square metres.
              </p>
            </div>
          </div>
          <div className="rounded-sm shadow-lg border border-gold-100 overflow-hidden group">
            <img
              src="/images/hero/why_gold_matter.jpg"
              alt="Gold bar"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </section>

        {/* HISTORY */}
        <section className="bg-white border border-gold-100 rounded-sm p-8 md:p-12 shadow-sm">
          <h2 className="font-serif text-3xl text-gold-700 mb-6">History & Cultural Importance</h2>
          <p className="text-lg leading-relaxed text-charcoal">
            From Egyptian burial treasures and Greek coins to Asian ornaments and Roman crowns,
            gold has symbolised wealth, purity, prosperity and divinity across civilisations.
          </p>
          <p className="mt-4 text-charcoal">
            Gold also shaped monetary systems (the gold standard) and remains both a luxury metal
            and an important industrial commodity.
          </p>
        </section>

        {/* KARATS */}
        <section>
          <h2 className="font-serif text-3xl md:text-4xl text-gold-700 mb-8">
            Karat & Purity – What the Numbers Mean
          </h2>
          <ul className="list-disc ml-6 space-y-3 text-lg text-charcoal mb-10">
            <li><strong className="text-gold-600">24K</strong> – 99.9% pure, very soft, rarely used for intricate pieces.</li>
            <li><strong className="text-gold-600">22K</strong> – 91.6%, rich Indian tone, ideal for heavy traditional designs.</li>
            <li><strong className="text-gold-600">18K</strong> – 75%, perfect balance of purity and durability for fine jewellery.</li>
            <li><strong className="text-gold-600">14K</strong> – 58.5%, very durable and popular in Western markets.</li>
            <li><strong className="text-gold-600">10K</strong> – 41.7%, minimum legal gold in some countries.</li>
          </ul>
          <div className="bg-gold-50 border border-gold-200 p-6 rounded-sm">
            <h3 className="font-serif text-xl text-gold-700 mb-2">Karat vs Hallmark</h3>
            <p className="text-charcoal">
              <strong>Karat</strong> is the measure of purity. <strong>Hallmark</strong> is the official
              stamp from BIS/Assay Office confirming that purity. Always buy hallmarked jewellery for
              complete peace of mind.
            </p>
          </div>
        </section>

        {/* COLOURS */}
        <section className="bg-white border border-gold-100 rounded-sm p-8 md:p-12 shadow-sm">
          <h2 className="font-serif text-3xl md:text-4xl text-gold-700 mb-8">
            Gold Colours & Alloys
          </h2>
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[
              { title: "Yellow Gold", text: "Gold blended with copper and silver for the classic warm tone." },
              { title: "White Gold", text: "Alloyed with palladium, zinc or nickel and usually rhodium plated for a bright white finish." },
              { title: "Rose Gold", text: "Copper-rich alloy that gives a romantic pinkish tone, perfect for modern designs." },
            ].map((card, idx) => (
              <div key={idx} className="border border-gold-200 bg-cream p-6 rounded-sm hover:shadow-lg transition">
                <h3 className="font-serif text-xl text-gold-700 mb-2">{card.title}</h3>
                <p className="text-charcoal">{card.text}</p>
              </div>
            ))}
          </div>
          <p className="text-charcoal text-sm">
            You’ll also find artistic variants like green, grey or black gold, created via special
            alloy mixes or surface treatments.
          </p>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-serif text-3xl md:text-4xl text-gold-700 mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion
            items={[
              {
                q: "Is 22K better than 18K?",
                a: "22K has a richer colour and higher gold content, but is softer. 18K is more durable and better for everyday wear. Choose depending on how often you’ll wear the piece and how detailed the design is.",
              },
              {
                q: "How are making charges calculated?",
                a: "Making charges reflect the labour involved, design complexity, wastage and finishing quality. Hand-crafted or intricate designs typically have higher making charges than simple machine-made jewellery.",
              },
              {
                q: "Can gold be recycled?",
                a: "Yes. Old jewellery can be refined back to pure gold and reused. Recycled gold is chemically identical to newly mined gold and is kinder to the environment.",
              },
            ]}
          />
        </section>

        {/* CTA */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gold-600 text-white p-8 md:p-12 rounded-sm shadow-lg">
            <h3 className="font-serif text-2xl mb-4">Personalised Advice</h3>
            <p className="mb-6 text-white/90">
              Book a one-to-one consultation with our gold specialists for buying guidance, sizing
              and styling help.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-white text-white hover:bg-white hover:text-gold-600 transition uppercase tracking-widest text-sm"
            >
              Book Appointment
            </Link>
          </div>
          <div className="bg-charcoal text-white p-8 md:p-12 rounded-sm shadow-lg">
            <h3 className="font-serif text-2xl text-gold-400 mb-4">Trade-in & Recycling</h3>
            <p className="mb-6 text-white/80">
              Bring your old gold jewellery for transparent valuation, exchange options and
              responsible recycling with Minal Gems.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-gold-400 text-gold-400 hover:bg-gold-400 hover:text-charcoal transition uppercase tracking-widest text-sm"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}