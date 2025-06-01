import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarDays, Video } from 'lucide-react';

const MeetingSchedulingSection = () => {
  // In a real app, this would integrate with a service like Calendly or a custom backend.
  // For now, it's a placeholder.
  const handleScheduleMeeting = () => {
    // Placeholder action, e.g., open a modal or redirect to a scheduling link
    alert("Meeting scheduling feature coming soon! This would typically open an embedded calendar or redirect to a scheduling service like Calendly.");
  };

  return (
    <section id="schedule-meeting" className="section-padding bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Ready to Discuss Your Project <span className="text-gradient">in Detail?</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
            Book a free consultation call with our experts. Let's explore how we can help you achieve your goals.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-md mx-auto p-8 rounded-xl shadow-2xl glassmorphism text-center"
        >
          <CalendarDays className="h-16 w-16 text-primary mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-foreground mb-3">Schedule Your Free Consultation</h3>
          <p className="text-foreground/80 mb-8">
            Pick a time that works for you. We're excited to hear about your ideas!
          </p>
          <Button 
            size="lg" 
            onClick={handleScheduleMeeting} 
            className="w-full text-lg py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity duration-300 animate-pulse-glow"
          >
            <Video className="mr-2 h-5 w-5" />
            Book a Meeting
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            (This is a placeholder. Full scheduling integration coming soon!)
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default MeetingSchedulingSection;