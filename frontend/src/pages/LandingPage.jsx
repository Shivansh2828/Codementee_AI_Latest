import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import DeliverablesSection from '../components/landing/DeliverablesSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import WhoSection from '../components/landing/WhoSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import MockInterviewProcessSection from '../components/landing/MockInterviewProcessSection';

const LandingPage = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen ${theme.bg.primary}`}>
      <Header />
      <main>
        <HeroSection />
        <MockInterviewProcessSection />
        <DeliverablesSection />
        <ProblemSection />
        <SolutionSection />
        <WhoSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
