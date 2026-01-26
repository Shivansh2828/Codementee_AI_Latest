import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Clock, Send, Loader2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'sonner';

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate sending
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors mb-8">
            <ArrowLeft size={18} /> Back to Home
          </Link>

          <h1 className="text-3xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-slate-400 mb-8">Have questions? We're here to help.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#06b6d4] p-3 rounded-lg">
                    <Mail size={24} className="text-[#0f172a]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email Us</h3>
                    <a href="mailto:hello@codementee.com" className="text-[#06b6d4] hover:underline">hello@codementee.com</a>
                    <p className="text-slate-400 text-sm mt-1">For general inquiries and support</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#06b6d4] p-3 rounded-lg">
                    <Clock size={24} className="text-[#0f172a]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Response Time</h3>
                    <p className="text-slate-300">Within 24-48 hours</p>
                    <p className="text-slate-400 text-sm mt-1">Monday to Saturday, 10 AM - 7 PM IST</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#06b6d4] p-3 rounded-lg">
                    <MessageSquare size={24} className="text-[#0f172a]" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Common Topics</h3>
                    <ul className="text-slate-400 text-sm space-y-1 mt-1">
                      <li>• Payment & billing questions</li>
                      <li>• Mock interview scheduling</li>
                      <li>• Technical issues</li>
                      <li>• Refund requests</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Send us a message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white focus:outline-none focus:border-[#06b6d4]"
                  >
                    <option value="">Select a topic</option>
                    <option value="general">General Inquiry</option>
                    <option value="payment">Payment Issue</option>
                    <option value="scheduling">Mock Interview Scheduling</option>
                    <option value="refund">Refund Request</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white text-sm font-medium mb-2">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-[#0f172a] border border-[#334155] text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center gap-2">
                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactUs;
