import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const floatingLogos = [
  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', position: 'top-[18%] left-[12%]', delay: '0s', size: 'w-14 h-14' },
  { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', position: 'top-[30%] left-[5%]', delay: '0.5s', size: 'w-12 h-12', invertInDark: true },
  { name: 'Meta', logo: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#0668E1" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0z"/><path fill="#fff" d="M362.1 196.2c-7.3-10.8-17.6-17.1-30.3-17.1-21.4 0-38.4 23.1-57.3 62.3-5.4 11.2-10.3 22.3-14.8 32.5-4.5-10.2-9.4-21.3-14.8-32.5-18.9-39.2-35.9-62.3-57.3-62.3-12.7 0-23 6.3-30.3 17.1-13.2 19.5-19.8 49.2-19.8 82.8 0 28.8 5.5 51.3 15.5 65.1 8.7 12 20.3 18.1 33.5 18.1 20.2 0 36.2-16.5 56.8-52.7l17-30c17-30 22.5-38.5 22.5-38.5s5.5 8.5 22.5 38.5l17 30c20.6 36.2 36.6 52.7 56.8 52.7 13.2 0 24.8-6.1 33.5-18.1 10-13.8 15.5-36.3 15.5-65.1 0-33.6-6.6-63.3-19.8-82.8zm-175.4 137c-5.2 0-10.2-3.2-14.8-9.5-6.5-9-10.2-24.5-10.2-45.7 0-24.3 3.8-46.2 11.2-60.5 3.5-6.8 7.5-10.4 11.5-10.4 10.2 0 23.5 18.5 39.8 52.3 5.8 12 11 24 15.5 34.8-18.5 30.5-34.5 39-53 39zm148.6-9.5c-4.6 6.3-9.6 9.5-14.8 9.5-18.5 0-34.5-8.5-53-39 4.5-10.8 9.7-22.8 15.5-34.8 16.3-33.8 29.6-52.3 39.8-52.3 4 0 8 3.6 11.5 10.4 7.4 14.3 11.2 36.2 11.2 60.5 0 21.2-3.7 36.7-10.2 45.7z"/></svg>'), position: 'top-[48%] left-[4%]', delay: '1s', size: 'w-14 h-14' },
  { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg', position: 'bottom-[28%] right-[6%]', delay: '0.3s', size: 'w-14 h-14' },
  { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', position: 'top-[16%] right-[14%]', delay: '0.7s', size: 'w-14 h-14' },
  { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', position: 'top-[34%] right-[4%]', delay: '1.2s', size: 'w-16 h-16' },
  { name: 'Airbnb', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_B%C3%A9lo.svg', position: 'top-[52%] right-[8%]', delay: '1.5s', size: 'w-12 h-12' },
  { name: 'Adobe', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8d/Adobe_Corporate_Logo.svg', position: 'bottom-[24%] left-[10%]', delay: '1.8s', size: 'w-14 h-14' },
];

const HeroSection = () => {
  const { theme, isDark } = useTheme();
  const [failedLogos, setFailedLogos] = useState(new Set());

  const handleLogoError = (name) => {
    setFailedLogos((prev) => new Set(prev).add(name));
  };

  return (
    <section className={`min-h-screen flex items-center pt-20 pb-16 md:pt-24 md:pb-20 ${theme.bg.gradient} relative overflow-hidden`}>
      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full blur-3xl animate-blob ${isDark ? 'bg-cyan-900/20' : 'bg-blue-100/60'}`} />
        <div className={`absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] rounded-full blur-3xl animate-blob animation-delay-2000 ${isDark ? 'bg-purple-900/20' : 'bg-purple-100/60'}`} />
      </div>

      {/* Floating company logos — raw logos, no background */}
      {floatingLogos.map((company) =>
        failedLogos.has(company.name) ? null : (
          <div
            key={company.name}
            className={`absolute ${company.position} hidden lg:block z-[5] pointer-events-none animate-float-slow opacity-60 hover:opacity-100 transition-opacity`}
            style={{ animationDelay: company.delay }}
          >
            <img
              src={company.logo}
              alt={company.name}
              className={`${company.size} object-contain ${company.invertInDark && isDark ? 'invert' : ''}`}
              onError={() => handleLogoError(company.name)}
            />
          </div>
        )
      )}

      {/* Content */}
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className={`text-4xl md:text-6xl font-bold ${theme.text.primary} mb-6 leading-tight`}>
            Your one-stop shop to{' '}
            <span className="gradient-text-animated">
              crack product-based companies
            </span>
          </h1>

          <p className={`text-lg md:text-xl ${theme.text.secondary} mb-10 max-w-2xl mx-auto leading-relaxed`}>
            Learn how engineers at Amazon, Google, and Meta prepare — with courses, mock interviews, and hands-on practice all in one place.
          </p>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-10">
            {[
              'DSA & System Design courses',
              'Mock interviews with MAANG engineers',
              'Detailed feedback reports',
              'Resume review',
            ].map((point) => (
              <div key={point} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#06b6d4] shrink-0" />
                <span className={`text-sm ${theme.text.secondary}`}>{point}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1"
            >
              Start Preparing Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/learn"
              className={`inline-flex items-center justify-center gap-2 px-8 py-4 ${theme.button.secondary} rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1`}
            >
              Explore Courses
            </Link>
          </div>

          <p className={`text-sm ${theme.text.muted}`}>
            Start free. Go deep when you're ready.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
