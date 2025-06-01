import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Lightbulb, DraftingCompass, Code, Rocket, Settings } from 'lucide-react';

const titleAnimation = {
  initial: { opacity: 0, y: 30, filter: 'blur(5px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }
};

const accordionContainerAnimation = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.2,
    }
  },
  viewport: { once: true, amount: 0.1 }
};

const accordionItemAnimation = {
  initial: { opacity: 0, x: -70, filter: 'blur(6px)' },
  whileInView: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }
  }
};

const processSteps = [
  {
    id: 'step1',
    icon: <Lightbulb className="h-10 w-10" />,
    title: 'Discovery & Strategic Alignment',
    content: 'We initiate by deeply immersing ourselves in your vision, objectives, and unique challenges. Through collaborative workshops and meticulous market research, we architect a lucid strategy and a comprehensive project roadmap, ensuring perfect alignment and establishing a robust foundation for unparalleled success.',
    iconBaseColor: 'text-primary'
  },
  {
    id: 'step2',
    icon: <DraftingCompass className="h-10 w-10" />,
    title: 'Futuristic Design & Prototyping',
    content: 'Our visionary design collective transmutes strategy into highly intuitive user experiences and breathtaking visual interfaces. We construct interactive, high-fidelity prototypes to solicit early feedback, iteratively refining the user journey and interface aesthetics until they achieve a state of flawless perfection and user delight.',
    iconBaseColor: 'text-secondary'
  },
  {
    id: 'step3',
    icon: <Code className="h-10 w-10" />,
    title: 'Agile Development & Integration',
    content: 'Our elite developers materialize the designs utilizing avant-garde technologies and adaptive agile methodologies. We are committed to pristine, scalable codebases, resilient architectural frameworks, and frictionless integration with any pre-existing enterprise systems, ensuring future-proof solutions.',
    iconBaseColor: 'text-primary'
  },
  {
    id: 'step4',
    icon: <Settings className="h-10 w-10" />,
    title: 'Quantum Testing & Deployment',
    content: 'Exhaustive, multi-layered testing across diverse devices, platforms, and simulated extreme scenarios guarantees an impeccable and robust final product. We meticulously orchestrate the deployment sequence, ensuring a seamless launch experience and provide immediate post-launch hypercare to certify unwavering stability and performance.',
    iconBaseColor: 'text-secondary'
  },
  {
    id: 'step5',
    icon: <Rocket className="h-10 w-10" />,
    title: 'Launch & Iterative Growth',
    content: 'Our symbiotic partnership transcends the launch phase. We deliver continuous support, proactive performance telemetry, and data-driven optimization strategies to empower your digital solution to evolve, adapt, and consistently yield maximum strategic value and market impact.',
    iconBaseColor: 'text-primary'
  },
];

const ProcessSection = () => {
  const [openAccordionItem, setOpenAccordionItem] = React.useState(null);

  return (
    <section id="process" className="section-padding bg-background/70 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={titleAnimation}
          initial="initial"
          whileInView="whileInView"
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 font-['Space_Grotesk',_sans-serif] holographic-title" data-text="Development Process">
            Our Proven <span className="text-gradient">Development Process</span>
          </h2>
          <motion.p
            className="text-lg md:text-xl text-foreground/75 max-w-3xl mx-auto font-['Poppins',_sans-serif]"
            initial={{ opacity: 0, y:15 }}
            whileInView={{ opacity:1, y:0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: 0.35 }}
          >
            A transparent, iterative, and collaborative odyssey from conceptualization to impactful reality, guaranteeing supreme quality and measurable results at every juncture.
          </motion.p>
        </motion.div>

        <motion.div
          variants={accordionContainerAnimation}
          initial="initial"
          whileInView="whileInView"
          className="max-w-4xl mx-auto"
        >
          <Accordion 
            type="single" 
            collapsible 
            className="w-full space-y-6"
            value={openAccordionItem}
            onValueChange={setOpenAccordionItem}
          >
            {processSteps.map((step) => (
              <motion.div
                key={step.id}
                variants={accordionItemAnimation}
              >
                <AccordionItem
                  value={step.id}
                  className="border-border/40 rounded-lg glassmorphism p-3 shadow-lg hover:shadow-primary/20 transition-shadow duration-300 animated-border-card"
                >
                  <AccordionTrigger data-state={openAccordionItem === step.id ? 'open' : 'closed'}>
                    <div className="flex items-center w-full">
                      <motion.div
                        className="p-3 bg-primary/10 rounded-full mr-5 group-hover:bg-primary/20 transition-colors duration-300"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 10 }}
                      >
                        {React.cloneElement(step.icon, { className: `${step.iconBaseColor} group-hover:scale-110 transition-transform duration-300`})}
                      </motion.div>
                      <span className="font-semibold text-foreground transition-colors duration-300 font-['Space_Grotesk',_sans-serif]">
                        {step.title}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AnimatePresence initial={false}>
                    {openAccordionItem === step.id && (
                      <AccordionContent data-state="open">
                          {step.content}
                      </AccordionContent>
                    )}
                  </AnimatePresence>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default ProcessSection;