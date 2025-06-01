import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient.js';

const ContactWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const leadData = { 
      name: formData.name, 
      email: formData.email, 
      message: `QUICK WIDGET: ${formData.message}`,
      project_type: 'Quick Inquiry',
      submitted_at: new Date().toISOString(), // Add timestamp
    };

    try {
      const { error: dbError } = await supabase
        .from('leads')
        .insert([leadData]);

      if (dbError) {
        throw dbError;
      }

      toast({
        title: 'Quick Message Sent!',
        description: "We've received your inquiry and will get back to you soon.",
        className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl",
      });
      
      // Invoke Edge Function to send email AFTER successful DB insert
      const { data: emailSendData, error: emailSendError } = await supabase.functions.invoke('send-contact-email', {
        body: JSON.stringify(leadData)
      });

      if (emailSendError) {
        console.error('Error sending notification email via Edge Function:', emailSendError);
        // Optionally inform user if email notification failed, but primary action (DB save) was successful
        toast({
          title: 'Message Saved, Notification Issue',
          description: "Your message is saved, but we couldn't send an immediate email alert. We'll still get it!",
          variant: 'default', // Not destructive, as lead is saved
        });
      } else {
        console.log('Email notification sent successfully via Edge Function:', emailSendData);
      }

      setFormData({ name: '', email: '', message: '' });
      setIsOpen(false);

    } catch (error) {
      console.error('Error in quick lead submission process:', error);
      toast({
        title: 'Uh oh! Message Error.',
        description: 'There was a problem sending your message. Please try again or use the main contact form.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-[60]"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, duration: 0.5, type: 'spring' }}
      >
        <Button
          size="lg"
          className="rounded-full p-4 shadow-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 w-16 h-16 button-hover-glow"
          onClick={toggleOpen}
          aria-label={isOpen ? "Close contact widget" : "Open contact widget"}
        >
          {isOpen ? <X size={32} /> : <MessageSquare size={32} />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-24 right-6 z-[55] w-[calc(100vw-3rem)] max-w-sm p-6 rounded-xl shadow-2xl glassmorphism"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gradient">Quick Contact</h3>
              <Button variant="ghost" size="icon" onClick={toggleOpen} className="text-muted-foreground hover:text-primary">
                <X size={20} />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="widget-name" className="text-sm text-foreground/80">Name</Label>
                <Input id="widget-name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Your Name" required className="mt-1 bg-background/50 border-border/50 focus:border-primary" />
              </div>
              <div>
                <Label htmlFor="widget-email" className="text-sm text-foreground/80">Email</Label>
                <Input id="widget-email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Your Email" required className="mt-1 bg-background/50 border-border/50 focus:border-primary" />
              </div>
              <div>
                <Label htmlFor="widget-message" className="text-sm text-foreground/80">Message</Label>
                <Textarea id="widget-message" name="message" value={formData.message} onChange={handleChange} placeholder="How can we help?" required rows={3} className="mt-1 bg-background/50 border-border/50 focus:border-primary" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 button-hover-glow">
                {isSubmitting ? 'Sending...' : <><Send size={16} className="mr-2" /> Send Quick Message</>}
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Or <button onClick={scrollToContact} className="underline hover:text-primary">schedule a detailed consultation</button>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ContactWidget;
