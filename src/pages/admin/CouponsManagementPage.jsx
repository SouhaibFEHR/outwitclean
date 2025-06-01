import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, AlertTriangle, CalendarDays, CheckSquare, Square } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CouponsManagementPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null); // For editing
  const [formData, setFormData] = useState({ code: '', user_email: '', expiry_date: '', used: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.from('coupons').select('*').order('generated_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setCoupons(data || []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons.");
      toast({ title: 'Error', description: 'Failed to load coupons.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const generateRandomCode = () => `OUTWIT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const couponData = { 
        ...formData, 
        used: formData.used,
        expiry_date: formData.expiry_date || null // Ensure null if empty
      };
      
      let response;
      if (currentCoupon && currentCoupon.id) { // Editing
        response = await supabase.from('coupons').update(couponData).eq('id', currentCoupon.id).select();
      } else { // Creating
        couponData.generated_at = new Date().toISOString();
        response = await supabase.from('coupons').insert(couponData).select();
      }

      const { data, error: submitError } = response;
      if (submitError) throw submitError;

      toast({ title: 'Success', description: `Coupon ${currentCoupon ? 'updated' : 'created'} successfully.` });
      setIsFormModalOpen(false);
      fetchCoupons(); 
    } catch (err) {
      console.error("Error submitting coupon:", err);
      setError(err.message || "Failed to submit coupon.");
      toast({ title: 'Error', description: err.message || "Failed to submit coupon.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateForm = () => {
    setCurrentCoupon(null);
    setFormData({ code: generateRandomCode(), user_email: '', expiry_date: '', used: false });
    setError(null);
    setIsFormModalOpen(true);
  };

  const openEditForm = (coupon) => {
    setCurrentCoupon(coupon);
    setFormData({ 
      code: coupon.code, 
      user_email: coupon.user_email, 
      expiry_date: coupon.expiry_date ? new Date(coupon.expiry_date).toISOString().split('T')[0] : '', // Format for date input
      used: coupon.used 
    });
    setError(null);
    setIsFormModalOpen(true);
  };
  
  const toggleUsedStatus = async (coupon) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ used: !coupon.used })
        .eq('id', coupon.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Coupon status updated.` });
      fetchCoupons();
    } catch (err) {
      console.error("Error toggling coupon status:", err);
      toast({ title: 'Error', description: "Failed to update coupon status.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">Coupons Management</h1>
        <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Generate New Coupon
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading Coupons...</p>
        </div>
      )}
      {error && !loading && !isFormModalOpen && (
        <div className="text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
          <AlertTriangle className="h-10 w-10 mx-auto mb-2" />
          <p className="text-lg font-semibold">{error}</p>
        </div>
      )}
      {!loading && !error && (
        <div className="overflow-x-auto bg-card rounded-lg shadow">
          <Table className="admin-table">
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Generated At</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="font-mono font-medium">{coupon.code}</TableCell>
                    <TableCell>{coupon.user_email}</TableCell>
                    <TableCell>{new Date(coupon.generated_at).toLocaleDateString()}</TableCell>
                    <TableCell>{coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleUsedStatus(coupon)}
                        className={coupon.used ? "text-red-500 hover:text-red-600" : "text-green-500 hover:text-green-600"}
                        disabled={isSubmitting}
                      >
                        {coupon.used ? <CheckSquare className="mr-1 h-4 w-4" /> : <Square className="mr-1 h-4 w-4" />}
                        {coupon.used ? 'Yes' : 'No'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="icon" onClick={() => openEditForm(coupon)} className="text-blue-500 border-blue-500 hover:bg-blue-500/10 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* Delete might be too destructive for coupons, consider disable instead or soft delete */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No coupons found. Generate some!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-md glassmorphism-deep">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gradient">{currentCoupon ? 'Edit Coupon' : 'Generate New Coupon'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4">
            <div><Label htmlFor="code">Coupon Code</Label><Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required className="bg-input border-border/50 focus:border-primary font-mono" /></div>
            <div><Label htmlFor="user_email">User Email (Optional)</Label><Input id="user_email" type="email" value={formData.user_email} onChange={(e) => setFormData({...formData, user_email: e.target.value})} placeholder="player@example.com" className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
              <div className="relative">
                <Input id="expiry_date" type="date" value={formData.expiry_date} onChange={(e) => setFormData({...formData, expiry_date: e.target.value})} className="bg-input border-border/50 focus:border-primary pr-10" />
                <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="used" checked={formData.used} onChange={(e) => setFormData({...formData, used: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="used" className="text-sm font-medium">Mark as Used</Label>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentCoupon ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                {isSubmitting ? 'Saving...' : (currentCoupon ? 'Save Changes' : 'Generate Coupon')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CouponsManagementPage;