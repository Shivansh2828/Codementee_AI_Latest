import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MessageSquare, Clock, Send, Loader2, Phone } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { toast } from 'sonner';
import { siteConfig } from '../data/mock';

const ContactUs = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Message sent! We\'ll get back to you soon.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  const whatsappNumber = siteConfig.whatsapp.replace(/[^0-9]/g, '');
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20Codementee%2C%20I%20have%20a%20question%20about%20your%20mentorship%20program.`;

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
                    <a href={`mailto:${siteConfig.contactEmail}`} className="text-[#06b6d4] hover:underline">{siteConfig.contactEmail}</a>
                    <p className="text-slate-400 text-sm mt-1">For general inquiries and support</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#25D366] p-3 rounded-lg">
                    <Phone size={24} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">WhatsApp</h3>
                    <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">{siteConfig.whatsapp}</a>
                    <p className="text-slate-400 text-sm mt-1">Quick responses on WhatsApp</p>
                    <a 
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5C] transition-colors text-sm font-medium"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Chat on WhatsApp
                    </a>
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
