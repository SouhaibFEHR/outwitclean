import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';

const LeadEmailModal = ({ isOpen, onOpenChange, lead, supabase, toast }) => {
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lead) {
      setEmailData({
        to: lead.email,
        subject: `Regarding your project inquiry - ${lead.company_name || lead.full_name}`,
        body: `Hi ${lead.full_name.split(' ')[0]},\n\nThank you for reaching out to Outwit Agency about your project.\n\nWe've received your details and our team is reviewing them. We'll be in touch shortly to discuss how we can help you achieve your goals.\n\nIn the meantime, feel free to explore more about our services at [Your Website Link].\n\nBest regards,\nThe Outwit Agency Team`
      });
    }
  }, [lead]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!lead) return;
    setIsSubmitting(true);
    
    try {
        const { data, error } = await supabase.functions.invoke('send-contact-email', {
            body: {
                to: emailData.to,
                from: 'tech@outwit.agency', 
                subject: emailData.subject,
                html: emailData.body.replace(/\n/g, '<br>')
            }
        });

        if (error) throw error;

        toast({
            title: "Email Sent Successfully!",
            description: `Email dispatched to ${emailData.to}.`,
            variant: "default",
        });
        onOpenChange(false); // Close modal on success
    } catch (error) {
        console.error('Error sending email via Edge Function:', error);
        toast({
            title: "Email Sending Failed",
            description: error.message || "Could not send the email. Please check logs or try again.",
            variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glassmorphism-deep">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient">Send Email to {lead?.full_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSendEmail} className="space-y-4 py-4">
          <div><Label htmlFor="email_to">To</Label><Input id="email_to" type="email" value={emailData.to} readOnly className="bg-muted border-border/50" /></div>
          <div><Label htmlFor="email_subject">Subject</Label><Input id="email_subject" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} required className="bg-input border-border/50 focus:border-primary" /></div>
          <div><Label htmlFor="email_body">Body (HTML supported)</Label><Textarea id="email_body" value={emailData.body} onChange={(e) => setEmailData({...emailData, body: e.target.value})} rows={8} required className="bg-input border-border/50 focus:border-primary" /></div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LeadEmailModal;