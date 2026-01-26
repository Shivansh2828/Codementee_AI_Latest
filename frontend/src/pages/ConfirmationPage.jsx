import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { siteConfig } from '../data/mock';

const ConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center pt-24 pb-16">
        <div className="container">
          <div className="max-w-xl mx-auto text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 rounded-full bg-[#06b6d4] flex items-center justify-center mx-auto mb-8">
              <CheckCircle size={40} className="text-[#0f172a]" />
            </div>

            <h1 className="heading-1 mb-4">
              Application Received!
            </h1>

            <p className="body-large mb-8">
              Welcome to the Codementee Founding Cohort application pool. If shortlisted, you'll receive payment & onboarding details via email/WhatsApp.
            </p>

            {/* What's Next */}
            <div className="p-6 rounded-xl border border-[#334155] bg-[#1e293b]/50 mb-8 text-left">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Mail size={20} className="text-[#06b6d4]" />
                What happens next?
              </h3>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">1.</span>
                  We'll review your application within 24 hours
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">2.</span>
                  If you're a fit, you'll receive payment instructions
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#06b6d4]">3.</span>
                  Once payment is confirmed, you'll be onboarded to the cohort
                </li>
              </ul>
            </div>

            {/* Contact */}
            <p className="text-sm text-slate-400 mb-8">
              Questions? Reach out at{' '}
              <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#06b6d4] hover:underline">
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
