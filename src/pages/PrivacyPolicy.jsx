export default function PrivacyPolicy() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl text-gold-600 mb-4">
          Privacy Policy
        </h1>

        <p className="text-charcoal/70 text-lg">
          Your privacy and data security are important to us.
        </p>
      </div>

      <div className="space-y-10 text-charcoal leading-relaxed">

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Introduction
          </h2>

          <p>
            Minal Gems values your trust and is committed to protecting your
            personal information. This Privacy Policy explains how we collect,
            use, and safeguard your information when you visit our website,
            place an order, or interact with our services.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Information We Collect
          </h2>

          <p className="mb-3">
            We may collect the following information:
          </p>

          <ul className="list-disc pl-6 space-y-2">
            <li>Name and contact details</li>
            <li>Email address and phone number</li>
            <li>Shipping and billing address</li>
            <li>Order and transaction details</li>
            <li>Device and browser information</li>
            <li>Website usage and analytics data</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            How We Use Your Information
          </h2>

          <ul className="list-disc pl-6 space-y-2">
            <li>To process and fulfill orders</li>
            <li>To provide customer support</li>
            <li>To improve website functionality and user experience</li>
            <li>To send order updates and important notifications</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Payment Security
          </h2>

          <p>
            All online payments are processed securely through trusted payment
            gateways. Minal Gems does not store your card or banking details on
            our servers.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Cookies & Analytics
          </h2>

          <p>
            Our website may use cookies and analytics tools to improve
            performance, personalize user experience, and understand visitor
            behavior.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Data Protection
          </h2>

          <p>
            We implement appropriate technical and security measures to protect
            your personal information against unauthorized access, misuse, or
            disclosure.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Third-Party Services
          </h2>

          <p>
            We may use trusted third-party services such as payment gateways,
            shipping partners, and analytics providers to operate our business
            efficiently.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Your Rights
          </h2>

          <p>
            You may contact us at any time to update, correct, or request
            deletion of your personal information, subject to applicable laws.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-gold-600 mb-3">
            Contact Us
          </h2>

          <p>
            If you have any questions regarding this Privacy Policy, you may
            contact us through our official contact page.
          </p>
        </section>

        <section>
          <p className="text-sm text-charcoal/60">
            Last Updated: {new Date().getFullYear()}
          </p>
        </section>

      </div>
    </div>
  );
}