import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import ContactWidget from '@/components/ContactWidget';
import { motion, AnimatePresence } from 'framer-motion';
import CursorTrail from '@/components/CursorTrail'; 
import StardustBackground from '@/components/StardustBackground';

const FloatingElements = React.lazy(() => import('@/components/FloatingElements.jsx'));


const pageVariants = {
  initial: { opacity: 0, y: 15, filter: 'blur(3px)' }, // Softer blur, less y offset
  in: { opacity: 1, y: 0, filter: 'blur(0px)' },
  out: { opacity: 0, y: -15, filter: 'blur(3px)' }, // Softer blur, less y offset
};

const pageTransition = {
  type: 'tween', 
  ease: [0.35, 0, 0.65, 1], // Smoother ease
  duration: 0.45, // Slightly faster
};

const Layout = ({ onLaunchProject }) => {
  const location = useLocation();
  const [navbarHeight, setNavbarHeight] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Set isClient to true once component mounts
  }, []);

  const updateLayoutValues = useCallback(() => {
    if (typeof window !== 'undefined') {
      const currentNavbarHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 0;
      setNavbarHeight(currentNavbarHeight);

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      
      // Only apply paddingRight if scrollbar is present and not on mobile where it might be an overlay
      if (scrollbarWidth > 0 && window.innerWidth > 768) { 
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      } else {
        document.body.style.paddingRight = '0px';
      }
      // Keep overflowX hidden to prevent horizontal scroll, unless specifically needed for a component
      document.body.style.overflowX = 'hidden'; 
    }
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run listeners on SSR

    updateLayoutValues();
    
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const newHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 0;
          if (newHeight !== navbarHeight) {
             updateLayoutValues();
          }
          break; 
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    window.addEventListener('resize', updateLayoutValues);
    // Removed scroll listener for navbarHeight, as it's unlikely to change on scroll and can be perf intensive
    // window.addEventListener('scroll', updateLayoutValues, { passive: true }); 


    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateLayoutValues);
      // window.removeEventListener('scroll', updateLayoutValues);
       if (typeof window !== 'undefined') {
         document.body.style.paddingRight = '0px';
         document.body.style.overflowX = 'auto'; // Revert to auto on cleanup
       }
    };
  }, [updateLayoutValues, navbarHeight, isClient]);

  return (
    <div className="flex flex-col min-h-screen relative bg-background text-foreground"> 
      {isClient && <StardustBackground particleCount={50} /> } 
      {isClient && <CursorTrail />}
      <Suspense fallback={null}>
        {isClient && <FloatingElements />}
      </Suspense>
      <Navbar onLaunchProject={onLaunchProject} /> 
      <motion.main 
        className="flex-grow relative z-10" 
        style={{ paddingTop: `${navbarHeight}px` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            style={{ width: '100%' }} 
          >
            <Suspense fallback={<div className="flex justify-center items-center min-h-[calc(100vh-10rem)] text-lg text-primary">Loading Stellar Content...</div>}>
              <Outlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </motion.main>
      {isClient && <ContactWidget />}
      <Footer /> 
      <Toaster />
    </div>
  );
};

export default Layout;