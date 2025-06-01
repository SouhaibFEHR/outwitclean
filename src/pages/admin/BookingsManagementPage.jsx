import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarDays, CheckCircle, XCircle, Clock, Trash2, Edit3, RefreshCcw, Filter, Search, Briefcase } from 'lucide-react'; // Added Briefcase
import { useToast } from '@/components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';

const BookingsManagementPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);

  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from('meetings').select('*').order('meeting_date', { ascending: true }).order('meeting_time', { ascending: true });
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,service_type.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({ title: 'Error', description: 'Failed to load bookings.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast, statusFilter, searchTerm]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('meetings')
        .update({ status: newStatus })
        .eq('id', bookingId);
      if (error) throw error;
      toast({ title: 'Status Updated', description: `Booking status changed to ${newStatus}.` });
      fetchBookings(); 
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({ title: 'Error', description: 'Failed to update booking status.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteConfirm = (booking) => {
    setBookingToDelete(booking);
    setShowDeleteConfirm(true);
  };

  const handleDeleteBooking = async () => {
    if (!bookingToDelete) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('meetings').delete().eq('id', bookingToDelete.id);
      if (error) throw error;
      toast({ title: 'Booking Deleted', description: `Booking for ${bookingToDelete.name} has been removed.` });
      setShowDeleteConfirm(false);
      setBookingToDelete(null);
      fetchBookings(); 
    } catch (error) {
      console.error('Error deleting booking:', error);
      toast({ title: 'Error', description: 'Failed to delete booking.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-500';
      case 'pending': return 'text-yellow-500';
      case 'cancelled': return 'text-red-500';
      case 'completed': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };
  
  const statusIcons = {
    pending: <Clock className="h-4 w-4 mr-1 text-yellow-500" />,
    confirmed: <CheckCircle className="h-4 w-4 mr-1 text-green-500" />,
    cancelled: <XCircle className="h-4 w-4 mr-1 text-red-500" />,
    completed: <CheckCircle className="h-4 w-4 mr-1 text-blue-500" />,
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gradient">Meeting Bookings</h1>
        <div className="flex items-center gap-2">
           <Button variant="outline" onClick={fetchBookings} disabled={loading} className="button-hover-glow">
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <Card className="glassmorphism-deep">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><CalendarDays className="mr-3 h-6 w-6 text-primary" />Scheduled Meetings</CardTitle>
          <CardDescription>Manage and view all client meeting requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by name, email, company, service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border/50 focus:border-primary"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-input border-border/50 focus:ring-primary">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <p className="ml-4 text-lg text-muted-foreground">Loading Bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
             <p className="text-center text-muted-foreground py-10 text-lg">
              No bookings match your current filters.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Project Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="font-medium text-foreground">{booking.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.email}</div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground/80">{booking.company_name || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-foreground/80">
                        <div className="flex items-center">
                           <Briefcase className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                           {booking.service_type || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-foreground/80">{format(parseISO(booking.meeting_date), 'PP')}</div>
                        <div className="text-xs text-muted-foreground">{booking.meeting_time}</div>
                      </TableCell>
                      <TableCell className="text-xs text-foreground/70 max-w-xs truncate" title={booking.project_details}>{booking.project_details || 'No details'}</TableCell>
                      <TableCell>
                        <div className={`flex items-center text-sm font-medium ${getStatusColor(booking.status)}`}>
                          {statusIcons[booking.status]}
                          <span className="capitalize">{booking.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Select onValueChange={(newStatus) => handleStatusChange(booking.id, newStatus)} defaultValue={booking.status}>
                          <SelectTrigger className="h-8 w-[120px] text-xs bg-input border-border/40 focus:ring-primary mr-2">
                            <Edit3 className="h-3 w-3 mr-1 text-muted-foreground"/>
                            <SelectValue placeholder="Change Status" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 h-8 w-8" onClick={() => openDeleteConfirm(booking)}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive flex items-center">
              <Trash2 className="mr-2 h-5 w-5" /> Confirm Deletion
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the booking for <strong className="text-foreground">{bookingToDelete?.name}</strong> on {bookingToDelete && format(parseISO(bookingToDelete.meeting_date), 'PP')} at {bookingToDelete?.meeting_time}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="button-hover-glow">Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteBooking} disabled={isSubmitting} className="button-hover-glow">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default BookingsManagementPage;