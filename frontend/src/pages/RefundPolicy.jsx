import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const RefundPolicy = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-8">Refund & Cancellation Policy</h1>
          <p className="text-slate-400 mb-8">Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-6 text-slate-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Refund Eligibility</h2>
              <p>We want you to be satisfied with our services. Refunds are available under the following conditions:</p>
              <ul className="list-disc pl-6 space-y-2 mt-3">
                <li><strong>Within 7 days of purchase:</strong> Full refund if no mock interview has been conducted</li>
                <li><strong>Service not delivered:</strong> Full refund if we fail to schedule your mock interview within 14 days of payment</li>
                <li><strong>Technical issues:</strong> Session credit or refund if technical problems on our end prevent the mock interview</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Non-Refundable Scenarios</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>After a mock interview has been completed</li>
                <li>If you miss a scheduled session without 24-hour prior notice</li>
                <li>After using any mentorship services (feedback review, community access, etc.)</li>
                <li>Partial refunds for multi-month plans after the first month</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Cancellation Policy</h2>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Mock Interview Cancellation:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>24+ hours before:</strong> Full reschedule, no penalty</li>
                <li><strong>Less than 24 hours:</strong> Session may be forfeited or rescheduled at mentor's discretion</li>
                <li><strong>No-show:</strong> Session is forfeited</li>
              </ul>
              
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Subscription Cancellation:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>You may cancel your subscription at any time</li>
                <li>Access continues until the end of your paid period</li>
                <li>No refunds for unused portions of multi-month plans</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. How to Request a Refund</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Email us at <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">support@codementee.com</a></li>
                <li>Include your registered email and order/transaction ID</li>
                <li>Briefly explain the reason for your refund request</li>
                <li>We will respond within 2-3 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Refund Processing</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Approved refunds are processed within 5-7 business days</li>
                <li>Refunds are credited to the original payment method</li>
                <li>Bank processing may take an additional 5-10 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Contact Us</h2>
              <p>For refund requests or questions about this policy:</p>
              <p className="mt-2"><strong>Email:</strong> <a href="mailto:support@codementee.com" className="text-[#06b6d4] hover:underline">support@codementee.com</a></p>
              <p className="mt-1"><strong>Response Time:</strong> Within 24-48 hours</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
