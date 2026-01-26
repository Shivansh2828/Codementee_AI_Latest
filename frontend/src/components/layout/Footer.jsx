import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { siteConfig } from '../../data/mock';

const Footer = () => {
  return (
    <footer className="bg-[#0f172a] border-t border-[#334155]/50 py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className="text-2xl font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              A founder-led mentorship program helping engineers crack interviews at top product companies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#how-it-works" className="text-slate-400 hover:text-[#06b6d4] transition-colors text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#pricing" className="text-slate-400 hover:text-[#06b6d4] transition-colors text-sm">
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/apply" className="text-slate-400 hover:text-[#06b6d4] transition-colors text-sm">
                  Apply Now
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <a 
              href={`mailto:${siteConfig.contactEmail}`}
              className="flex items-center gap-2 text-slate-400 hover:text-[#06b6d4] transition-colors text-sm"
            >
              <Mail size={16} />
              {siteConfig.contactEmail}
            </a>
            <p className="mt-4 text-slate-500 text-xs">
              {siteConfig.founderName}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-[#334155]/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className="text-slate-500 text-xs">
              Built for engineers, by engineers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
