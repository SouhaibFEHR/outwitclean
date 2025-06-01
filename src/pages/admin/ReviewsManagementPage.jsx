import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { PlusCircle, Edit, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle, Star, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ReviewsManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState(null);
  const [formData, setFormData] = useState({ 
    client_name: '', client_title: '', picture_url: '', rating: 5, review_text: '', approved: false,
    tags: '', additional_notes: '', custom_fields_json: '{}', custom_image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldsError, setCustomFieldsError] = useState('');
  const { toast } = useToast();

  const ratingOptions = [1, 2, 3, 4, 5];

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setReviews(data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load reviews.");
      toast({ title: 'Error', description: 'Failed to load reviews.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleFileUpload = async (file, bucketName) => {
    if (!file) return null;
    const fileName = `review_${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file);
    if (error) {
      throw new Error(`Image upload to ${bucketName} failed: ${error.message}`);
    }
    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
    return publicUrl;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setCustomFieldsError('');

    let custom_fields;
    try {
      custom_fields = JSON.parse(formData.custom_fields_json || '{}');
    } catch (err) {
      setCustomFieldsError('Invalid JSON format for custom fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      let mainImageUrl = formData.picture_url;
      if (imageFile) {
        mainImageUrl = await handleFileUpload(imageFile, 'review-images');
      }
      let customImgUrl = formData.custom_image_url;
      if (customImageFile) {
        customImgUrl = await handleFileUpload(customImageFile, 'review-images'); 
      }

      const reviewData = { 
        client_name: formData.client_name,
        client_title: formData.client_title,
        picture_url: mainImageUrl,
        rating: parseInt(formData.rating, 10),
        review_text: formData.review_text,
        approved: formData.approved,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        additional_notes: formData.additional_notes,
        custom_fields,
        custom_image_url: customImgUrl,
      };
      
      let response;
      if (currentReview && currentReview.id) { 
        response = await supabase.from('reviews').update(reviewData).eq('id', currentReview.id).select();
      } else { 
        response = await supabase.from('reviews').insert(reviewData).select();
      }

      const { data, error: submitError } = response;
      if (submitError) throw submitError;

      toast({ title: 'Success', description: `Review ${currentReview ? 'updated' : 'created'} successfully.` });
      setIsFormModalOpen(false);
      fetchReviews(); 
    } catch (err) {
      console.error("Error submitting review:", err);
      setError(err.message || "Failed to submit review.");
      toast({ title: 'Error', description: err.message || "Failed to submit review.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
      setCustomImageFile(null);
    }
  };
  
  const resetFormData = () => ({
    client_name: '', client_title: '', picture_url: '', rating: 5, review_text: '', approved: false,
    tags: '', additional_notes: '', custom_fields_json: '{}', custom_image_url: ''
  });

  const openCreateForm = () => {
    setCurrentReview(null);
    setFormData(resetFormData());
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
  };

  const openEditForm = (review) => {
    setCurrentReview(review);
    setFormData({ 
      client_name: review.client_name, 
      client_title: review.client_title || '', 
      picture_url: review.picture_url || '', 
      rating: review.rating, 
      review_text: review.review_text || '', 
      approved: review.approved,
      tags: review.tags?.join(', ') || '',
      additional_notes: review.additional_notes || '',
      custom_fields_json: review.custom_fields ? JSON.stringify(review.custom_fields, null, 2) : '{}',
      custom_image_url: review.custom_image_url || '',
    });
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
  };

  const handleDuplicateReview = (review) => {
    setCurrentReview(null); 
    setFormData({
      client_name: `${review.client_name} (Copy)`,
      client_title: review.client_title || '',
      picture_url: review.picture_url || '',
      rating: review.rating,
      review_text: review.review_text || '',
      approved: false, 
      tags: review.tags?.join(', ') || '',
      additional_notes: review.additional_notes || '',
      custom_fields_json: review.custom_fields ? JSON.stringify(review.custom_fields, null, 2) : '{}',
      custom_image_url: review.custom_image_url || '',
    });
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
    toast({ title: 'Review Duplicated', description: `Review from "${review.client_name}" duplicated. Save to create new review.`});
  };

  const openDeleteConfirm = (review) => {
    setCurrentReview(review);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteReview = async () => {
    if (!currentReview || !currentReview.id) return;
    setIsSubmitting(true);
    try {
      const imagesToDelete = [currentReview.picture_url, currentReview.custom_image_url].filter(Boolean);
      if (imagesToDelete.length > 0) {
        const fileNames = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean);
        if (fileNames.length > 0) {
          const { error: deleteImageError } = await supabase.storage.from('review-images').remove(fileNames);
          if (deleteImageError) console.warn("Could not delete all review images from storage:", deleteImageError.message);
        }
      }
      const { error: deleteError } = await supabase.from('reviews').delete().eq('id', currentReview.id);
      if (deleteError) throw deleteError;
      toast({ title: 'Success', description: 'Review deleted successfully.' });
      fetchReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast({ title: 'Error', description: "Failed to delete review.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDeleteDialogOpen(false);
      setCurrentReview(null);
    }
  };

  const toggleApprovalStatus = async (review) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ approved: !review.approved })
        .eq('id', review.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Review status updated.` });
      fetchReviews();
    } catch (err) {
      console.error("Error toggling approval status:", err);
      toast({ title: 'Error', description: "Failed to update review status.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">Reviews Management</h1>
        <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Review
        </Button>
      </div>

      {loading && ( 
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading Reviews...</p>
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
                <TableHead className="w-[80px] hidden md:table-cell">Avatar</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="hidden md:table-cell">
                      {review.picture_url ? (
                        <img src={review.picture_url} alt={review.client_name} className="h-10 w-10 object-cover rounded-full" />
                      ) : (
                        <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center text-xs text-muted-foreground">No Pic</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{review.client_name}</TableCell>
                    <TableCell>
                        <div className="flex items-center">
                            {Array.from({length: review.rating || 0}).map((_, i) => <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />)}
                            {Array.from({length: 5 - (review.rating || 0)}).map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-muted-foreground/30" />)}
                        </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">{(review.tags || []).join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleApprovalStatus(review)}
                        className={review.approved ? "text-green-500 hover:text-green-600" : "text-red-500 hover:text-red-600"}
                        disabled={isSubmitting}
                      >
                        {review.approved ? <CheckCircle className="mr-1 h-4 w-4" /> : <XCircle className="mr-1 h-4 w-4" />}
                        {review.approved ? 'Approved' : 'Unapproved'}
                      </Button>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="icon" onClick={() => openEditForm(review)} className="text-blue-500 border-blue-500 hover:bg-blue-500/10 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDuplicateReview(review)} className="text-purple-500 border-purple-500 hover:bg-purple-500/10 h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteConfirm(review)} className="text-destructive border-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( 
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                     No reviews found. Start by adding a new review.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-2xl glassmorphism-deep max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gradient">{currentReview ? 'Edit Review' : 'Create New Review'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 pr-2">
            <div><Label htmlFor="client_name">Client Name</Label><Input id="client_name" value={formData.client_name} onChange={(e) => setFormData({...formData, client_name: e.target.value})} required className="bg-input border-border/50 focus:border-primary" /></div>
            <div><Label htmlFor="client_title">Client Title</Label><Input id="client_title" value={formData.client_title} onChange={(e) => setFormData({...formData, client_title: e.target.value})} className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select value={String(formData.rating)} onValueChange={(value) => setFormData({...formData, rating: parseInt(value, 10)})}>
                <SelectTrigger className="bg-input border-border/50 focus:border-primary"><SelectValue placeholder="Select rating" /></SelectTrigger>
                <SelectContent className="bg-popover">{ratingOptions.map(r => <SelectItem key={r} value={String(r)} className="cursor-pointer hover:bg-primary/10">{r} Star{r > 1 ? 's' : ''}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="review_text">Review Text</Label><Textarea id="review_text" value={formData.review_text} onChange={(e) => setFormData({...formData, review_text: e.target.value})} rows={3} required className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="picture">Client Picture</Label>
              <Input id="picture" type="file" onChange={(e) => setImageFile(e.target.files[0])} className="bg-input border-border/50 focus:border-primary file:text-primary file:font-semibold file:mr-2" />
              {formData.picture_url && !imageFile && <img src={formData.picture_url} alt="Current client" className="mt-2 h-20 w-auto rounded-md object-cover"/>}
              {imageFile && <p className="text-xs text-muted-foreground mt-1">New image: {imageFile.name}</p>}
            </div>
            <div>
              <Label htmlFor="custom_image_review">Custom/Secondary Image (Optional)</Label>
              <Input id="custom_image_review" type="file" onChange={(e) => setCustomImageFile(e.target.files[0])} className="bg-input border-border/50 focus:border-primary file:text-primary file:font-semibold file:mr-2" />
              {formData.custom_image_url && !customImageFile && <img src={formData.custom_image_url} alt="Current custom" className="mt-2 h-20 w-auto rounded-md object-cover"/>}
              {customImageFile && <p className="text-xs text-muted-foreground mt-1">New custom image: {customImageFile.name}</p>}
            </div>
            <div><Label htmlFor="tags_review">Tags (comma-separated)</Label><Input id="tags_review" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="bg-input border-border/50 focus:border-primary" /></div>
            <div><Label htmlFor="additional_notes_review">Additional Notes</Label><Textarea id="additional_notes_review" value={formData.additional_notes} onChange={(e) => setFormData({...formData, additional_notes: e.target.value})} rows={2} className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="custom_fields_json_review">Custom Fields (JSON format)</Label>
              <Textarea id="custom_fields_json_review" value={formData.custom_fields_json} onChange={(e) => setFormData({...formData, custom_fields_json: e.target.value})} rows={3} className={`bg-input border-border/50 focus:border-primary font-mono text-xs ${customFieldsError ? 'border-destructive' : ''}`} />
              {customFieldsError && <p className="text-xs text-destructive mt-1">{customFieldsError}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="approved" checked={formData.approved} onChange={(e) => setFormData({...formData, approved: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="approved" className="text-sm font-medium">Approve Review</Label>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentReview ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                {isSubmitting ? 'Saving...' : (currentReview ? 'Save Changes' : 'Create Review')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
         <DialogContent className="sm:max-w-md glassmorphism-deep">
          <DialogHeader>
            <DialogTitle className="text-xl text-destructive">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the review from "{currentReview?.client_name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild><Button variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
            <Button variant="destructive" onClick={handleDeleteReview} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewsManagementPage;
