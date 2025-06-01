import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Send, Briefcase, User, Mail, Building, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient.js';

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, duration: 0.5 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const timeSlots = [
  "09:00 AM - 09:30 AM", "09:30 AM - 10:00 AM",
  "10:00 AM - 10:30 AM", "10:30 AM - 11:00 AM",
  "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
  "01:00 PM - 01:30 PM", "01:30 PM - 02:00 PM",
  "02:00 PM - 02:30 PM", "02:30 PM - 03:00 PM",
  "03:00 PM - 03:30 PM", "03:30 PM - 04:00 PM",
];

const LeadCaptureFormSection = () => {
  const [formData, setFormData] = useState({
    name: '', // Your Name -> name
    email: '', // Email Address -> email
    companyName: '', // Company Name (Optional) -> company_name
    serviceType: '', // Select Service Type -> service_type
    projectDetails: '', // Project Details / Questions -> project_details
    meetingDate: null, // Pick a Date -> meeting_date
    meetingTime: '', // Select a Time Slot -> meeting_time
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const today = new Date(2025, 5, 1); // June 1st, 2025

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, meetingDate: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.meetingDate || !formData.meetingTime) {
      toast({
        title: 'Missing Information',
        description: 'Please select a meeting date and time.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }
    
    const meetingData = {
      name: formData.name,
      email: formData.email,
      company_name: formData.companyName,
      service_type: formData.serviceType, // Mapped from serviceType
      project_details: formData.projectDetails, // Mapped from projectDetails
      meeting_date: format(formData.meetingDate, 'yyyy-MM-dd'),
      meeting_time: formData.meetingTime,
      status: 'pending',
    };

    try {
      const { error: meetingError } = await supabase
        .from('meetings')
        .insert([meetingData]);

      if (meetingError) throw meetingError;

      toast({
        title: '🚀 Meeting Scheduled!',
        description: "We've received your booking request and will confirm shortly.",
        className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl",
      });
      
      sessionStorage.setItem('quoteFormSubmitted', 'true'); 

      setFormData({
        name: '', email: '', companyName: '', serviceType: '', projectDetails: '',
        meetingDate: null, meetingTime: ''
      });

    } catch (error) {
      console.error('Error submitting meeting request:', error);
      toast({
        title: 'Uh oh! Booking Error.',
        description: error.message || 'There was a problem scheduling your meeting. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <section id="contact" className="section-padding bg-gradient-to-br from-background via-background/90 to-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient font-['Space_Grotesk',_sans-serif]">
            Schedule Your Discovery Call
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-['Poppins',_sans-serif]">
            Ready to discuss your project? Pick a date and time that works for you. Let's build something amazing together!
          </p>
        </motion.div>

        <motion.form
          variants={formVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          onSubmit={handleSubmit}
          className="max-w-2xl mx-auto space-y-6 p-6 md:p-8 rounded-xl shadow-2xl glassmorphism animated-border-card"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Label htmlFor="name" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
                <User size={16} className="mr-2 text-primary" /> Your Name
              </Label>
              <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} placeholder="e.g., Ada Lovelace" required className="bg-background/60 border-border/50 focus:border-primary"/>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="email" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
                <Mail size={16} className="mr-2 text-primary" /> Email Address
              </Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="e.g., ada@example.com" required className="bg-background/60 border-border/50 focus:border-primary"/>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="companyName" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
              <Building size={16} className="mr-2 text-primary" /> Company Name (Optional)
            </Label>
            <Input id="companyName" name="companyName" type="text" value={formData.companyName} onChange={handleChange} placeholder="e.g., Innovate Corp" className="bg-background/60 border-border/50 focus:border-primary"/>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Label htmlFor="serviceType" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
              <Briefcase size={16} className="mr-2 text-primary" /> Select Service Type
            </Label>
            <Select name="serviceType" onValueChange={(value) => handleSelectChange('serviceType', value)} value={formData.serviceType}>
              <SelectTrigger className="w-full bg-background/60 border-border/50 focus:ring-primary">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border shadow-xl">
                <SelectItem value="Web Development">Web Development</SelectItem>
                <SelectItem value="App Development">App Development</SelectItem>
                <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                <SelectItem value="AI Integration">AI Integration</SelectItem>
                <SelectItem value="Consultation">Consultation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div variants={itemVariants}>
              <Label htmlFor="meetingDate" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
                <CalendarIcon size={16} className="mr-2 text-primary" /> Pick a Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background/60 border-border/50 hover:bg-accent/50",
                      !formData.meetingDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.meetingDate ? format(formData.meetingDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.meetingDate}
                    onSelect={handleDateChange}
                    initialFocus
                    fromDate={today} 
                  />
                </PopoverContent>
              </Popover>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Label htmlFor="meetingTime" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
                <Clock size={16} className="mr-2 text-primary" /> Select a Time Slot
              </Label>
              <Select name="meetingTime" onValueChange={(value) => handleSelectChange('meetingTime', value)} value={formData.meetingTime}>
                <SelectTrigger className="w-full bg-background/60 border-border/50 focus:ring-primary">
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border shadow-xl max-h-60">
                  {timeSlots.map(slot => (
                    <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <Label htmlFor="projectDetails" className="flex items-center text-sm font-medium text-foreground/80 mb-1">
              <Send size={16} className="mr-2 text-primary" /> Project Details / Questions
            </Label>
            <Textarea id="projectDetails" name="projectDetails" value={formData.projectDetails} onChange={handleChange} placeholder="Briefly describe your project or any questions you have..." rows={4} className="bg-background/60 border-border/50 focus:border-primary"/>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Button type="submit" disabled={isSubmitting} className="w-full text-lg py-3 bg-gradient-to-r from-primary to-secondary hover:opacity-90 button-hover-glow">
              {isSubmitting ? 'Submitting Request...' : <><Send size={18} className="mr-2" /> Schedule My Meeting</>}
            </Button>
          </motion.div>
          <p className="text-xs text-center text-muted-foreground mt-4">
            We'll review your request and confirm your discovery call via email. We respect your privacy.
          </p>
        </motion.form>
      </div>
    </section>
  );
};

export default LeadCaptureFormSection;