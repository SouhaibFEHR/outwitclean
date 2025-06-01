import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn('border-b border-border/50 last:border-b-0', className)} {...props} />
));
AccordionItem.displayName = 'AccordionItem';

const AccordionTrigger = React.forwardRef(({ className, children, 'data-state': dataState, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[state=open]:text-primary',
        className
      )}
      {...props}>
      {children}
      <motion.div
        initial={false}
        animate={{ rotate: dataState === 'open' ? 180 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <ChevronDown className={cn("h-5 w-5 shrink-0 transition-transform duration-200", dataState === 'open' && "text-primary")} />
      </motion.div>
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => {
  const contentVariants = {
    open: {
      opacity: 1,
      height: 'auto',
      y: 0,
      transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    },
    closed: {
      opacity: 0,
      height: 0,
      y: -10,
      transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
    }
  };

  return (
    <AccordionPrimitive.Content
      ref={ref}
      className="overflow-hidden text-sm"
      {...props}
    >
      <motion.div
        key="accordion-content-inner-motion"
        variants={contentVariants}
        initial="closed"
        animate={props['data-state'] === 'open' ? "open" : "closed"}
        className={cn('pb-4 pt-0', className)}
      >
        {children}
      </motion.div>
    </AccordionPrimitive.Content>
  );
});
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };