import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx';
import { PlusCircle, Edit, Trash2, Eye, EyeOff, Loader2, AlertTriangle, UploadCloud, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProjectsManagementPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null); 
  const [formData, setFormData] = useState({ 
    title: '', category: '', description: '', image_url: '', published: true, 
    tags: '', additional_notes: '', custom_fields_json: '{}', custom_image_url: '' 
  });
  const [imageFile, setImageFile] = useState(null);
  const [customImageFile, setCustomImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldsError, setCustomFieldsError] = useState('');
  const { toast } = useToast();

  const projectCategories = ['Website', 'Web App', 'AI Solution', 'Mobile App', 'Branding', 'Other'];

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (supabaseError) throw supabaseError;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects.");
      toast({ title: 'Error', description: 'Failed to load projects.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleFileUpload = async (file, bucketName) => {
    if (!file) return null;
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
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
      let mainImageUrl = formData.image_url;
      if (imageFile) {
        mainImageUrl = await handleFileUpload(imageFile, 'project-images');
      }
      let customImgUrl = formData.custom_image_url;
      if (customImageFile) {
        customImgUrl = await handleFileUpload(customImageFile, 'project-images'); 
      }

      const projectData = { 
        title: formData.title,
        category: formData.category,
        description: formData.description,
        image_url: mainImageUrl,
        published: formData.published,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        additional_notes: formData.additional_notes,
        custom_fields,
        custom_image_url: customImgUrl,
      };
      
      let response;
      if (currentProject && currentProject.id) { 
        response = await supabase.from('projects').update(projectData).eq('id', currentProject.id).select();
      } else { 
        response = await supabase.from('projects').insert(projectData).select();
      }

      const { data, error: submitError } = response;
      if (submitError) throw submitError;

      toast({ title: 'Success', description: `Project ${currentProject ? 'updated' : 'created'} successfully.` });
      setIsFormModalOpen(false);
      fetchProjects(); 
    } catch (err) {
      console.error("Error submitting project:", err);
      setError(err.message || "Failed to submit project.");
      toast({ title: 'Error', description: err.message || "Failed to submit project.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setImageFile(null);
      setCustomImageFile(null);
    }
  };

  const resetFormData = () => ({
    title: '', category: projectCategories[0], description: '', image_url: '', published: true,
    tags: '', additional_notes: '', custom_fields_json: '{}', custom_image_url: ''
  });

  const openCreateForm = () => {
    setCurrentProject(null);
    setFormData(resetFormData());
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
  };

  const openEditForm = (project) => {
    setCurrentProject(project);
    setFormData({ 
      title: project.title, 
      category: project.category, 
      description: project.description || '', 
      image_url: project.image_url || '', 
      published: project.published,
      tags: project.tags?.join(', ') || '',
      additional_notes: project.additional_notes || '',
      custom_fields_json: project.custom_fields ? JSON.stringify(project.custom_fields, null, 2) : '{}',
      custom_image_url: project.custom_image_url || '',
    });
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
  };
  
  const handleDuplicateProject = (project) => {
    setCurrentProject(null); 
    setFormData({
      title: `${project.title} (Copy)`,
      category: project.category,
      description: project.description || '',
      image_url: project.image_url || '', 
      published: false, 
      tags: project.tags?.join(', ') || '',
      additional_notes: project.additional_notes || '',
      custom_fields_json: project.custom_fields ? JSON.stringify(project.custom_fields, null, 2) : '{}',
      custom_image_url: project.custom_image_url || '',
    });
    setImageFile(null);
    setCustomImageFile(null);
    setError(null);
    setCustomFieldsError('');
    setIsFormModalOpen(true);
    toast({ title: 'Project Duplicated', description: `"${project.title}" duplicated. Save to create new project.`});
  };

  const openDeleteConfirm = (project) => {
    setCurrentProject(project);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleDeleteProject = async () => {
    if (!currentProject || !currentProject.id) return;
    setIsSubmitting(true);
    try {
      const imagesToDelete = [currentProject.image_url, currentProject.custom_image_url].filter(Boolean);
      if (imagesToDelete.length > 0) {
        const fileNames = imagesToDelete.map(url => url.split('/').pop()).filter(Boolean);
        if (fileNames.length > 0) {
          const { error: deleteImageError } = await supabase.storage.from('project-images').remove(fileNames);
          if (deleteImageError) console.warn("Could not delete all images from storage:", deleteImageError.message);
        }
      }

      const { error: deleteError } = await supabase.from('projects').delete().eq('id', currentProject.id);
      if (deleteError) throw deleteError;

      toast({ title: 'Success', description: 'Project deleted successfully.' });
      fetchProjects(); 
    } catch (err) {
      console.error("Error deleting project:", err);
      toast({ title: 'Error', description: "Failed to delete project.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setIsConfirmDeleteDialogOpen(false);
      setCurrentProject(null);
    }
  };

  const togglePublishStatus = async (project) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({ published: !project.published })
        .eq('id', project.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Project status updated.` });
      fetchProjects();
    } catch (err) {
      console.error("Error toggling publish status:", err);
      toast({ title: 'Error', description: "Failed to update project status.", variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">Projects Management</h1>
        <Button onClick={openCreateForm} className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Project
        </Button>
      </div>

      {loading && ( 
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading Projects...</p>
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
                <TableHead className="w-[100px] hidden md:table-cell">Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="hidden lg:table-cell">Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="hidden md:table-cell">
                      {project.image_url ? (
                        <img src={project.image_url} alt={project.title} className="h-12 w-12 object-cover rounded-md" />
                      ) : (
                        <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.category}</TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">{(project.tags || []).join(', ') || 'N/A'}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => togglePublishStatus(project)}
                        className={project.published ? "text-green-500 hover:text-green-600" : "text-red-500 hover:text-red-600"}
                        disabled={isSubmitting}
                      >
                        {project.published ? <Eye className="mr-1 h-4 w-4" /> : <EyeOff className="mr-1 h-4 w-4" />}
                        {project.published ? 'Published' : 'Unpublished'}
                      </Button>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="outline" size="icon" onClick={() => openEditForm(project)} className="text-blue-500 border-blue-500 hover:bg-blue-500/10 h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                       <Button variant="outline" size="icon" onClick={() => handleDuplicateProject(project)} className="text-purple-500 border-purple-500 hover:bg-purple-500/10 h-8 w-8">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openDeleteConfirm(project)} className="text-destructive border-destructive hover:bg-destructive/10 h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( 
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No projects found. Start by adding a new project.
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
            <DialogTitle className="text-2xl text-gradient">{currentProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 py-4 pr-2">
            <div><Label htmlFor="title">Title</Label><Input id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger className="bg-input border-border/50 focus:border-primary"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="bg-popover">{projectCategories.map(cat => <SelectItem key={cat} value={cat} className="cursor-pointer hover:bg-primary/10">{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="image">Main Image</Label>
              <Input id="image" type="file" onChange={(e) => setImageFile(e.target.files[0])} className="bg-input border-border/50 focus:border-primary file:text-primary file:font-semibold file:mr-2" />
              {formData.image_url && !imageFile && <img src={formData.image_url} alt="Current main" className="mt-2 h-20 w-auto rounded-md object-cover"/>}
              {imageFile && <p className="text-xs text-muted-foreground mt-1">New main image: {imageFile.name}</p>}
            </div>
            <div>
              <Label htmlFor="custom_image">Custom/Secondary Image (Optional)</Label>
              <Input id="custom_image" type="file" onChange={(e) => setCustomImageFile(e.target.files[0])} className="bg-input border-border/50 focus:border-primary file:text-primary file:font-semibold file:mr-2" />
              {formData.custom_image_url && !customImageFile && <img src={formData.custom_image_url} alt="Current custom" className="mt-2 h-20 w-auto rounded-md object-cover"/>}
              {customImageFile && <p className="text-xs text-muted-foreground mt-1">New custom image: {customImageFile.name}</p>}
            </div>
            <div><Label htmlFor="tags">Tags (comma-separated)</Label><Input id="tags" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="bg-input border-border/50 focus:border-primary" /></div>
            <div><Label htmlFor="additional_notes">Additional Notes</Label><Textarea id="additional_notes" value={formData.additional_notes} onChange={(e) => setFormData({...formData, additional_notes: e.target.value})} rows={2} className="bg-input border-border/50 focus:border-primary" /></div>
            <div>
              <Label htmlFor="custom_fields_json">Custom Fields (JSON format)</Label>
              <Textarea id="custom_fields_json" value={formData.custom_fields_json} onChange={(e) => setFormData({...formData, custom_fields_json: e.target.value})} rows={3} className={`bg-input border-border/50 focus:border-primary font-mono text-xs ${customFieldsError ? 'border-destructive' : ''}`} />
              {customFieldsError && <p className="text-xs text-destructive mt-1">{customFieldsError}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="published" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
              <Label htmlFor="published" className="text-sm font-medium">Publish Project</Label>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">{error}</p>}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (currentProject ? <Edit className="mr-2 h-4 w-4" /> : <PlusCircle className="mr-2 h-4 w-4" />)}
                {isSubmitting ? 'Saving...' : (currentProject ? 'Save Changes' : 'Create Project')}
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
              Are you sure you want to delete the project "{currentProject?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteProject} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsManagementPage;
