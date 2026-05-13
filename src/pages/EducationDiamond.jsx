import { Link } from 'react-router-dom';

/* ---------------------------------------------
 * Diamond Shape Card – pure, static, elegant
 * -------------------------------------------*/
const DiamondShapeCard = ({ variant, name, description }) => {
  return (
    <div className="group relative w-full overflow-hidden rounded-sm border border-gold-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative mb-5 h-44 w-full bg-cream rounded-sm overflow-hidden flex items-center justify-center">
        <img
          src={`/images/diamonds/shapes/${variant}.jpg`}
          alt={`${name} cut diamond`}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {/* Fallback text if image fails */}
        <span className="absolute inset-0 flex items-center justify-center text-gold-600 font-serif text-lg opacity-0 group-hover:opacity-0 pointer-events-none">
          {name}
        </span>
      </div>
      <h3 className="font-serif text-xl text-gold-700 mb-2">{name}</h3>
      <p className="text-sm text-charcoal leading-relaxed">{description}</p>
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gold-400 transition-all duration-300 group-hover:w-full" />
    </div>
  );
};

/* ---------------------------------------------
 * Static Data
 * -------------------------------------------*/
const diamondShapes = [
  { variant: "round", name: "Round Brilliant", description: "The most popular cut with maximum sparkle and brilliance" },
  { variant: "princess", name: "Princess Cut", description: "Modern square cut with sharp corners and excellent fire" },
  { variant: "emerald", name: "Emerald Cut", description: "Step-cut with rectangular facets and hall-of-mirrors effect" },
  { variant: "oval", name: "Oval Cut", description: "Elegant elongated shape that appears larger than round" },
  { variant: "marquise", name: "Marquise Cut", description: "Football-shaped cut that maximizes carat weight visually" },
  { variant: "pear", name: "Pear Cut", description: "Teardrop shape combining round and marquise characteristics" },
  { variant: "heart", name: "Heart Cut", description: "Romantic symbol-shaped cut requiring expert craftsmanship" },
  { variant: "cushion", name: "Cushion Cut", description: "Square or rectangular cut with rounded corners and soft appearance" },
  { variant: "radiant", name: "Radiant Cut", description: "Brilliant-cut rectangular or square shape with trimmed corners" },
];

const colorScale = [
  { range: "D", label: "Exceptional White +", bg: "bg-gray-50", border: "border-gray-300" },
  { range: "E", label: "Exceptional White", bg: "bg-gray-100", border: "border-gray-300" },
  { range: "F", label: "Rare White +", bg: "bg-gray-200", border: "border-gray-300" },
  { range: "G", label: "Rare White", bg: "bg-gray-300", border: "border-gray-400" },
  { range: "H", label: "White", bg: "bg-gray-400", border: "border-gray-500" },
  { range: "I-J", label: "Slightly Tinted White", bg: "bg-yellow-50", border: "border-yellow-200" },
  { range: "K-L", label: "Tinted White", bg: "bg-yellow-100", border: "border-yellow-300" },
  { range: "M+", label: "Tinted Colour", bg: "bg-yellow-200", border: "border-yellow-400" },
];

const clarityScale = [
  { grade: "FL", desc: "Flawless – no inclusions or blemishes visible under 10×", level: "Exceptional" },
  { grade: "IF", desc: "Internally Flawless – surface marks only, no internal inclusions", level: "Excellent" },
  { grade: "VVS₁ / VVS₂", desc: "Very, very small inclusions, extremely hard to see at 10×", level: "Premium" },
  { grade: "VS₁ / VS₂", desc: "Very small inclusions, difficult to see at 10×", level: "Very Good" },
  { grade: "SI₁ / SI₂", desc: "Small inclusions, easily seen at 10× but often eye-clean", level: "Good" },
  { grade: "I₁ / I₂ / I₃", desc: "Noticeable inclusions that may affect transparency or brilliance", level: "Commercial" },
];

const caratExamples = [
  { carat: "0.25", diameter: "4.1mm", price: "₹ 8,000–15,000", size: "Small" },
  { carat: "0.50", diameter: "5.2mm", price: "₹ 30,000–60,000", size: "Medium" },
  { carat: "0.75", diameter: "5.9mm", price: "₹ 60,000–1,20,000", size: "Large" },
  { carat: "1.00", diameter: "6.5mm", price: "₹ 1,50,000–3,00,000", size: "Premium" },
  { carat: "1.50", diameter: "7.4mm", price: "₹ 3,00,000–6,00,000", size: "Luxury" },
  { carat: "2.00", diameter: "8.2mm", price: "₹ 6,00,000+", size: "Exceptional" },
];

