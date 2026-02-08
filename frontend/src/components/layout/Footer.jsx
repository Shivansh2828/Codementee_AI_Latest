import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { siteConfig } from '../../data/mock';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer className={`${theme.bg.secondary} ${theme.border.primary} border-t py-12 md:py-16`}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block">
              <span className={`text-2xl font-bold ${theme.text.primary}`}>
                {siteConfig.name}
              </span>
            </Link>
            <p className={`mt-4 ${theme.text.secondary} text-sm leading-relaxed`}>
              A founder-led mentorship program helping engineers crack interviews at top product companies.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`${theme.text.primary} font-semibold mb-4`}>Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#pricing" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Pricing
                </a>
              </li>
              <li>
                <Link to="/apply" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Apply Now
                </Link>
              </li>
              <li>
                <Link to="/login" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className={`${theme.text.primary} font-semibold mb-4`}>Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy-policy" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className={`${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`${theme.text.primary} font-semibold mb-4`}>Contact</h4>
            <a 
              href={`mailto:${siteConfig.contactEmail}`}
              className={`flex items-center gap-2 ${theme.text.secondary} hover:${theme.text.accent} transition-colors text-sm`}
            >
              <Mail size={16} />
              {siteConfig.contactEmail}
            </a>
            <p className={`mt-4 ${theme.text.muted} text-xs`}>
              {siteConfig.founderName}
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className={`mt-12 pt-8 ${theme.border.primary} border-t`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className={`${theme.text.muted} text-xs`}>
              © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            </p>
            <p className={`${theme.text.muted} text-xs`}>
              Built for engineers, by engineers.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
