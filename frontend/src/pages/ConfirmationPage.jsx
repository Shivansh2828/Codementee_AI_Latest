import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { siteConfig } from '../data/mock';

const ConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-[#1a1c1b] flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-[#d9fb06] flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} className="text-[#1a1c1b]" />
            </div>

            <h1 className="heading-1 text-white mb-4">
              Application Received!
            </h1>

            <p className="body-large mb-8">
              Welcome to the Codementee Founding Cohort application pool. If shortlisted, you'll receive payment & onboarding details via email/WhatsApp.
            </p>

            {/* What's Next */}
            <div className="p-6 rounded-lg border border-[#3f4816] bg-[#302f2c]/50 mb-8 text-left">
              <h3 className="heading-3 text-white mb-4 flex items-center gap-2">
                <Mail size={20} className="text-[#d9fb06]" />
                What happens next?
              </h3>
              <ul className="space-y-3 text-[#888680]">
                <li className="flex items-start gap-2">
                  <span className="text-[#d9fb06]">1.</span>
                  We'll review your application within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d9fb06]">2.</span>
                  If you're a fit, you'll receive payment instructions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d9fb06]">3.</span>
                  Once payment is confirmed, you'll be onboarded to the cohort
                </li>
              </ul>
            </div>

            {/* Contact */}
            <p className="text-sm text-[#888680] mb-8">
              Questions? Reach out at{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#d9fb06] hover:underline">
                {siteConfig.contactEmail}
              </a>
            </p>

            {/* Back to Home */}
            <Link to="/" className="btn-secondary inline-flex items-center gap-2">
              <ArrowRight size={18} className="rotate-180" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ConfirmationPage;
