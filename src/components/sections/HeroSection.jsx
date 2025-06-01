import React, { useState, useEffect, useRef, Suspense } from 'react';
import { motion, useMotionValue, useTransform, useScroll } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, Zap, Brain, Code as CodeXml, BarChartBig, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const InteractiveAstronautScene = React.lazy(() => import('@/components/InteractiveAstronautScene'));

const HeroSection = () => {
  const { toast } = useToast();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  // Adjusted parallax effect: less movement for text, slightly more for overlay for depth
  const heroTextY = useTransform(scrollYProgress, [0, 1], ["0%", "3%"]); 
  const heroOverlayOpacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0, 0.05, 0.15, 0.25]); // More gradual opacity increase

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
     toast({
        title: "🚀 Mission Control Contact",
        description: "Proceeding to secure channel. Initiating contact sequence...",
        variant: "default",
        className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl"
      });
  };
  
  const textVariants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(2px)' }, // Added subtle blur
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.05, // Slightly faster stagger
        duration: 0.6, // Slightly longer duration for smoother appearance
        ease: [0.35, 0, 0.65, 1] // Smoother ease
      }
    })
  };

  const words = "Empowering The Future.".split(" ");
  const subWords = "Web, Apps & AI Solutions Redefined.".split(" ");

  return (
    <section 
      id="hero" 
      ref={heroRef} 
      className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden pt-16 sm:pt-20 md:pt-24 pb-8 sm:pb-12" // Added padding top/bottom
    >
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="w-full h-full bg-background flex items-center justify-center text-primary">Loading Interactive Scene...</div>}>
          <InteractiveAstronautScene />
        </Suspense>
      </div>
      
      <motion.div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: heroOverlayOpacity, zIndex: 1, mixBlendMode: 'multiply' }} 
      />

      <motion.div 
        className="relative z-10 p-4 md:p-6 flex flex-col items-center" // Ensure content is centered
        style={{ y: heroTextY }} 
        initial={{ opacity: 0, scale: 0.95 }} // Slightly less aggressive scale
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }} // Smoother, slightly longer transition
      >
        <motion.h1 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 sm:mb-6 font-['Space_Grotesk',_sans-serif] max-w-xs sm:max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl" // Added max-width for better text control
        >
          <span className="block text-gradient mb-2 md:mb-3 holographic-title">
            {words.map((word, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mr-2 md:mr-3" // Adjusted spacing
              >
                {word}
              </motion.span>
            ))}
          </span>
          <span className="block text-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight sm:leading-tight md:leading-tight lg:leading-tight"> {/* Ensured consistent leading */}
            {subWords.map((word, i) => (
              <motion.span
                key={i}
                custom={i + words.length} 
                variants={textVariants}
                initial="hidden"
                animate="visible"
                className="inline-block mr-1.5 md:mr-2 glitch-text-hover" // Adjusted spacing
                data-text={word}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </motion.h1>
        <motion.p 
          className="text-md sm:text-lg md:text-xl text-foreground/80 max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto mb-8 sm:mb-10 font-['Poppins',_sans-serif]" // Consistent max-width
          custom={words.length + subWords.length}
          variants={textVariants}
          initial="hidden"
          animate="visible"
        >
          Welcome to Outwit Agency: Where Tech Meets Tomorrow. We engineer intelligent, high-velocity digital experiences that redefine possibilities.
        </motion.p>
        
        <motion.div
            custom={words.length + subWords.length + 1}
            variants={textVariants}
            initial="hidden"
            animate="visible"
        >
            <Button 
              size="lg" 
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 shadow-lg hover:shadow-primary/40 button-hover-glow font-['Space_Grotesk',_sans-serif] pulsing-button" // Slightly adjusted padding
              onClick={scrollToContact}
            >
              <Sparkles className="mr-2 h-4 w-4 sm:mr-2.5 sm:h-5 sm:w-5" /> {/* Slightly smaller icons */}
              Launch Project
              <ArrowDown className="ml-2 h-4 w-4 sm:ml-2.5 sm:h-5 sm:w-5 animate-bounce" style={{animationDuration: '1.8s'}} /> {/* Slower bounce */}
            </Button>
        </motion.div>
        
        <div className="mt-10 sm:mt-12 flex flex-wrap justify-center items-center gap-x-5 gap-y-3 sm:gap-x-6 md:gap-x-8"> {/* Using gap for better spacing control */}
          {[
            { icon: <CodeXml size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />, label: "Web Solutions" }, // Adjusted icon sizes
            { icon: <Brain size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />, label: "AI Automation" },
            { icon: <BarChartBig size={22} className="sm:w-6 sm:h-6 md:w-7 md:h-7" />, label: "App Development" },
          ].map((item, index) => (
            <motion.div 
              key={index}
              className="flex flex-col items-center text-foreground/70 hover:text-primary transition-colors duration-200 group" // Faster transition
              custom={words.length + subWords.length + 2 + index}
              variants={textVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, scale: 1.03, filter: 'drop-shadow(0 0 5px hsl(var(--primary)/0.3))' }} // More subtle hover
            >
              {React.cloneElement(item.icon, { className: `mb-1 group-hover:filter group-hover:drop-shadow-[0_0_5px_hsl(var(--primary)/0.7)] transition-all duration-250 ${item.icon.props.className}` })}
              <span className="text-xs sm:text-sm font-['Poppins',_sans-serif]">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;