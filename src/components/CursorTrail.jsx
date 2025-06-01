import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NUM_TRAIL_PARTICLES = 25; // Reduced for subtlety
const PARTICLE_LIFESPAN = 700; // Slightly shorter for a quicker fade
const PARTICLE_GENERATION_INTERVAL = 40; // Slightly slower generation

const CursorTrail = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [trail, setTrail] = useState([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Ensure this runs only on the client
    const updateMousePosition = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  useEffect(() => {
    if (!isClient) return; // Don't run particle generation on SSR

    const interval = setInterval(() => {
      setTrail((prevTrail) => {
        const newParticle = {
          id: Date.now() + Math.random(),
          x: mousePosition.x,
          y: mousePosition.y,
          size: Math.random() * 6 + 3, // Particle size between 3px and 9px (smaller)
          createdAt: Date.now(),
          rotation: Math.random() * 180 - 90, // Reduced rotation range
        };
        const updatedTrail = [...prevTrail, newParticle];
        const filteredTrail = updatedTrail.filter(p => Date.now() - p.createdAt < PARTICLE_LIFESPAN);
        return filteredTrail.slice(-NUM_TRAIL_PARTICLES);
      });
    }, PARTICLE_GENERATION_INTERVAL); 

    return () => clearInterval(interval);
  }, [mousePosition, isClient]);

  if (!isClient) {
    return null; // Don't render anything on the server
  }

  return (
    <>
      <motion.div
        className="cursor-dot-main" 
        style={{
          x: mousePosition.x,
          y: mousePosition.y,
        }}
        transition={{ type: 'spring', stiffness: 800, damping: 50, mass: 0.6 }} // Slightly stiffer spring
      />
      
      <AnimatePresence>
        {trail.map((particle) => (
          <motion.div
            key={particle.id}
            className="cursor-trail-particle-enhanced"
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0.8, // Start slightly less opaque
              scale: 1,
              width: particle.size,
              height: particle.size,
              rotate: particle.rotation,
            }}
            animate={{
              x: particle.x + (Math.random() - 0.5) * 20, // Less spread
              y: particle.y + (Math.random() - 0.5) * 20, // Less spread
              opacity: 0,
              scale: 0.2, // Smaller end scale
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: PARTICLE_LIFESPAN / 1000, ease: 'easeOut' }} // Changed ease to easeOut
          />
        ))}
      </AnimatePresence>
    </>
  );
};

export default CursorTrail;