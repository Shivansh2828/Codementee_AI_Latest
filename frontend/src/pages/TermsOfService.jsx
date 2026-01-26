import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using Codementee's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Services</h2>
              <p>Codementee provides:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>1-on-1 mock interviews with experienced mentors</li>
                <li>Structured feedback and performance evaluation</li>
                <li>Resume review services</li>
                <li>Access to private mentor community</li>
                <li>Career guidance and interview preparation support</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must be at least 18 years old to use our services</li>
                <li>One account per person; sharing accounts is prohibited</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Payment Terms</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed securely through Razorpay</li>
                <li>Prices are in Indian Rupees (INR) and inclusive of applicable taxes</li>
                <li>Subscription plans are billed as per the selected duration (monthly/quarterly/biannually)</li>
                <li>Payment is required before accessing mentorship services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Mock Interview Guidelines</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be punctual for scheduled mock interviews</li>
                <li>Cancellations must be made at least 24 hours in advance</li>
                <li>No-shows may result in forfeiture of the scheduled session</li>
                <li>Maintain professional conduct during all interactions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <p>All content, feedback templates, and materials provided by Codementee are our intellectual property and may not be reproduced or distributed without permission.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p>Codementee provides interview preparation guidance but does not guarantee job placements or interview success. Our services are educational in nature.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate behavior.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of our services after changes constitutes acceptance of the new terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">10. Contact</h2>
              <p>For questions about these Terms, contact us at:</p>
              <p className="mt-2"><strong>Email:</strong> <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">support@codementee.com</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
