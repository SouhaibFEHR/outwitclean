import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Mail, ExternalLink, CalendarDays, Users, Briefcase, DollarSign, Tag, Info, ListFilter, Search as SearchIcon, CheckCircle, MessageCircle } from 'lucide-react';

const DetailItem = ({ icon: Icon, label, value, isLink = false, href = '#' }) => (
  <div className="py-2 grid grid-cols-3 gap-2 items-start">
    <dt className="text-sm font-medium text-muted-foreground flex items-center col-span-1">
      {Icon && <Icon className="h-4 w-4 mr-2 text-primary flex-shrink-0" />}
      {label}
    </dt>
    <dd className="text-sm text-foreground col-span-2 break-words">
      {isLink && value ? 
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
          {value} <ExternalLink className="h-3 w-3 ml-1" />
        </a> 
        : (value || 'N/A')
      }
    </dd>
  </div>
);

const ClientNeedDetailView = ({ lead }) => {
  if (!lead) return null;
  return (
    <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-200px)] pr-2 custom-scrollbar">
      <dl className="divide-y divide-border/30">
        <DetailItem icon={Users} label="Full Name" value={lead.full_name} />
        <DetailItem icon={Mail} label="Email" value={lead.email} isLink href={`mailto:${lead.email}`} />
        <DetailItem icon={Briefcase} label="Company Name" value={lead.company_name} />
        <DetailItem icon={ExternalLink} label="Website" value={lead.website} isLink href={lead.website && !lead.website.startsWith('http') ? `https://${lead.website}` : lead.website} />
        <DetailItem icon={DollarSign} label="Budget Range" value={lead.budget_range} />
        <DetailItem icon={CalendarDays} label="Deadline" value={lead.deadline ? new Date(lead.deadline).toLocaleDateString() : 'N/A'} />
        
        <div className="py-3">
          <dt className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <ListFilter className="h-4 w-4 mr-2 text-primary" />
            Services Interested
          </dt>
          <dd className="text-sm text-foreground">
            {lead.services_interested && lead.services_interested.length > 0 ? (
              <ul className="list-disc list-inside pl-1 space-y-1">
                {lead.services_interested.map(service => <li key={service}>{service}</li>)}
              </ul>
            ) : 'N/A'}
          </dd>
        </div>

        <DetailItem icon={Tag} label="Main Objective" value={lead.main_objective} />
        <DetailItem icon={MessageCircle} label="Target Audience" value={lead.target_audience} />
        <DetailItem icon={Info} label="Competitors/Inspirations" value={lead.competitors_inspirations} />
        <DetailItem icon={Briefcase} label="Past Agency Exp." value={lead.past_agency_experience === null ? 'N/A' : (lead.past_agency_experience ? 'Yes' : 'No')} />
        <DetailItem icon={SearchIcon} label="How Found Us" value={lead.how_did_you_find_us} />
        
        <div className="py-3">
          <dt className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <MessageCircle className="h-4 w-4 mr-2 text-primary" />
            Additional Details
          </dt>
          <dd className="text-sm text-foreground whitespace-pre-wrap">{lead.additional_details || 'N/A'}</dd>
        </div>
        
        <DetailItem icon={CheckCircle} label="GDPR Consent" value={lead.gdpr_consent ? 'Agreed' : 'Not Agreed'} />
        <DetailItem icon={CalendarDays} label="Submitted At" value={new Date(lead.submitted_at).toLocaleString()} />
        {lead.ip_address && <DetailItem icon={Info} label="IP Address" value={lead.ip_address} />}
        {lead.lead_score && <DetailItem icon={DollarSign} label="Lead Score" value={String(lead.lead_score)} />}
      </dl>
    </div>
  );
};

const LeadDetailViewModal = ({ isOpen, onOpenChange, lead }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl md:max-w-2xl lg:max-w-3xl glassmorphism-deep max-h-[90vh]">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl md:text-3xl text-gradient font-['Space_Grotesk',_sans-serif]">Client Submission Details</DialogTitle>
          <DialogDescription className="font-['Poppins',_sans-serif]">Full details for: {lead?.full_name}</DialogDescription>
        </DialogHeader>
        {lead && <ClientNeedDetailView lead={lead} />}
         <DialogFooter className="mt-6">
            <DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LeadDetailViewModal;