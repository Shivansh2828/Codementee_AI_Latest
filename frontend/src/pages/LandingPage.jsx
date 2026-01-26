import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSection from '../components/landing/HeroSection';
import DeliverablesSection from '../components/landing/DeliverablesSection';
import ProblemSection from '../components/landing/ProblemSection';
import SolutionSection from '../components/landing/SolutionSection';
import WhoSection from '../components/landing/WhoSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import PricingSection from '../components/landing/PricingSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a]">
      <Header />
      <main>
        <HeroSection />
        <DeliverablesSection />
        <ProblemSection />
        <SolutionSection />
        <WhoSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
