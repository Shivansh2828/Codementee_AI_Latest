import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Users, Trophy, Code, Terminal, Sparkles, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFoundingSlots } from '../../hooks/useFoundingSlots';

const HeroSection = () => {
  const { theme, isDark } = useTheme();
  const { remaining, total, sold_out, loading } = useFoundingSlots(30000); // Poll every 30 seconds
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20,
        y: (e.clientY / window.innerHeight) * 20
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingBadges = [
    { icon: Code, label: 'DSA', color: 'from-blue-500 to-cyan-500', delay: '0s', position: 'top-24 left-4 md:top-32 md:left-10' },
    { icon: Terminal, label: 'System Design', color: 'from-purple-500 to-pink-500', delay: '0.5s', position: 'top-40 right-4 md:top-48 md:right-20' },
    { icon: Sparkles, label: 'Behavioral', color: 'from-green-500 to-emerald-500', delay: '1s', position: 'top-[60%] left-4 md:left-20' },
    { icon: TrendingUp, label: 'Career Growth', color: 'from-orange-500 to-red-500', delay: '1.5s', position: 'top-[75%] right-4 md:right-10' },
  ];

  const companyLogos = [
    { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
    { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
    { name: 'Microsoft', logo: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg' },
    { name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg' },
    { name: 'Apple', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg' },
    { name: 'Netflix', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg' },
  ];

  return (
    <section className={`min-h-screen flex items-center pt-20 pb-16 md:pt-24 md:pb-20 ${theme.bg.gradient} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {!isDark ? (
          <>
            <div 
              className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-60 animate-blob"
              style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            />
            <div 
              className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-60 animate-blob animation-delay-2000"
              style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-green-100 to-emerald-100 rounded-full blur-3xl opacity-40 animate-blob animation-delay-4000"
            />
          </>
        ) : (
          <>
            <div 
              className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-full blur-3xl opacity-30 animate-blob"
              style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            />
            <div 
              className="absolute bottom-1/4 -left-1/4 w-[400px] h-[400px] bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-full blur-3xl opacity-30 animate-blob animation-delay-2000"
              style={{ transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)` }}
            />
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-full blur-3xl opacity-30 animate-blob animation-delay-4000"
            />
          </>
        )}
        
        {/* Floating Tech Badges - Positioned outside main content */}
        {floatingBadges.map((badge, index) => {
          const Icon = badge.icon;
          return (
            <div
              key={index}
              className={`absolute ${badge.position} hidden md:block z-20`}
              style={{ animationDelay: badge.delay }}
            >
              <div className={`${theme.glass} rounded-xl ${theme.border.primary} border ${theme.shadowMd} p-3 animate-float-slow backdrop-blur-xl hover:scale-110 transition-transform duration-300`}>
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 bg-gradient-to-br ${badge.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-sm font-medium ${theme.text.primary} whitespace-nowrap`}>{badge.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="container relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-center lg:text-left">
              {/* Scarcity Badge */}
              {!loading && (
                <div className={`inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full ${
                  sold_out 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500'
                } text-white shadow-lg ${!sold_out && 'animate-pulse-glow'}`}>
                  <span className="text-lg">🚀</span>
                  <span className="text-sm font-bold">
                    {sold_out 
                      ? 'Founding Batch — SOLD OUT' 
                      : `Only ${remaining} of ${total} Founding Seats Left`
                    }
                  </span>
                </div>
              )}

              {/* Main Headline */}
              <h1 className={`display-hero ${theme.text.primary} mb-6 text-balance leading-tight`}>
                Practice Real Interviews{' '}
                <span className="gradient-text-animated font-bold">
                  Before Your Dream Company Does
                </span>
              </h1>

              {/* Result-focused line */}
              <p className={`body-large ${theme.text.primary} mb-8 max-w-2xl mx-auto lg:mx-0 font-semibold`}>
                Engineers fail interviews because they never practiced in a real environment.
              </p>

              {/* 4 Value Points */}
              <div className="grid grid-cols-1 gap-3 mb-10 max-w-2xl mx-auto lg:mx-0">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className={`body-medium ${theme.text.primary} text-left`}>
                    1-on-1 mock interviews with top engineers
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className={`body-medium ${theme.text.primary} text-left`}>
                    Detailed feedback on strengths & weak areas
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className={`body-medium ${theme.text.primary} text-left`}>
                    Resume review to boost shortlist chances
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <p className={`body-medium ${theme.text.primary} text-left`}>
                    Actionable roadmap to improve in 2–3 weeks
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link 
                  to="/register" 
                  className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <span className="absolute inset-0 w-full h-full">
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></span>
                  </span>
                  
                  {/* Sparkle dots */}
                  <span className="absolute top-2 right-4 w-1 h-1 bg-white rounded-full animate-sparkle"></span>
                  <span className="absolute top-4 right-8 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.3s' }}></span>
                  <span className="absolute bottom-3 left-6 w-1 h-1 bg-white rounded-full animate-sparkle" style={{ animationDelay: '0.6s' }}></span>
                  
                  <span className="relative z-10">Book Your Mock Interview</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/pricing" 
                  className={`group inline-flex items-center justify-center gap-2 px-8 py-4 ${theme.button.secondary} rounded-xl transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-1`}
                >
                  View Pricing
                </Link>
              </div>

              {/* Scarcity Note */}
              {!loading && !sold_out && (
                <p className={`body-small ${theme.text.muted} italic max-w-2xl mx-auto lg:mx-0`}>
                  Once {total} slots fill, registrations close & pricing increases.
                </p>
              )}
              {sold_out && (
                <p className={`body-small text-red-400 font-semibold max-w-2xl mx-auto lg:mx-0`}>
                  Founding batch is sold out. Regular pricing now applies.
                </p>
              )}
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              {/* Main Card */}
              <div className={`${theme.glass} rounded-2xl ${theme.shadow} ${theme.border.primary} border p-8 relative`}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`heading-5 ${theme.text.primary}`}>Mock Interview Session</h3>
                    <p className={`body-small ${theme.text.secondary}`}>Amazon SDE-2 Preparation</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className={`text-center p-3 ${theme.glass} rounded-lg`}>
                    <p className="text-2xl font-bold text-green-600">95%</p>
                    <p className={`label ${theme.text.secondary}`}>Success Rate</p>
                  </div>
                  <div className={`text-center p-3 ${theme.glass} rounded-lg`}>
                    <p className="text-2xl font-bold text-blue-600">500+</p>
                    <p className={`label ${theme.text.secondary}`}>Mentees</p>
                  </div>
                  <div className={`text-center p-3 ${theme.glass} rounded-lg`}>
                    <p className="text-2xl font-bold text-purple-600">4.9</p>
                    <p className={`label ${theme.text.secondary}`}>Rating</p>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3">
                  {[
                    'Real-time coding challenges',
                    'System design discussions', 
                    'Behavioral question practice',
                    'Detailed feedback report'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                      <span className={`body-small ${theme.text.secondary}`}>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce" />
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full animate-pulse" />
              </div>

              {/* Floating Cards */}
              <div className={`absolute -top-6 -left-6 ${theme.glass} rounded-xl ${theme.shadow} ${theme.border.primary} border p-4 animate-float`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`ui-medium ${theme.text.primary}`}>Offer Received!</p>
                    <p className={`label ${theme.text.secondary}`}>Amazon SDE-2</p>
                  </div>
                </div>
              </div>

              <div className={`absolute -bottom-6 -right-6 ${theme.glass} rounded-xl ${theme.shadow} ${theme.border.primary} border p-4 animate-float-delayed`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className={`ui-medium ${theme.text.primary}`}>5.0 Rating</p>
                    <p className={`label ${theme.text.secondary}`}>Excellent feedback</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Logos Section */}
          <div className={`mt-20 pt-12 ${theme.border.primary} border-t`}>
            <p className={`text-center body-large ${theme.text.secondary} mb-10 font-medium`}>Our mentors have interviewed at:</p>
            <div className="relative overflow-hidden py-8">
              {/* Gradient fade edges */}
              <div className={`absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r ${isDark ? 'from-[#0d0d0d]' : 'from-white'} to-transparent z-10 pointer-events-none`} />
              <div className={`absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l ${isDark ? 'from-[#0d0d0d]' : 'from-white'} to-transparent z-10 pointer-events-none`} />
              
              {/* Animated scrolling logos */}
              <div className="flex items-center gap-16 md:gap-20 animate-scroll-logos">
                {[...companyLogos, ...companyLogos].map((company, index) => (
                  <div
                    key={`${company.name}-${index}`}
                    className="flex-shrink-0 flex flex-col items-center gap-3"
                  >
                    <div className={`px-4 py-3 rounded-lg ${isDark ? 'bg-white' : 'bg-transparent'}`}>
                      <img 
                        src={company.logo}
                        alt={company.name}
                        className="h-10 md:h-12 w-auto object-contain transition-all duration-300 hover:scale-110"
                        style={{ minWidth: '100px', maxWidth: '140px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${theme.text.secondary} whitespace-nowrap`}>
                      {company.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
