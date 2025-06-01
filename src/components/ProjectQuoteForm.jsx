import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, X, CheckCircle } from 'lucide-react';

const serviceOptions = [
  { id: 'website_design', label: 'Website Design' },
  { id: 'ai_automation', label: 'AI Automation' },
  { id: 'digital_marketing', label: 'Digital Marketing' },
  { id: 'branding', label: 'Branding' },
  { id: 'ecommerce', label: 'E-commerce Development' },
  { id: 'seo_content_marketing', label: 'SEO & Content Marketing' },
  { id: 'mobile_app_development', label: 'Mobile App Development' },
  { id: 'other', label: 'Other (Please specify)' },
];

const budgetOptions = [
  '< $1000',
  '$1000 – $5000',
  '$5000 – $10,000',
  '$10,000 – $50,000',
  '$50,000+',
];

const howFoundOptions = [
  'Google Search',
  'Social Media',
  'Referral',
  'Advertisement',
  'Event or Conference',
  'Other',
];

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: [0.42, 0, 0.58, 1] } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: [0.42, 0, 0.58, 1] } }
};

const ProjectQuoteForm = ({ isOpen, onOpenChange }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone_number: '', company_name: '', website: '',
    services_interested: [], other_service_description: '', budget_range: '',
    deadline: '', main_objective: '', target_audience: '',
    competitors_inspirations: '', past_agency_experience: '',
    how_did_you_find_us: '', additional_details: '', gdpr_consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showOtherServiceInput, setShowOtherServiceInput] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const alreadySubmitted = sessionStorage.getItem('quoteFormSubmitted');
      if (alreadySubmitted) {
        setSubmissionSuccess(true);
      } else {
        setSubmissionSuccess(false);
        setFormData({ // Reset form data when opening if not already submitted
            full_name: '', email: '', phone_number: '', company_name: '', website: '',
            services_interested: [], other_service_description: '', budget_range: '',
            deadline: '', main_objective: '', target_audience: '',
            competitors_inspirations: '', past_agency_experience: '',
            how_did_you_find_us: '', additional_details: '', gdpr_consent: false,
        });
        setErrors({});
        setShowOtherServiceInput(false);
      }
    }
  }, [isOpen]);

  const validateField = (name, value) => {
    let errorMsg = '';
    switch (name) {
      case 'full_name': if (!value.trim()) errorMsg = 'Full name is required.'; break;
      case 'email':
        if (!value.trim()) errorMsg = 'Email is required.';
        else if (!/\S+@\S+\.\S+/.test(value)) errorMsg = 'Email address is invalid.';
        break;
      case 'phone_number': if (value && !/^\+?[1-9]\d{1,14}$/.test(value.replace(/\s+/g, ''))) errorMsg = 'Invalid phone number format.'; break;
      case 'website':
         if (value && !/^(ftp|http|https):\/\/[^ "]+$/.test(value)) {
           if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) errorMsg = 'Invalid website URL format.';
         }
        break;
      case 'services_interested': if (value.length === 0) errorMsg = 'Please select at least one service.'; break;
      case 'other_service_description':
        if (formData.services_interested.includes('Other (Please specify)') && !value.trim()) errorMsg = 'Please describe the "Other" service.';
        break;
      case 'budget_range': if (!value) errorMsg = 'Budget range is required.'; break;
      case 'gdpr_consent': if (!value) errorMsg = 'You must agree to be contacted.'; break;
      default: break;
    }
    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    validateField(name, val);
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };
  
  const handleServiceChange = (serviceLabel) => {
    const newServices = formData.services_interested.includes(serviceLabel)
      ? formData.services_interested.filter(s => s !== serviceLabel)
      : [...formData.services_interested, serviceLabel];
    setFormData(prev => ({ ...prev, services_interested: newServices }));
    validateField('services_interested', newServices);
    const isOtherSelected = newServices.includes('Other (Please specify)');
    setShowOtherServiceInput(isOtherSelected);
    if (!isOtherSelected) {
      setFormData(prev => ({...prev, other_service_description: ''}));
      setErrors(prev => ({...prev, other_service_description: ''}));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    const fieldsToValidate = ['full_name', 'email', 'phone_number', 'website', 'services_interested', 'budget_range', 'gdpr_consent'];
    if (showOtherServiceInput) fieldsToValidate.push('other_service_description');
    fieldsToValidate.forEach(field => { if (!validateField(field, formData[field])) isValid = false; });
    
    if (!isValid) {
      toast({ title: 'Validation Error', description: 'Please correct the errors in the form.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const submissionData = { ...formData };
    if (submissionData.services_interested.includes('Other (Please specify)') && submissionData.other_service_description) {
      const otherIndex = submissionData.services_interested.indexOf('Other (Please specify)');
      submissionData.services_interested[otherIndex] = `Other: ${submissionData.other_service_description}`;
    }
    delete submissionData.other_service_description;
    submissionData.past_agency_experience = formData.past_agency_experience === 'yes' ? true : (formData.past_agency_experience === 'no' ? false : null);

    try {
      const { error: supabaseError } = await supabase.from('client_needs').insert([submissionData]);
      if (supabaseError) throw supabaseError;
      setSubmissionSuccess(true);
      sessionStorage.setItem('quoteFormSubmitted', 'true');
      toast({
        title: '🚀 Quote Request Sent!',
        description: "Thank you! Our team will get back to you shortly.",
        className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl",
      });
    } catch (error) {
      console.error('Error submitting quote form:', error);
      toast({ title: 'Submission Error', description: 'Could not submit your request. Please try again.', variant: 'destructive' });
      setErrors(prev => ({ ...prev, form: 'Submission failed. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="project-quote-dialog-content"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogContent className="max-w-md md:max-w-2xl glassmorphism-deep p-0 max-h-[90vh] flex flex-col overflow-hidden">
              <DialogHeader className="p-4 sm:p-5 border-b border-border/20 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl md:text-2xl font-bold text-gradient font-['Space_Grotesk',_sans-serif]">
                    Tell Us About Your Project
                  </DialogTitle>
                  <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="rounded-full text-foreground/70 hover:text-primary">
                      <X className="h-5 w-5" />
                    </Button>
                  </DialogClose>
                </div>
                {!submissionSuccess && (
                  <DialogDescription className="text-sm text-foreground/70 mt-1 font-['Poppins',_sans-serif]">
                    Get a personalized quote. The more details, the better!
                  </DialogDescription>
                )}
              </DialogHeader>
              
              {submissionSuccess ? (
                <div className="p-6 sm:p-8 text-center flex flex-col items-center justify-center flex-grow">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse-glow" />
                  <DialogTitle className="text-2xl md:text-3xl font-bold text-gradient font-['Space_Grotesk',_sans-serif]">Request Received!</DialogTitle>
                  <DialogDescription className="text-md md:text-lg text-foreground/80 mt-2 font-['Poppins',_sans-serif]">
                    Thank you, {formData.full_name.split(" ")[0] || "Innovator"}! Our team will review your project details and get back to you shortly.
                  </DialogDescription>
                  <Button onClick={() => onOpenChange(false)} className="mt-6 w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-['Space_Grotesk',_sans-serif]">Close</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-grow p-4 sm:p-5 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label><Input id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="e.g., Nova Stargazer" className={errors.full_name ? 'border-destructive' : ''} /><p className="text-destructive text-xs mt-1 h-4">{errors.full_name}</p></div>
                    <div><Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className={errors.email ? 'border-destructive' : ''} /><p className="text-destructive text-xs mt-1 h-4">{errors.email}</p></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><Label htmlFor="phone_number">Phone Number</Label><Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleInputChange} placeholder="+1 123 456 7890" className={errors.phone_number ? 'border-destructive' : ''} /><p className="text-destructive text-xs mt-1 h-4">{errors.phone_number}</p></div>
                    <div><Label htmlFor="company_name">Company Name</Label><Input id="company_name" name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="e.g., Quantum Leap Inc." /><p className="h-4"></p></div>
                  </div>
                  
                  <div><Label htmlFor="website">Current Website (if any)</Label><Input id="website" name="website" value={formData.website} onChange={handleInputChange} placeholder="https://yourcompany.com" className={errors.website ? 'border-destructive' : ''}/><p className="text-destructive text-xs mt-1 h-4">{errors.website}</p></div>

                  <div>
                    <Label>Services Interested In <span className="text-destructive">*</span></Label>
                    <div className="mt-1.5 space-y-1.5 p-2.5 border border-input rounded-md bg-background/30 max-h-40 overflow-y-auto custom-scrollbar-small">
                      {serviceOptions.map((service) => (
                        <div key={service.id} className="flex items-center space-x-2">
                          <Checkbox id={`service-${service.id}`} checked={formData.services_interested.includes(service.label)} onCheckedChange={() => handleServiceChange(service.label)} />
                          <Label htmlFor={`service-${service.id}`} className="font-normal text-sm text-foreground/90 cursor-pointer">{service.label}</Label>
                        </div>
                      ))}
                    </div>
                    {errors.services_interested && <p className="text-destructive text-xs mt-1 h-4">{errors.services_interested}</p>}
                  </div>

                  {showOtherServiceInput && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-1">
                      <Label htmlFor="other_service_description">Please specify "Other" service <span className="text-destructive">*</span></Label>
                      <Textarea id="other_service_description" name="other_service_description" value={formData.other_service_description} onChange={handleInputChange} placeholder="Describe the service you need" className={`mt-1 ${errors.other_service_description ? 'border-destructive' : ''}`} rows={2} />
                      {errors.other_service_description && <p className="text-destructive text-xs mt-1 h-4">{errors.other_service_description}</p>}
                    </motion.div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="budget_range">Estimated Budget <span className="text-destructive">*</span></Label>
                      <Select name="budget_range" value={formData.budget_range} onValueChange={(value) => handleSelectChange('budget_range', value)}>
                        <SelectTrigger className={errors.budget_range ? 'border-destructive' : ''}><SelectValue placeholder="Select budget range" /></SelectTrigger>
                        <SelectContent>{budgetOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select>
                      <p className="text-destructive text-xs mt-1 h-4">{errors.budget_range}</p>
                    </div>
                    <div>
                      <Label htmlFor="deadline">Preferred Project Deadline</Label>
                      <Input id="deadline" name="deadline" type="date" value={formData.deadline} onChange={handleInputChange} className="cursor-pointer" min={new Date().toISOString().split("T")[0]}/><p className="h-4"></p>
                    </div>
                  </div>

                  <div><Label htmlFor="main_objective">Main Objective (Short Text)</Label><Input id="main_objective" name="main_objective" value={formData.main_objective} onChange={handleInputChange} placeholder="e.g., Increase online sales by 30%" /><p className="h-4"></p></div>
                  <div><Label htmlFor="target_audience">Who is your target audience?</Label><Textarea id="target_audience" name="target_audience" value={formData.target_audience} onChange={handleInputChange} placeholder="Describe your ideal customer or user demographic" rows={2} /><p className="h-4"></p></div>
                  <div><Label htmlFor="competitors_inspirations">Competitors or Inspirations</Label><Textarea id="competitors_inspirations" name="competitors_inspirations" value={formData.competitors_inspirations} onChange={handleInputChange} placeholder="List any key competitors or websites/apps you admire" rows={2} /><p className="h-4"></p></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="past_agency_experience">Worked with an agency before?</Label>
                      <Select name="past_agency_experience" value={formData.past_agency_experience} onValueChange={(value) => handleSelectChange('past_agency_experience', value)}>
                        <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                        <SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent>
                      </Select><p className="h-4"></p>
                    </div>
                    <div>
                      <Label htmlFor="how_did_you_find_us">How did you find us?</Label>
                      <Select name="how_did_you_find_us" value={formData.how_did_you_find_us} onValueChange={(value) => handleSelectChange('how_did_you_find_us', value)}>
                        <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                        <SelectContent>{howFoundOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                      </Select><p className="h-4"></p>
                    </div>
                  </div>

                  <div><Label htmlFor="additional_details">Additional Details</Label><Textarea id="additional_details" name="additional_details" value={formData.additional_details} onChange={handleInputChange} placeholder="Anything else you'd like to share?" rows={2} /><p className="h-4"></p></div>
                  
                  <div className="flex items-start space-x-2 pt-1">
                    <Checkbox id="gdpr_consent" name="gdpr_consent" checked={formData.gdpr_consent} onCheckedChange={(checked) => handleSelectChange('gdpr_consent', checked)} className={errors.gdpr_consent ? 'border-destructive' : ''} />
                    <div className="grid gap-1 leading-none">
                      <Label htmlFor="gdpr_consent" className="font-normal text-sm text-foreground/90 cursor-pointer">I agree to be contacted regarding my project. <span className="text-destructive">*</span></Label>
                      {errors.gdpr_consent && <p className="text-destructive text-xs">{errors.gdpr_consent}</p>}
                    </div>
                  </div>

                  {errors.form && <p className="text-destructive text-sm text-center">{errors.form}</p>}
                  
                  <DialogFooter className="pt-3 pb-3 sticky bottom-0 bg-background/80 backdrop-blur-sm z-10 -mx-4 px-4 sm:-mx-5 sm:px-5">
                    <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto text-md bg-primary text-primary-foreground hover:bg-primary/90 button-hover-glow font-['Space_Grotesk',_sans-serif] py-2.5 px-6">
                      {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                      Request My Quote
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};

export default ProjectQuoteForm;
