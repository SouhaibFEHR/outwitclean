import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Brain, Code, Palette, Search, BarChartBig, Users, Zap, Lightbulb, Target, Cpu, Layers, TrendingUp, Rocket } from 'lucide-react';

const astronautHeadImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/ac44c519d88093efa921ab1f0e0ba2b2.png";

const baseIconSize = 28; // Base size for mobile
const iconPadding = 'p-3 md:p-4'; // Adjusted padding

const elementsData = [
  { id: 'ai', icon: Brain, label: 'AI Solutions', color: 'hsl(var(--primary))', initialPosDesktop: { x: -220, y: -110 }, initialPosMobile: { x: -100, y: -70 } },
  { id: 'web', icon: Palette, label: 'Website Design', color: 'hsl(var(--secondary))', initialPosDesktop: { x: 220, y: -80 }, initialPosMobile: { x: 100, y: -60 } },
  { id: 'code', icon: Code, label: 'Coding & Dev', color: 'hsl(var(--primary))', initialPosDesktop: { x: -160, y: 180 }, initialPosMobile: { x: -80, y: 100 } },
  { id: 'marketing', icon: BarChartBig, label: 'Digital Marketing', color: 'hsl(var(--secondary))', initialPosDesktop: { x: 180, y: 160 }, initialPosMobile: { x: 90, y: 90 } },
  { id: 'seo', icon: Search, label: 'SEO Optimization', color: 'hsl(var(--primary))', initialPosDesktop: { x: -90, y: -230 }, initialPosMobile: { x: -50, y: -130 } },
  { id: 'crm', icon: Users, label: 'CRM Systems', color: 'hsl(var(--secondary))', initialPosDesktop: { x: 90, y: -250 }, initialPosMobile: { x: 50, y: -140 } },
  { id: 'innovation', icon: Lightbulb, label: 'Innovation Hub', color: 'hsl(var(--primary))', initialPosDesktop: { x: 250, y: 50 }, initialPosMobile: { x: 110, y: 30 } },
  { id: 'strategy', icon: Target, label: 'Digital Strategy', color: 'hsl(var(--secondary))', initialPosDesktop: { x: -250, y: 60 }, initialPosMobile: { x: -110, y: 40 } },
  { id: 'automation', icon: Zap, label: 'Automation', color: 'hsl(var(--primary))', initialPosDesktop: { x: 0, y: 240 }, initialPosMobile: { x: 0, y: 130 } },
  { id: 'processing', icon: Cpu, label: 'Advanced Processing', color: 'hsl(var(--secondary))', initialPosDesktop: { x: 140, y: -190 }, initialPosMobile: { x: 70, y: -110 } },
  { id: 'designstack', icon: Layers, label: 'Full-Stack Design', color: 'hsl(var(--primary))', initialPosDesktop: { x: -140, y: -170 }, initialPosMobile: { x: -70, y: -100 } },
  { id: 'growth', icon: TrendingUp, label: 'Growth Hacking', color: 'hsl(var(--secondary))', initialPosDesktop: { x: 0, y: -270 }, initialPosMobile: { x: 0, y: -150 } },
  { id: 'launch', icon: Rocket, label: 'Product Launch', color: 'hsl(var(--primary))', initialPosDesktop: { x: 190, y: 190 }, initialPosMobile: { x: 95, y: 105 } },
];


