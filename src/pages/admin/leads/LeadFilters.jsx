import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { Search } from 'lucide-react';

const LeadFilters = ({ filters, setFilters, serviceOptionsList, budgetOptionsList }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      dateRangeFilter: {
        ...prev.dateRangeFilter,
        [name]: value,
      },
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card rounded-lg shadow">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="text"
          name="searchTerm"
          placeholder="Search by name, email, company..."
          value={filters.searchTerm}
          onChange={handleInputChange}
          className="pl-10 bg-input border-border/50 focus:border-primary"
        />
      </div>
      <div>
        <Select value={filters.budgetFilter} onValueChange={(value) => handleSelectChange('budgetFilter', value)}>
          <SelectTrigger className="w-full bg-input border-border/50 focus:border-primary">
            <SelectValue placeholder="Filter by Budget" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Budgets</SelectItem>
            {budgetOptionsList.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={filters.serviceFilter} onValueChange={(value) => handleSelectChange('serviceFilter', value)}>
          <SelectTrigger className="w-full bg-input border-border/50 focus:border-primary">
            <SelectValue placeholder="Filter by Service" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Services</SelectItem>
            {serviceOptionsList.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-2">
          <Input 
            type="date" 
            value={filters.dateRangeFilter.from} 
            onChange={e => handleDateChange('from', e.target.value)} 
            className="bg-input border-border/50 focus:border-primary" 
            placeholder="From Date"
          />
          <Input 
            type="date" 
            value={filters.dateRangeFilter.to} 
            onChange={e => handleDateChange('to', e.target.value)} 
            className="bg-input border-border/50 focus:border-primary" 
            placeholder="To Date"
          />
      </div>
    </div>
  );
};

export default LeadFilters;