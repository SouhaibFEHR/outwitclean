import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, Zap, Award, Briefcase, Smile } from 'lucide-react';

const titleAnimation = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6, ease: "easeOut", delay: 0.1 } 
};

const cardItemAnimation = {
  initial: { opacity: 0, y: 50, scale: 0.9, filter: 'blur(5px)' },
  whileInView: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: "easeOut" }
};

const Counter = ({ to, label, icon }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.5, triggerOnce: true }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);


  React.useEffect(() => {
    let interval;
    if (isInView && count < to) {
      interval = setInterval(() => {
        setCount(prevCount => {
          const increment = Math.max(1, Math.ceil((to - prevCount) / 15)); 
          const next = prevCount + increment;
          return next >= to ? to : next;
        });
      }, 60); 
    }
    if (count >= to) {
        clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isInView, count, to]);

  return (
    <motion.div 
      ref={ref}
      className="text-center p-6 glassmorphism rounded-lg animated-border-card group" 
      variants={cardItemAnimation}
    >
      {icon && React.cloneElement(icon, { className: "h-12 w-12 text-primary group-hover:text-foreground transition-colors duration-300 mx-auto mb-3" })}
      <p className="text-4xl font-bold text-gradient group-hover:text-foreground group-hover:bg-none transition-colors duration-300">{count}{label.includes("Years") ? "" : "+"}</p>
      <p className="text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300">{label}</p>
    </motion.div>
  );
};

const AboutSection = () => {
  const storyElements = [
    { 
      icon: <Target className="h-10 w-10 text-primary mr-4 flex-shrink-0 group-hover:text-foreground transition-colors duration-300" />, 
      title: "Our Mission", 
      text: "To empower businesses with transformative digital solutions, driving innovation and growth through cutting-edge technology and creative excellence." 
    },
    { 
      icon: <Zap className="h-10 w-10 text-secondary mr-4 flex-shrink-0 group-hover:text-foreground transition-colors duration-300" />, 
      title: "Our Values", 
      text: "Innovation, Collaboration, Integrity, Client-Centricity, and a Relentless Pursuit of Quality. These principles guide every project and interaction." 
    },
    { 
      icon: <Users className="h-10 w-10 text-primary mr-4 flex-shrink-0 group-hover:text-foreground transition-colors duration-300" />, 
      title: "Our Journey", 
      text: "Founded by passionate tech enthusiasts, Outwit Agency has rapidly grown into a trusted partner for businesses seeking to navigate the complexities of the digital landscape. We thrive on challenges and celebrate shared successes." 
    },
  ];

  return (
    <section id="about" className="section-padding bg-background/70 backdrop-blur-md relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={titleAnimation}
          initial="initial"
          whileInView="whileInView"
          viewport={titleAnimation.viewport}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Meet <span className="text-gradient">Outwit Agency</span>
          </h2>
          <motion.p 
            className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto"
            initial={{ opacity: 0, y:10 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true, amount: 0.3}}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            We are a passionate team of designers, developers, and strategists dedicated to crafting exceptional digital experiences.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-16"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.15 }}
        >
          {storyElements.map((item, index) => (
            <motion.div
              key={index}
              variants={cardItemAnimation}
              transition={{ ...cardItemAnimation.transition, delay: index * 0.1 }}
              className="p-6 rounded-lg glassmorphism flex items-start animated-border-card group" 
            >
              {item.icon}
              <div>
                <motion.h3 
                  variants={titleAnimation} 
                  transition={{...titleAnimation.transition, delay: 0.05}} 
                  className="text-2xl font-semibold text-foreground mb-2 group-hover:text-foreground transition-colors duration-300"
                >
                  {item.title}
                </motion.h3>
                <motion.p 
                  className="text-foreground/80 group-hover:text-foreground/90 transition-colors duration-300"
                  initial={{ opacity:0, y:10 }}
                  whileInView={{ opacity:1, y:0 }}
                  viewport={{ once:true, amount:0.5 }}
                  transition={{ duration:0.4, delay:0.15 }} 
                >
                  {item.text}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true, amount: 0.1 }}
          transition={{ staggerChildren: 0.15 }}
        >
          <Counter to={50} label="Projects Delivered" icon={<Briefcase />} />
          <Counter to={30} label="Happy Clients" icon={<Smile />} />
          <Counter to={5} label="Years of Experience" icon={<Award />} />
        </motion.div>

        <motion.div
          variants={cardItemAnimation} 
          initial="initial"
          whileInView="whileInView"
          className="mt-16 text-center group" 
        >
          <div className="max-w-4xl mx-auto p-8 glassmorphism-deep rounded-lg animated-border-card"> 
            <motion.h3 
              variants={titleAnimation}
              className="text-3xl font-semibold text-gradient mb-4 group-hover:text-foreground group-hover:bg-none transition-colors duration-300"
            >
              Our Commitment to Excellence
            </motion.h3>
            <motion.p 
              className="text-lg text-foreground/80 group-hover:text-foreground/90 transition-colors duration-300"
              initial={{ opacity:0, y:10 }}
              whileInView={{ opacity:1, y:0 }}
              viewport={{ once:true, amount:0.5 }}
              transition={{ duration:0.5, delay:0.2 }}
            >
              At Outwit Agency, every line of code, every pixel, and every strategy is crafted with precision and passion. 
              We believe in building not just solutions, but lasting partnerships that drive sustainable growth and innovation. 
              Our agile approach ensures we adapt to your needs, delivering impactful results that resonate with your audience.
            </motion.p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AboutSection;