const InteractiveAstronautScene = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const sceneRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentIconSize, setCurrentIconSize] = useState(baseIconSize);


  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setCurrentIconSize(mobile ? baseIconSize : baseIconSize * 1.3);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  const { scrollYProgress } = useScroll({
    target: sceneRef, 
    offset: ["start start", "end start"], 
  });

  const astronautOpacity = useTransform(scrollYProgress, [0, 0.2, 0.4], [1, 0.8, 0]); 
  const astronautY = useTransform(scrollYProgress, [0, 0.4], ["0%", "-60%"]); 

  const getInitialPos = (elData) => isMobile ? elData.initialPosMobile : elData.initialPosDesktop;
  const getDragConstraints = () => isMobile 
    ? { left: -120, right: 120, top: -150, bottom: 150 } 
    : { left: -280, right: 280, top: -230, bottom: 230 };
  const getIconDragConstraints = () => isMobile
    ? { left: -150, right: 150, top: -180, bottom: 180 }
    : { left: -340, right: 340, top: -290, bottom: 290 };

  return (
    <div ref={sceneRef} className="relative w-full h-[550px] sm:h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: `
                radial-gradient(ellipse at 50% 30%, hsl(var(--primary)/0.06) 0%, transparent 55%),
                radial-gradient(ellipse at 20% 70%, hsl(var(--secondary)/0.06) 0%, transparent 55%),
                radial-gradient(ellipse at 80% 70%, hsl(var(--accent)/0.04) 0%, transparent 55%),
                radial-gradient(ellipse at center, hsl(var(--background)/0.5) 0%, hsl(var(--background)) 70%)
            `,
            backgroundBlendMode: 'screen',
            filter: 'blur(4px)',
        }}
      />
      
      <motion.div
        style={{ opacity: astronautOpacity, y: astronautY }} 
        className="relative z-20" 
      >
        <motion.div 
          drag 
          dragConstraints={getDragConstraints()}
          dragElastic={0.1} // Slightly more elastic
          dragTransition={{ bounceStiffness: 180, bounceDamping: 20 }} // Adjusted bounce
          className="cursor-grab active:cursor-grabbing"
          whileHover={{ scale: 1.1, filter: 'drop-shadow(0 0 15px hsl(var(--primary)/0.7))' }} // Softer glow
          transition={{ type: 'spring', stiffness: 120, damping: 12, mass: 0.7 }}
           animate={{ 
            y: ["0%", "-2.5%", "0%", "2.5%", "0%"], // More subtle float
            rotate: [0, 0.8, 0, -0.8, 0], // More subtle rotation
          }}
           whileTap={{ scale: 1.05, filter: 'drop-shadow(0 0 12px hsl(var(--primary)/0.6))' }}
        >
          <img src={astronautHeadImageUrl} alt="Floating Astronaut Head" className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain" />
        </motion.div>
      </motion.div>

      {elementsData.map((elData, index) => {
        const initialPos = getInitialPos(elData);
        const IconComponent = elData.icon;
        return (
          <motion.div
            key={elData.id}
            className={`absolute z-10 ${iconPadding} bg-card/60 backdrop-blur-md rounded-full shadow-xl flex items-center justify-center cursor-pointer`} // Reduced shadow, adjusted blur/opacity
            style={{ 
              '--glow-color': elData.color,
              color: elData.color,
            }}
            initial={{ 
              x: initialPos.x + (Math.random() - 0.5) * (isMobile ? 30 : 60), 
              y: initialPos.y + (Math.random() - 0.5) * (isMobile ? 30 : 60),
              scale: 0.4, 
              opacity: 0.3
            }}
            animate={{ 
              x: [
                initialPos.x, 
                initialPos.x + Math.cos(index * Math.PI / (elementsData.length / 2) + Math.PI/4) * ( (isMobile ? 25 : 45) + index * 1), 
                initialPos.x + Math.cos(index * Math.PI / (elementsData.length / 2) + Math.PI/2) * ( (isMobile ? 20 : 35) + index * 0.7),
                initialPos.x + Math.cos(index * Math.PI / (elementsData.length / 2) + 3*Math.PI/4) * ( (isMobile ? 25 : 45) + index * 1),
                initialPos.x,
              ],
              y: [
                initialPos.y,
                initialPos.y + Math.sin(index * Math.PI / (elementsData.length / 2) + Math.PI/4) * ( (isMobile ? 25 : 45) + index * 1), 
                initialPos.y + Math.sin(index * Math.PI / (elementsData.length / 2) + Math.PI/2) * ( (isMobile ? 20 : 35) + index * 0.7),
                initialPos.y + Math.sin(index * Math.PI / (elementsData.length / 2) + 3*Math.PI/4) * ( (isMobile ? 25 : 45) + index * 1),
                initialPos.y,
              ],
              rotate: [0, 3 - index * 0.2, 0, -(3 - index * 0.2), 0], // Slightly reduced rotation
            }}
            transition={{
              duration: 28 + Math.random() * 22 + index * 0.25, // Slower, more varied duration
              repeat: Infinity,
              repeatType: 'mirror', 
              ease: 'linear', // Changed to linear for smoother continuous motion
              delay: index * 0.35, 
            }}
            whileHover={{ 
              scale: 1.3, 
              rotate: 15, 
              zIndex: 30,
              boxShadow: '0 0 30px var(--glow-color)', // Slightly softer hover shadow
              transition: { duration: 0.1, ease: "circOut" } 
            }}
            onHoverStart={() => setActiveTooltip(elData.id)}
            onHoverEnd={() => setActiveTooltip(null)}
            onClick={() => setActiveTooltip(elData.id)} 
            drag 
            dragConstraints={getIconDragConstraints()}
            dragElastic={0.1} // Slightly more elastic
          >
            <IconComponent size={currentIconSize} />
            {activeTooltip === elData.id && (
              <motion.span
                initial={{ opacity: 0, y: 10 }} // Start further down
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }} // Faster tooltip transition
                className="absolute bottom-full mb-2.5 px-2.5 py-1 text-xs sm:text-sm bg-foreground text-background rounded-md shadow-lg whitespace-nowrap" // Adjusted padding/margin
              >
                {elData.label}
              </motion.span>
            )}
          </motion.div>
        );
      })}
       <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, hsl(var(--primary)/0.2) 0%, transparent 65%)`, // Reduced intensity and size
          filter: 'blur(60px)', 
          transform: 'scale(1.6)' // Reduced scale
        }}
      />
    </div>
  );
};

export default InteractiveAstronautScene;