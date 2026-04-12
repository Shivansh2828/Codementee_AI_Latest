import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import LearningShowcaseSection from '../components/landing/LearningShowcaseSection';
import MockInterviewProcessSection from '../components/landing/MockInterviewProcessSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main>
        <HeroSection />
        <LearningShowcaseSection />
        <MockInterviewProcessSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
