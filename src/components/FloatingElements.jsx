import React, { useMemo } from 'react';

const NUM_STARS = 15; // Reduced for performance
const NUM_NEBULAE = 3; // Reduced
const NUM_GLOBAL_PARTICLES = 25; // Reduced slightly

const FloatingElements = () => {
  const elements = useMemo(() => {
    const items = [];

    // Hero Scene Stars
    for (let i = 0; i < NUM_STARS; i++) {
      const size = Math.random() * 1.8 + 0.4; // Slightly smaller range
      const duration = Math.random() * 35 + 30; // Slightly longer, slower
      const delay = Math.random() * 25;
      const startOpacity = Math.random() * 0.35 + 0.1; // More subtle

      const floatY = (Math.random() - 0.5) * 40; // Reduced float range
      const floatX = (Math.random() - 0.5) * 40;
      const rotationSpeed = (Math.random() - 0.5) * 8; // Slower rotation

      items.push({
        id: `star-${i}`,
        type: 'star',
        style: {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--delay': `${delay}s`,
          '--start-opacity': startOpacity,
          '--top': `${Math.random() * 100}%`,
          '--left': `${Math.random() * 100}%`,
          '--float-y': floatY,
          '--float-x': floatX,
          '--rotation-speed': rotationSpeed,
          '--start-scale': 1,
        },
      });
    }

    // Hero Scene Nebulae Wisps
    for (let i = 0; i < NUM_NEBULAE; i++) {
      const size = Math.random() * 110 + 60; // Slightly smaller
      const duration = Math.random() * 50 + 40; // Slower
      const delay = Math.random() * 30;
      const startOpacity = Math.random() * 0.03 + 0.01; // More subtle

      items.push({
        id: `nebula-${i}`,
        type: 'nebula',
        style: {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--delay': `${delay}s`,
          '--start-opacity': startOpacity,
          '--top': `${Math.random() * 100}%`,
          '--left': `${Math.random() * 100}%`,
          '--start-scale': Math.random() * 0.3 + 0.7, // Slightly reduced scale variation
          '--blur-start': `${Math.random() * 7 + 3.5}px`, // Slightly less blur
          '--blur-end': `${Math.random() * 3.5 + 1}px`,   
        },
      });
    }

    // Global Floating Particles
    for (let i = 0; i < NUM_GLOBAL_PARTICLES; i++) {
      const size = Math.random() * 1.3 + 0.3; // Even smaller
      const duration = Math.random() * 45 + 35; // Slower
      const delay = Math.random() * 35;
      const startOpacity = Math.random() * 0.15 + 0.03; // Even more subtle

      items.push({
        id: `global-particle-${i}`,
        type: 'global-particle',
        style: {
          '--particle-size': `${size}px`,
          '--particle-duration': `${duration}s`,
          '--particle-delay': `${delay}s`,
          '--start-opacity': startOpacity,
          '--start-x': `${Math.random() * 100}vw`,
          '--start-y': `${Math.random() * 100}vh`,
          '--end-x': `${Math.random() * 100}vw`,
          '--end-y': `${Math.random() * 100}vh`,
          '--particle-scale': Math.random() * 0.4 + 0.4, // Smaller scale
        }
      });
    }


    return items;
  }, []);

  return (
    <div className="floating-element-container">
      {elements.map(el => {
        if (el.type === 'global-particle') {
          return (
            <div
              key={el.id}
              className="global-floating-particle"
              style={{
                width: el.style['--particle-size'],
                height: el.style['--particle-size'],
                animationDuration: el.style['--particle-duration'],
                animationDelay: el.style['--particle-delay'],
                ...el.style
              }}
            />
          );
        }
        return (
          <div 
            key={el.id} 
            className={el.type === 'star' ? 'floating-star-subtle' : 'floating-nebula-wisp'} 
            style={el.style} 
          />
        );
      })}
    </div>
  );
};

export default FloatingElements;