export default function ShippingPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="font-serif text-4xl text-gold-600 mb-8 text-center">
        Shipping Policy
      </h1>

      <div className="space-y-8 text-charcoal leading-relaxed">

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Shipping Coverage
          </h2>

          <p>
            Minal Gems currently ships across India and selected international
            locations depending on availability and regulations.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Processing Time
          </h2>

          <p>
            Orders are generally processed within 15 - 20 business days after
            payment confirmation.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Delivery Time
          </h2>

          <p>
            Delivery timelines may vary based on location, courier partner,
            product availability, and customization requirements.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Secure Packaging
          </h2>

          <p>
            All jewellery products are securely packaged to ensure safe delivery
            and product protection during transit.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Shipping Charges
          </h2>

          <p>
            Shipping charges, if applicable, will be displayed during checkout
            before payment confirmation.
          </p>
        </section>

      </div>
    </div>
  );
}