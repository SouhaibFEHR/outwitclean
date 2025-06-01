import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Button } from '@/components/ui/button';
import { Eye, Mail } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'; // For optional status update

const LeadsTable = ({ leads, onViewLead, onOpenEmailModal, onStatusUpdate }) => {
  return (
    <div className="overflow-x-auto bg-card rounded-lg shadow">
      <Table className="admin-table min-w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="hidden lg:table-cell">Company Name</TableHead>
            <TableHead>Budget Range</TableHead>
            <TableHead className="hidden md:table-cell">Deadline</TableHead>
            <TableHead className="hidden lg:table-cell">Services</TableHead>
            <TableHead className="hidden md:table-cell">Submitted</TableHead>
            {/* <TableHead>Status</TableHead> */}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length > 0 ? (
            leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="font-medium">{lead.full_name}</TableCell>
                <TableCell><a href={`mailto:${lead.email}`} className="hover:text-primary underline">{lead.email}</a></TableCell>
                <TableCell className="hidden lg:table-cell">{lead.company_name || 'N/A'}</TableCell>
                <TableCell>{lead.budget_range}</TableCell>
                <TableCell className="hidden md:table-cell">{lead.deadline ? new Date(lead.deadline).toLocaleDateString() : 'N/A'}</TableCell>
                <TableCell className="hidden lg:table-cell text-xs max-w-xs truncate">{(lead.services_interested || []).join(', ')}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(lead.submitted_at).toLocaleDateString()}</TableCell>
                {/* 
                <TableCell>
                  <Select defaultValue={lead.status || 'New'} onValueChange={(newStatus) => onStatusUpdate(lead.id, newStatus)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Quoted">Quoted</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                */}
                <TableCell className="space-x-1">
                  <Button variant="outline" size="icon" onClick={() => onViewLead(lead)} className="text-blue-500 border-blue-500 hover:bg-blue-500/10 h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                   <Button variant="outline" size="icon" onClick={() => onOpenEmailModal(lead)} className="text-green-500 border-green-500 hover:bg-green-500/10 h-8 w-8">
                    <Mail className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-10">
                No client needs data found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeadsTable;