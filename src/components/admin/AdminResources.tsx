import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus, Trash2, Pencil, Upload, FileText, Music, File, Download,
  Loader2, ExternalLink, Lock, Unlock
} from 'lucide-react';

interface Resource {
  id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  resource_type: string;
  file_url: string;
  file_size_mb: number | null;
  min_membership: string;
  is_free: boolean;
  sort_order: number;
  download_count: number;
  week_number: number | null;
  resource_subtype: string | null;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

const accessConfig: Record<string, { label: string; color: string; icon: typeof Lock }> = {
  free: { label: 'Free', color: 'bg-emerald-100 text-emerald-800', icon: Unlock },
  basic: { label: 'Basic', color: 'bg-amber-100 text-amber-800', icon: Lock },
  premium: { label: 'Premium', color: 'bg-purple-100 text-purple-800', icon: Lock },
};

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText,
  worksheet: FileText,
  audio: Music,
  meditation: Music,
};

const AdminResources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    resource_type: 'pdf',
    file_url: '',
    file_size_mb: '',
    category_id: '',
    min_membership: 'free',
    is_free: true,
    sort_order: '0',
    week_number: '',
    resource_subtype: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [resRes, catRes] = await Promise.all([
      supabase.from('resources').select('*').order('sort_order'),
      supabase.from('video_categories').select('id, name, month_number').order('month_number'),
    ]);
    if (resRes.data) setResources(resRes.data as Resource[]);
    if (catRes.data) setCategories(catRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      resource_type: 'pdf',
      file_url: '',
      file_size_mb: '',
      category_id: '',
      min_membership: 'free',
      is_free: true,
      sort_order: '0',
      week_number: '',
      resource_subtype: '',
    });
    setEditingResource(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    try {
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(fileName, file, { contentType: file.type });

      if (error) {
        // If bucket doesn't exist, show helpful message
        if (error.message?.includes('not found') || error.message?.includes('Bucket')) {
          toast.error('Storage bucket "resources" not found. Please create it in Supabase Dashboard → Storage → New Bucket (name: resources, public: yes)');
        } else {
          toast.error('Upload error: ' + error.message);
        }
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);

      setFormData(prev => ({
        ...prev,
        file_url: urlData.publicUrl,
        file_size_mb: sizeMb,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/-/g, ' '),
      }));

      toast.success('File uploaded!');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({
      title: resource.title,
      description: resource.description || '',
      resource_type: resource.resource_type,
      file_url: resource.file_url,
      file_size_mb: resource.file_size_mb?.toString() || '',
      category_id: resource.category_id || '',
      min_membership: resource.min_membership,
      is_free: resource.is_free,
      sort_order: resource.sort_order.toString(),
      week_number: resource.week_number?.toString() || '',
      resource_subtype: resource.resource_subtype || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file_url) {
      toast.error('Please upload a file or enter a URL');
      return;
    }

    setSubmitting(true);
    const payload = {
      title: formData.title,
      description: formData.description || null,
      resource_type: formData.resource_type,
      file_url: formData.file_url,
      file_size_mb: formData.file_size_mb ? parseFloat(formData.file_size_mb) : null,
      category_id: formData.category_id || null,
      min_membership: formData.min_membership,
      is_free: formData.min_membership === 'free',
      sort_order: parseInt(formData.sort_order) || 0,
      week_number: formData.week_number ? parseInt(formData.week_number) : null,
      resource_subtype: formData.resource_subtype || null,
    };

    if (editingResource) {
      const { error } = await supabase.from('resources').update(payload).eq('id', editingResource.id);
      if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return; }
      toast.success('Resource updated');
    } else {
      const { error } = await supabase.from('resources').insert(payload);
      if (error) { toast.error('Error: ' + error.message); setSubmitting(false); return; }
      toast.success('Resource added');
    }

    setDialogOpen(false);
    resetForm();
    fetchData();
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this resource?')) return;
    const { error } = await supabase.from('resources').delete().eq('id', id);
    if (error) { toast.error('Error: ' + error.message); return; }
    toast.success('Deleted');
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading...</div>;
  }

  const freeCount = resources.filter(r => r.is_free || r.min_membership === 'free').length;
  const paidCount = resources.length - freeCount;

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-sm">
            <FileText className="h-4 w-4" /> <span className="font-medium">{resources.length}</span> resources
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg text-sm text-emerald-700">
            <Unlock className="h-3.5 w-3.5" /> {freeCount} free
          </div>
          {paidCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-lg text-sm text-amber-700">
              <Lock className="h-3.5 w-3.5" /> {paidCount} paid
            </div>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? 'Edit Resource' : 'Upload New Resource'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* File Upload */}
              <div className="border-2 border-dashed border-gold/30 rounded-xl p-6 text-center hover:border-gold/60 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.mp3,.mp4,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-gold" />
                    <span className="text-sm">Uploading...</span>
                  </div>
                ) : formData.file_url ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 mx-auto text-gold" />
                    <p className="text-sm font-medium truncate">{formData.title || 'File uploaded'}</p>
                    <p className="text-xs text-muted-foreground truncate">{formData.file_url}</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      Replace File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Click to upload PDF, audio, or document</p>
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Choose File
                    </Button>
                  </div>
                )}
              </div>

              {/* Or paste URL */}
              <div className="text-center text-xs text-muted-foreground">or paste a URL directly</div>
              <Input
                placeholder="https://... (file URL)"
                value={formData.file_url}
                onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
              />

              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., 7-Day Gratitude Workbook"
                />
              </div>

              {/* Description */}
              <div>
                <Label>Description (optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Brief description..."
                />
              </div>

              {/* Type + Access */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.resource_type} onValueChange={(v) => setFormData({ ...formData, resource_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">📄 PDF</SelectItem>
                      <SelectItem value="worksheet">📝 Worksheet</SelectItem>
                      <SelectItem value="audio">🎵 Audio</SelectItem>
                      <SelectItem value="meditation">🧘 Meditation</SelectItem>
                      <SelectItem value="video">📹 Video</SelectItem>
                      <SelectItem value="other">📁 Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Access Level</Label>
                  <Select value={formData.min_membership} onValueChange={(v) => setFormData({ ...formData, min_membership: v, is_free: v === 'free' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">🟢 Free — anyone</SelectItem>
                      <SelectItem value="basic">🟡 Basic — paid</SelectItem>
                      <SelectItem value="premium">🟣 Premium only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Month + Week (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Month (optional)</Label>
                  <Select value={formData.category_id || 'none'} onValueChange={(v) => setFormData({ ...formData, category_id: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.month_number}. {cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Week (optional)</Label>
                  <Select value={formData.week_number || 'none'} onValueChange={(v) => setFormData({ ...formData, week_number: v === 'none' ? '' : v })}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="1">Week 1</SelectItem>
                      <SelectItem value="2">Week 2</SelectItem>
                      <SelectItem value="3">Week 3</SelectItem>
                      <SelectItem value="4">Week 4</SelectItem>
                      <SelectItem value="5">Bonus (Free)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingResource ? 'Save' : 'Add Resource'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resources list */}
      {resources.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
            <h3 className="font-serif text-xl mb-2">No resources yet</h3>
            <p className="text-muted-foreground mb-4">Upload your first PDF, worksheet, or audio file</p>
            <Button className="bg-gold hover:bg-gold-dark text-white" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add Resource
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {resources.map((resource) => {
            const access = accessConfig[resource.min_membership] || accessConfig.free;
            const Icon = typeIcons[resource.resource_type] || File;
            const category = categories.find(c => c.id === resource.category_id);

            return (
              <div
                key={resource.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border/50 hover:border-gold/30 hover:bg-muted/20 transition-colors group"
              >
                <Icon className="h-5 w-5 text-gold flex-shrink-0" />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{resource.title}</span>
                    <Badge variant="outline" className="text-[10px]">{resource.resource_type}</Badge>
                  </div>
                  {resource.description && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{resource.description}</p>
                  )}
                </div>

                {/* Month */}
                {category && (
                  <span className="text-xs text-muted-foreground hidden sm:block">M{category.month_number}</span>
                )}

                {/* Size */}
                {resource.file_size_mb && (
                  <span className="text-xs text-muted-foreground hidden sm:block">{resource.file_size_mb}MB</span>
                )}

                {/* Downloads */}
                <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                  <Download className="h-3 w-3" />{resource.download_count || 0}
                </span>

                {/* Access */}
                <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${access.color}`}>
                  {access.label}
                </Badge>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleEdit(resource)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(resource.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminResources;
