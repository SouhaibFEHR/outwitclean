
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Menu, X, Zap } from 'lucide-react';

const Navbar = ({ onLaunchProject }) => {
  const [isOpen, setIsOpen] = useState(false);
  const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/da4e84807be20560b6128922b55295de.png"; 
  const navRef = useRef(null);
  // navHeight state removed as it's not directly used for rendering logic here,
  // CSS variables are updated directly in useEffect

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const currentHeight = navRef.current.offsetHeight;
        // setNavHeight(currentHeight); // Not strictly needed if only setting CSS var
        if (typeof window !== 'undefined') {
          document.documentElement.style.setProperty('--navbar-height', `${currentHeight}px`);
        }
      }
    };

    updateNavHeight(); 
    window.addEventListener('resize', updateNavHeight);
    
    const observer = new MutationObserver(updateNavHeight);
    if (navRef.current) {
      observer.observe(navRef.current, { childList: true, subtree: true, attributes: true });
    }
    
    return () => {
      window.removeEventListener('resize', updateNavHeight);
      observer.disconnect();
    };
  }, [isOpen]); // isOpen dependency remains as mobile menu changes height


  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      // Calculate offset if navbar is fixed and opaque
      const navbarHeightVal = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 0;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeightVal - 20; // 20px extra padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsOpen(false);
  };

  const navItems = [
    { id: 'services', label: 'Solutions' },
    { id: 'game-zone', label: 'Tetris Protocol' },
    { id: 'portfolio', label: 'Showcase' },
    { id: 'contact', label: 'Connect' }, // This ID should match the ID on LeadCaptureFormSection
  ];

  const handleLaunchProjectClick = () => {
    if (onLaunchProject) {
      onLaunchProject(true);
    }
    setIsOpen(false); 
  };

  return (
    <motion.nav
      ref={navRef}
      initial={{ y: -150 }} 
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "circOut", delay: 0.15 }}
      className="fixed top-0 left-0 right-0 z-50 glassmorphism shadow-lg pr-[var(--scrollbar-width,0px)]"
      style={{ boxSizing: 'border-box' }} 
    >
      <div className="container mx-auto px-5 sm:px-6 lg:px-10"> 
        <div className="flex items-center justify-between h-[var(--navbar-content-height-mobile,100px)] md:h-[var(--navbar-content-height-desktop,125px)]">
          <div className="flex items-center">
            <Link to="/" onClick={() => scrollToSection('hero')} className="flex-shrink-0 flex items-center">
              <img alt="Outwit Agency Logo - AI & Web Solutions" className="h-[84px] w-auto md:h-[108px]" src={logoUrl} /> 
            </Link>
          </div>
          
          <div className="hidden md:flex items-center"> 
            <div className="ml-8 flex items-center space-x-6">
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => scrollToSection(item.id)} 
                  className="text-foreground/80 hover:text-primary transition-colors duration-300 px-3 py-1.5 rounded-md text-sm font-medium font-['Space_Grotesk',_sans-serif] hover:drop-shadow-[0_0_5px_hsl(var(--primary)/0.5)]"
                >
                  {item.label}
                </button>
              ))}
            </div>
          
            <Button 
              onClick={handleLaunchProjectClick} 
              variant="default" 
              size="default" 
              className="ml-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 button-hover-glow font-['Space_Grotesk',_sans-serif] text-sm px-5 py-2"
            >
              <Zap className="mr-1.5 h-4 w-4" /> Launch Project 
            </Button>
          </div>
          <div className="-mr-2 flex md:hidden">
            <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-foreground/80 hover:text-primary focus:outline-none">
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="md:hidden glassmorphism border-t border-border/20"
            style={{ overflow: 'hidden' }}
          >
            <div className="px-5 pt-2 pb-3 space-y-1 sm:px-6"> 
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => scrollToSection(item.id)} 
                  className="text-foreground/80 hover:text-primary block px-3 py-2.5 rounded-md text-base font-medium w-full text-left font-['Space_Grotesk',_sans-serif] hover:bg-primary/10"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="pt-3 pb-3 border-t border-border/20">
              <div className="px-5 sm:px-6"> 
                  <Button 
                    onClick={handleLaunchProjectClick} 
                    variant="default" 
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-opacity duration-300 button-hover-glow font-['Space_Grotesk',_sans-serif] text-base py-3"
                  >
                    <Zap className="mr-2 h-4 w-4" /> Launch Project
                  </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
