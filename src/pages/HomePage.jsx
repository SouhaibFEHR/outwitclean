import React from 'react';
import HeroSection from '@/components/sections/HeroSection.jsx';
import HeadlineStatementSection from '@/components/sections/HeadlineStatementSection.jsx'; // Import new section
import ServicesSection from '@/components/sections/ServicesSection.jsx';
import GameZoneSection from '@/components/sections/GameZoneSection.jsx';
import PortfolioSection from '@/components/sections/PortfolioSection.jsx';
import LeadCaptureFormSection from '@/components/sections/LeadCaptureFormSection.jsx';
import TestimonialsSection from '@/components/sections/TestimonialsSection.jsx';
import AboutSection from '@/components/sections/AboutSection.jsx';
import ProcessSection from '@/components/sections/ProcessSection.jsx';


const HomePage = () => {
  return (
    <>
      <HeroSection />
      <HeadlineStatementSection /> {/* Add new section here */}
      <AboutSection />
      <ServicesSection />
      <ProcessSection />
      <GameZoneSection />
      <PortfolioSection />
      <TestimonialsSection />
      <LeadCaptureFormSection />
    </>
  );
};

export default HomePage;