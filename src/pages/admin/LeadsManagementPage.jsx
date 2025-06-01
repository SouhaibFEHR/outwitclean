import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

import LeadFilters from '@/pages/admin/leads/LeadFilters';
import LeadsTable from '@/pages/admin/leads/LeadsTable';
import LeadDetailViewModal from '@/pages/admin/leads/LeadDetailViewModal';
import LeadEmailModal from '@/pages/admin/leads/LeadEmailModal';

const serviceOptionsList = [
  'Website Design', 'AI Automation', 'Digital Marketing', 'Branding', 
  'E-commerce Development', 'SEO & Content Marketing', 'Mobile App Development', 'Other'
];
const budgetOptionsList = ['< $1000', '$1000 – $5000', '$5000 – $10,000', '$10,000 – $50,000', '$50,000+'];

const LeadsManagementPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    budgetFilter: 'all',
    serviceFilter: 'all',
    dateRangeFilter: { from: '', to: '' },
  });

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentLead, setCurrentLead] = useState(null);
  
  const { toast } = useToast();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('client_needs').select('*').order('submitted_at', { ascending: false });
      const { data, error: supabaseError } = await query;
      if (supabaseError) throw supabaseError;
      setLeads(data || []);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("Failed to load leads. Please try again.");
      toast({ title: 'Error', description: 'Failed to load leads.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearchTerm = 
        (lead.full_name && lead.full_name.toLowerCase().includes(searchLower)) ||
        (lead.email && lead.email.toLowerCase().includes(searchLower)) ||
        (lead.company_name && lead.company_name.toLowerCase().includes(searchLower)) ||
        (lead.main_objective && lead.main_objective.toLowerCase().includes(searchLower)) ||
        (lead.additional_details && lead.additional_details.toLowerCase().includes(searchLower));
      
      const matchesBudget = filters.budgetFilter === 'all' || lead.budget_range === filters.budgetFilter;
      
      const matchesService = filters.serviceFilter === 'all' || 
        (lead.services_interested && lead.services_interested.some(s => s.toLowerCase().includes(filters.serviceFilter.toLowerCase())));

      let matchesDate = true;
      if (filters.dateRangeFilter.from && filters.dateRangeFilter.to) {
        const submittedDate = new Date(lead.submitted_at);
        const fromDate = new Date(filters.dateRangeFilter.from);
        const toDate = new Date(filters.dateRangeFilter.to);
        toDate.setDate(toDate.getDate() + 1); 
        matchesDate = submittedDate >= fromDate && submittedDate < toDate;
      } else if (filters.dateRangeFilter.from) {
        const submittedDate = new Date(lead.submitted_at);
        const fromDate = new Date(filters.dateRangeFilter.from);
        matchesDate = submittedDate >= fromDate;
      } else if (filters.dateRangeFilter.to) {
        const submittedDate = new Date(lead.submitted_at);
        const toDate = new Date(filters.dateRangeFilter.to);
        toDate.setDate(toDate.getDate() + 1);
        matchesDate = submittedDate < toDate;
      }

      return matchesSearchTerm && matchesBudget && matchesService && matchesDate;
    });
  }, [leads, filters]);


  const handleViewLead = (lead) => {
    setCurrentLead(lead);
    setIsViewModalOpen(true);
  };

  const handleOpenEmailModal = (lead) => {
    setCurrentLead(lead);
    setIsEmailModalOpen(true);
  };
  
  const exportToCSV = () => {
    if (filteredLeads.length === 0) {
      toast({ title: 'No Data', description: 'No leads to export for the current filters.', variant: 'default' });
      return;
    }
    const headers = [
      'ID', 'Full Name', 'Email', 'Phone Number', 'Company Name', 'Website', 
      'Services Interested', 'Budget Range', 'Deadline', 'Main Objective', 
      'Target Audience', 'Competitors/Inspirations', 'Past Agency Experience', 
      'How Did You Find Us', 'Additional Details', 'GDPR Consent', 'Submitted At', 
      'IP Address', 'Lead Score'
    ];
    const rows = filteredLeads.map(lead => [
      lead.id,
      `"${(lead.full_name || '').replace(/"/g, '""')}"`,
      `"${(lead.email || '').replace(/"/g, '""')}"`,
      `"${(lead.phone_number || '').replace(/"/g, '""')}"`,
      `"${(lead.company_name || '').replace(/"/g, '""')}"`,
      `"${(lead.website || '').replace(/"/g, '""')}"`,
      `"${(lead.services_interested || []).join(', ').replace(/"/g, '""')}"`,
      `"${(lead.budget_range || '').replace(/"/g, '""')}"`,
      lead.deadline ? new Date(lead.deadline).toLocaleDateString() : '',
      `"${(lead.main_objective || '').replace(/"/g, '""')}"`,
      `"${(lead.target_audience || '').replace(/"/g, '""')}"`,
      `"${(lead.competitors_inspirations || '').replace(/"/g, '""')}"`,
      lead.past_agency_experience === null ? '' : (lead.past_agency_experience ? 'Yes' : 'No'),
      `"${(lead.how_did_you_find_us || '').replace(/"/g, '""')}"`,
      `"${(lead.additional_details || '').replace(/"/g, '""')}"`,
      lead.gdpr_consent ? 'Yes' : 'No',
      lead.submitted_at ? new Date(lead.submitted_at).toLocaleString() : '',
      `"${(lead.ip_address || '').replace(/"/g, '""')}"`,
      lead.lead_score || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "outwit_client_needs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Export Successful', description: 'Client needs data exported to CSV.' });
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    console.log("Updating status for lead:", leadId, "to:", newStatus);
    toast({ title: 'Status Update (Demo)', description: `Lead ${leadId} status would be updated to ${newStatus}.`});
  };


  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gradient">Client Needs Dashboard</h1>
        <Button onClick={exportToCSV} variant="outline" className="text-primary border-primary hover:bg-primary/10">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <LeadFilters 
        filters={filters}
        setFilters={setFilters}
        serviceOptionsList={serviceOptionsList}
        budgetOptionsList={budgetOptionsList}
      />

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading Client Needs Data...</p>
        </div>
      )}
      {error && !loading && (
        <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <LeadsTable 
          leads={filteredLeads}
          onViewLead={handleViewLead}
          onOpenEmailModal={handleOpenEmailModal}
          onStatusUpdate={handleStatusUpdate} 
        />
      )}

      {currentLead && (
        <>
          <LeadDetailViewModal 
            isOpen={isViewModalOpen}
            onOpenChange={setIsViewModalOpen}
            lead={currentLead}
          />
          <LeadEmailModal
            isOpen={isEmailModalOpen}
            onOpenChange={setIsEmailModalOpen}
            lead={currentLead}
            supabase={supabase}
            toast={toast}
          />
        </>
      )}
    </div>
  );
};

export default LeadsManagementPage;