import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const StardustParticle = ({ x, y, size, duration, delay, opacity }) => {
  const particleVariants = {
    initial: {
      x: Math.random() * 100 + 'vw', 
      y: Math.random() * 100 + 'vh', 
      opacity: 0,
      scale: Math.random() * 0.4 + 0.3, // Slightly larger base scale
    },
    animate: {
      x: [x, Math.random() * 100 + 'vw', x], 
      y: [y, Math.random() * 100 + 'vh', y], 
      opacity: [0, opacity, opacity * 0.7, opacity * 0.4, 0], // Smoother opacity curve
      scale: [0.3, 0.9, 1, 0.7, 0.3], // Smoother scale curve
      transition: {
        duration: duration,
        delay: delay,
        repeat: Infinity,
        repeatType: 'loop',
        ease: [0.42, 0, 0.58, 1], // Custom ease for smoother flow
      },
    },
  };

  return (
    <motion.div
      className="stardust-particle"
      style={{
        width: size,
        height: size,
        position: 'fixed', 
        borderRadius: '50%',
        backgroundColor: `hsla(var(--primary-rgb), ${opacity * 0.5})`, // Softer base color
        // Softer, more spread out shadow for a "glow" rather than distinct edges
        boxShadow: `0 0 ${size * 2.5}px hsla(var(--primary-rgb), ${opacity * 0.3}), 0 0 ${size * 5}px hsla(var(--secondary-rgb), ${opacity * 0.15})`,
        zIndex: -10, 
      }}
      variants={particleVariants}
      initial="initial"
      animate="animate"
    />
  );
};

const StardustBackground = ({ particleCount = 50 }) => { // Reduced default count
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: particleCount }).map((_, i) => ({
      id: i,
      x: Math.random() * 100 + 'vw',
      y: Math.random() * 100 + 'vh',
      size: Math.random() * 1.8 + 0.4, // Smaller max size
      duration: Math.random() * 30 + 30, // Increased min duration, slightly slower
      delay: Math.random() * 20, // Wider delay range for more variation
      opacity: Math.random() * 0.2 + 0.03, // More subtle opacity
    }));
  }, [particleCount]);

  if (!isClient) {
    return null; // Don't render on server
  }

  return (
    <div className="stardust-background-container fixed inset-0 pointer-events-none" aria-hidden="true">
      {particles.map(particle => (
        <StardustParticle
          key={particle.id}
          x={particle.x}
          y={particle.y}
          size={particle.size}
          duration={particle.duration}
          delay={particle.delay}
          opacity={particle.opacity}
        />
      ))}
    </div>
  );
};

export default StardustBackground;