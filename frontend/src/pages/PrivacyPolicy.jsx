import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
              <p>Codementee ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Personal Information:</strong> Name, email address, phone number</li>
                <li><strong>Professional Information:</strong> Current role, experience, target companies</li>
                <li><strong>Payment Information:</strong> Processed securely through Razorpay (we do not store card details)</li>
                <li><strong>Interview Data:</strong> Mock interview recordings, feedback, and performance scores</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our mentorship services</li>
                <li>To process payments and send transaction confirmations</li>
                <li>To match you with appropriate mentors</li>
                <li>To communicate about your mock interviews and feedback</li>
                <li>To improve our services and user experience</li>
                <li>To send important updates about our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Mentors:</strong> To facilitate mock interviews and provide feedback</li>
                <li><strong>Payment Processors:</strong> Razorpay for secure payment processing</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Cookies</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2"><strong>Email:</strong> <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">support@codementee.com</a></p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