export default function EducationDiamond() {
  return (
    <main className="bg-cream text-charcoal">
      {/* HERO */}
      <section className="relative flex h-[50vh] items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero/diamond-hero.jpg')" }}>
        <div className="absolute inset-0 bg-white/85" />
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="font-serif text-5xl md:text-7xl text-gold-700 tracking-widest drop-shadow-sm">
            The Diamond Guide
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-charcoal font-light uppercase tracking-[0.2em]">
            Master the 4Cs: Cut, Color, Clarity & Carat Weight
          </p>
          <p className="mt-3 text-lg text-gold-600 italic">
            Expert guidance from Minalgems
          </p>
          <div className="mt-8 h-0.5 w-32 mx-auto bg-gold-400" />
        </div>
      </section>

      {/* CONTENT WRAPPER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-28">

        {/* INTRO */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 border border-gold-500 text-gold-600 text-sm uppercase tracking-widest">
              Diamond Essentials
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-gold-700">What Makes a Diamond Special?</h2>
            <p className="text-lg leading-relaxed text-charcoal">
              Diamonds are nature's perfect crystals formed under immense pressure and heat deep within the Earth. Their unique atomic structure allows them to bend, reflect, and refract light like no other gemstone, creating that signature sparkle.
            </p>
            <div className="bg-gold-50 border border-gold-200 p-6 rounded-sm">
              <p className="text-charcoal font-medium">
                <span className="font-bold text-gold-600">Expert Tip:</span> A well-cut diamond can appear larger and brighter than a heavier stone with poor proportions. Always prioritize cut quality.
              </p>
            </div>
          </div>
          <div className="overflow-hidden rounded-sm shadow-lg border border-gold-100">
            <img src="/images/hero/diamond.jpg" alt="Natural diamond" className="w-full h-full object-cover" />
          </div>
        </section>

        {/* THE 4Cs HEADING */}
        <div className="text-center">
          <h2 className="font-serif text-4xl md:text-5xl text-gold-700">The 4Cs of Diamond Quality</h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-charcoal">
            These four characteristics determine a diamond's beauty, rarity, and value. Understanding them ensures you make an informed choice.
          </p>
        </div>

        {/* 1. SHAPE & CUT */}
        <section>
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white font-serif text-xl">
              1
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-gold-700">Shape & Cut Quality</h3>
          </div>
          <p className="mb-10 max-w-3xl text-lg text-charcoal">
            The cut determines how well a diamond interacts with light. It's the most important factor affecting sparkle, fire, and brilliance.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {diamondShapes.map((shape) => (
              <DiamondShapeCard key={shape.variant} {...shape} />
            ))}
          </div>
        </section>

        {/* 2. COLOR */}
        <section className="bg-white border border-gold-100 p-8 md:p-12 rounded-sm shadow-sm">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white font-serif text-xl">
              2
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-gold-700">Color Grade</h3>
          </div>
          <p className="mb-10 max-w-3xl text-lg text-charcoal">
            Most diamonds appear colorless but have subtle tints. The GIA scale runs from D (colorless) to Z (light color), with D being the rarest and most valuable.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {colorScale.map((color) => (
              <div key={color.range} className="border border-gold-100 bg-cream p-5 rounded-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-serif text-2xl text-gold-700">{color.range}</span>
                  <div className={`h-8 w-8 rounded-full ${color.bg} border ${color.border}`} />
                </div>
                <h4 className="font-medium text-charcoal">{color.label}</h4>
                <p className="text-sm text-charcoal mt-1">
                  {color.range === 'D' || color.range === 'E' || color.range === 'F'
                    ? 'Exceptionally rare and valuable'
                    : color.range === 'G' || color.range === 'H'
                    ? 'Excellent value for money'
                    : 'Warm tones perfect for yellow gold settings'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 3. CLARITY */}
        <section>
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white font-serif text-xl">
              3
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-gold-700">Clarity Grade</h3>
          </div>
          <p className="mb-10 max-w-3xl text-lg text-charcoal">
            Clarity refers to the absence of inclusions and blemishes. Most diamonds have microscopic imperfections that don't affect beauty to the naked eye.
          </p>
          <div className="space-y-4">
            {clarityScale.map((clarity, idx) => (
              <div key={clarity.grade} className="border border-gold-100 bg-white p-6 rounded-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-serif text-xl text-gold-700">{clarity.grade}</span>
                    <span className="text-xs uppercase tracking-widest bg-gold-100 text-gold-600 px-3 py-1 rounded-full">
                      {clarity.level}
                    </span>
                  </div>
                  <p className="mt-2 text-charcoal">{clarity.desc}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gold-500">Eye Clean?</div>
                  <div className={`text-lg font-semibold ${idx <= 3 ? 'text-green-700' : 'text-gold-600'}`}>
                    {idx <= 3 ? 'Yes' : 'With Care'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CARAT WEIGHT */}
        <section className="bg-white border border-gold-100 p-8 md:p-12 rounded-sm shadow-sm">
          <div className="mb-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold-500 text-white font-serif text-xl">
              4
            </div>
            <h3 className="font-serif text-3xl md:text-4xl text-gold-700">Carat Weight & Size</h3>
          </div>
          <p className="mb-10 max-w-3xl text-lg text-charcoal">
            Carat weight measures a diamond's physical weight. Size perception depends on cut quality and shape—some cuts face up larger than others.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caratExamples.map((example) => (
              <div key={example.carat} className="border border-gold-100 bg-cream p-6 rounded-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-serif text-2xl text-gold-700">{example.carat} ct</span>
                    <p className="text-sm text-gold-500">{example.size} Diamond</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-charcoal">{example.price}</p>
                    <p className="text-xs text-gold-500">Approx. Range</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-charcoal">Face-up Diameter</p>
                  <p className="text-xl font-bold text-gold-600">{example.diameter}</p>
                </div>
                <div className="h-1.5 w-full bg-gold-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-400 rounded-full" style={{ width: `${(parseFloat(example.carat) / 2) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* BUYING GUIDE */}
        <section className="bg-charcoal text-white p-8 md:p-12 rounded-sm">
          <h3 className="font-serif text-3xl text-gold-400 mb-8">How to Choose Your Diamond</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-medium mb-4 text-gold-200">Essential Steps</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 text-charcoal text-sm flex items-center justify-center font-bold">1</span>
                  <span>Set a budget that includes setting and certification</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 text-charcoal text-sm flex items-center justify-center font-bold">2</span>
                  <span>Choose shape based on personal style and finger shape</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-500 text-charcoal text-sm flex items-center justify-center font-bold">3</span>
                  <span>Prioritize cut quality for maximum sparkle</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-medium mb-4 text-gold-200">Pro Tips</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400 text-charcoal text-sm flex items-center justify-center">✓</span>
                  <span>VS/SI clarity diamonds often appear flawless to the naked eye</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400 text-charcoal text-sm flex items-center justify-center">✓</span>
                  <span>Color H-I diamonds offer excellent value in yellow gold</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gold-400 text-charcoal text-sm flex items-center justify-center">✓</span>
                  <span>Always request GIA or IGI certification</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CERTIFICATION & ETHICS */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="border border-gold-200 bg-white p-8 rounded-sm shadow-sm">
            <h3 className="font-serif text-2xl text-gold-700 mb-6 flex items-center gap-3">
              <span className="text-3xl">📋</span> Certification Matters
            </h3>
            <div className="space-y-4">
              <div className="bg-gold-50 p-4 rounded-sm">
                <h4 className="font-semibold text-gold-700">GIA Certified</h4>
                <p className="text-sm text-charcoal mt-1">Global standard for diamond grading</p>
              </div>
              <div className="bg-gold-50 p-4 rounded-sm">
                <h4 className="font-semibold text-gold-700">IGI Certified</h4>
                <p className="text-sm text-charcoal mt-1">Excellent for fancy colored diamonds</p>
              </div>
              <div className="bg-gold-50 p-4 rounded-sm">
                <h4 className="font-semibold text-gold-700">HRD Antwerp</h4>
                <p className="text-sm text-charcoal mt-1">European standard of excellence</p>
              </div>
            </div>
          </div>
          <div className="border border-gold-200 bg-white p-8 rounded-sm shadow-sm">
            <h3 className="font-serif text-2xl text-gold-700 mb-6 flex items-center gap-3">
              <span className="text-3xl">🌱</span> Ethical Sourcing
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-charcoal">
                <span className="text-gold-500">•</span> Kimberley Process compliant rough
              </li>
              <li className="flex items-center gap-2 text-charcoal">
                <span className="text-gold-500">•</span> Conflict-free certification
              </li>
              <li className="flex items-center gap-2 text-charcoal">
                <span className="text-gold-500">•</span> Lab-grown diamond options available
              </li>
              <li className="flex items-center gap-2 text-charcoal">
                <span className="text-gold-500">•</span> Traceable supply chain
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gold-600 text-white p-8 md:p-12 rounded-sm shadow-lg">
            <h3 className="font-serif text-2xl mb-4">Personalized Consultation</h3>
            <p className="mb-6 text-white/90">
              Let our diamond experts guide you through the selection process with real diamonds side-by-side comparisons.
            </p>
            <Link
              to="/contact"
              className="inline-block px-8 py-3 border border-white text-white hover:bg-white hover:text-gold-600 transition uppercase tracking-widest text-sm"
            >
              Book Appointment
            </Link>
          </div>
          <div className="bg-charcoal text-white p-8 md:p-12 rounded-sm shadow-lg">
            <h3 className="font-serif text-2xl text-gold-400 mb-4">Lifetime Care Program</h3>
            <ul className="mb-6 space-y-3">
              <li className="flex items-center gap-3">
                <span className="text-gold-400">✓</span> Complimentary cleaning & inspection
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gold-400">✓</span> Prong tightening & maintenance
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gold-400">✓</span> Upgrade program for future purchases
              </li>
            </ul>
            <Link
              to="/services"
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