import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const HeadlineStatementSection = () => {
  const headlineText = "Pioneering Digital Transformation".split(" ");
  const subHeadlineText = "Where Innovation Meets Excellence".split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.3,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
    visible: { 
      opacity: 1, 
      y: 0, 
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 12, stiffness: 100 } 
    },
  };

  return (
    <section className="pt-8 md:pt-12 pb-20 md:pb-28 bg-transparent relative overflow-hidden"> {/* Reduced top padding */}
      <div className="absolute inset-0 opacity-20">
        {/* Optional subtle background pattern or texture */}
      </div>
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.h2 
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gradient font-['Space_Grotesk',_sans-serif]"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          {headlineText.map((word, index) => (
            <motion.span key={index} variants={wordVariants} className="inline-block mr-2 md:mr-3">
              {word}
            </motion.span>
          ))}
          <Sparkles className="inline-block ml-1 md:ml-2 h-8 w-8 md:h-10 md:w-10 text-primary animate-pulse-glow" />
        </motion.h2>
        
        <motion.p 
          className="text-xl md:text-2xl text-foreground/80 max-w-3xl mx-auto font-['Poppins',_sans-serif]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 + headlineText.length * 0.08, duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.5 }}
        >
          We bridge the gap between visionary ideas and tangible realities, crafting bespoke digital solutions that propel your business into the future.
        </motion.p>
      </div>
    </section>
  );
};

export default HeadlineStatementSection;