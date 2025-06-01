import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Code, Globe, BrainCircuit, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const titleAnimation = {
  initial: { opacity: 0, y: 25, filter: 'blur(4px)' }, // Softer entry
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.25 }, // Trigger sooner
  transition: { duration: 0.7, ease: [0.35, 0, 0.65, 1], delay: 0.05 } // Smoother ease, slightly less delay
};

const cardContainerAnimation = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.12, // Slightly faster stagger
    }
  },
  viewport: { once: true, amount: 0.15 } // Trigger sooner for container
};

const cardItemAnimation = {
  initial: { opacity: 0, y: 60, scale: 0.92, filter: 'blur(6px)' }, // Softer entry
  whileInView: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.3, 0, 0.6, 1] } // Smoother ease
  }
};


const services = [
  {
    icon: <Globe className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />, // Responsive icon size
    title: 'Website Development',
    description: 'Stunning, responsive websites that captivate your audience and drive engagement. Built for performance and scalability.',
    details: ['Custom Design & UX/UI', 'Advanced SEO Optimization', 'E-commerce & Marketplaces', 'CMS & Headless Solutions']
  },
  {
    icon: <Code className="h-10 w-10 md:h-12 md:w-12 text-secondary mb-3 md:mb-4" />,
    title: 'Web Application Development',
    description: 'Powerful, custom web applications tailored to your unique business needs. Secure, scalable, and feature-rich.',
    details: ['Enterprise SaaS Platforms', 'Bespoke Internal Tools', 'Real-time API Development', 'Cloud Architecture Design']
  },
  {
    icon: <BrainCircuit className="h-10 w-10 md:h-12 md:w-12 text-primary mb-3 md:mb-4" />,
    title: 'AI Automation Solutions',
    description: 'Intelligent automation to streamline your workflows, enhance decision-making, and unlock new efficiencies.',
    details: ['AI-Powered Process Automation (RPA)', 'Custom AI Chatbots & Assistants', 'Predictive Data Analysis & Insights', 'Machine Learning Model Deployment']
  },
];

const ServiceCard = ({ icon, title, description, details }) => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      variants={cardItemAnimation} 
      className="h-full animated-border-card" 
    >
      <Card className="h-full flex flex-col overflow-hidden transform transition-all duration-300 ease-out glassmorphism hover:border-transparent"> 
        <CardHeader className="items-center text-center p-6 md:p-8"> {/* Responsive padding */}
          <motion.div 
            className="p-4 md:p-5 bg-primary/10 rounded-full mb-4 md:mb-5 service-icon-hover relative overflow-hidden" // Responsive padding
            whileHover={{ scale: 1.1, rotate: 3 }} // Slightly less rotation
            transition={{ type: "spring", stiffness: 260, damping: 10 }} // Adjusted spring
          >
             {React.cloneElement(icon, { className: "h-10 w-10 md:h-12 md:w-12 text-primary z-10 relative" })} {/* Ensure this reflects actual icon size */}
             <motion.div 
                className="absolute inset-0 bg-primary rounded-full z-0"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 0, opacity: 0 }} 
                whileHover={{ scale: 1.5, opacity: 0.3 }} // Softer hover effect
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
             />
          </motion.div>
          <CardTitle className="text-gradient text-xl sm:text-2xl md:text-3xl font-['Space_Grotesk',_sans-serif] holographic-title" data-text={title}>{title}</CardTitle> {/* Responsive font size */}
          <CardDescription className="text-foreground/70 min-h-[50px] sm:min-h-[60px] font-['Poppins',_sans-serif] text-sm sm:text-base">{description}</CardDescription> {/* Responsive font size */}
        </CardHeader>
        <CardContent className="flex-grow px-6 md:px-8 pb-3 md:pb-4">  {/* Responsive padding */}
          <ul className="space-y-2.5 md:space-y-3 mb-5 md:mb-6"> {/* Responsive spacing */}
            {details.map((detail, i) => (
              <motion.li 
                key={i} 
                className="flex items-start text-xs sm:text-sm text-foreground/80 font-['Poppins',_sans-serif]" // Responsive font, items-start for long text
                initial={{ opacity: 0, x: -12 }} // Slightly less x offset
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }} // Trigger sooner
                transition={{ duration: 0.4, delay: i * 0.08 + 0.35 }} // Faster stagger and delay
              >
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4 mr-2.5 md:mr-3 text-secondary flex-shrink-0 mt-0.5" /> {/* Responsive icon size & margin, alignment fix */}
                {detail}
              </motion.li>
            ))}
          </ul>
        </CardContent>
        <div className="p-6 md:p-8 pt-0 mt-auto"> {/* Responsive padding */}
          <Button onClick={scrollToContact} variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors duration-250 button-hover-glow font-['Space_Grotesk',_sans-serif] text-base sm:text-lg py-2.5 sm:py-3"> {/* Faster transition, responsive padding/font */}
            Initiate Inquiry <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

const ServicesSection = () => {
  return (
    <section id="services" className="section-padding bg-background relative pb-12 md:pb-20"> {/* Adjusted padding */}
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-background via-background/70 to-transparent z-0 opacity-60"></div> {/* Softer opacity */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/70 to-transparent z-0 opacity-60"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={titleAnimation}
          initial="initial"
          whileInView="whileInView"
          className="text-center mb-16 md:mb-20" // Increased margin 
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-5 font-['Space_Grotesk',_sans-serif] holographic-title" data-text="Core Solutions"> {/* Responsive font size */}
            Our <span className="text-gradient">Core Solutions</span>
          </h2>
          <motion.p 
            className="text-lg md:text-xl text-foreground/70 max-w-2xl lg:max-w-3xl mx-auto font-['Poppins',_sans-serif]" // Responsive max-width
            initial={{ opacity: 0, y:12 }} // Slightly less y
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true, amount: 0.25 }} // Trigger sooner
            transition={{ duration: 0.5, delay: 0.3 }} // Faster delay
          >
            We architect and deploy a comprehensive suite of digital solutions, engineered to elevate your enterprise into its next evolutionary phase.
          </motion.p>
        </motion.div>
        <motion.div 
          variants={cardContainerAnimation}
          initial="initial"
          whileInView="whileInView"
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10" // Adjusted gap
        > 
          {services.map((service, index) => (
            <ServiceCard key={service.title} {...service} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;