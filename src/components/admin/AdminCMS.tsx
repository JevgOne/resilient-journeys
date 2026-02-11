import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface CMSContent {
  id: string;
  key: string;
  value: string;
  description: string | null;
  page: string;
  section: string | null;
  field_type: 'text' | 'textarea' | 'html' | 'image_url' | 'video_url';
}

const AdminCMS = () => {
  const [content, setContent] = useState<CMSContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<CMSContent | null>(null);
  const [activePage, setActivePage] = useState<string>('homepage');

  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    page: 'homepage',
    section: '',
    field_type: 'text' as 'text' | 'textarea' | 'html' | 'image_url' | 'video_url'
  });

  // Get unique pages from content
  const pages = ['homepage', 'about', 'pricing', 'booking', ...new Set(content.map(c => c.page))];
  const uniquePages = Array.from(new Set(pages));

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cms_content')
      .select('*')
      .order('page', { ascending: true })
      .order('section', { ascending: true });

    if (error) {
      toast.error('Error loading content: ' + error.message);
    } else {
      setContent(data as CMSContent[]);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      page: activePage || 'homepage',
      section: '',
      field_type: 'text'
    });
    setEditingContent(null);
  };

  const handleEdit = (item: CMSContent) => {
    setEditingContent(item);
    setFormData({
      key: item.key,
      value: item.value,
      description: item.description || '',
      page: item.page,
      section: item.section || '',
      field_type: item.field_type
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const contentData = {
      key: formData.key,
      value: formData.value,
      description: formData.description || null,
      page: formData.page,
      section: formData.section || null,
      field_type: formData.field_type
    };

    if (editingContent) {
      const { error } = await supabase
        .from('cms_content')
        .update(contentData)
        .eq('id', editingContent.id);

      if (error) {
        toast.error('Error saving: ' + error.message);
        return;
      }
      toast.success('Content updated');
    } else {
      const { error } = await supabase
        .from('cms_content')
        .insert(contentData);

      if (error) {
        toast.error('Error creating: ' + error.message);
        return;
      }
      toast.success('Content created');
    }

    setDialogOpen(false);
    resetForm();
    fetchContent();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    const { error } = await supabase
      .from('cms_content')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message);
    } else {
      toast.success('Content deleted');
      fetchContent();
    }
  };

  const handleQuickSave = async (item: CMSContent, newValue: string) => {
    const { error } = await supabase
      .from('cms_content')
      .update({ value: newValue })
      .eq('id', item.id);

    if (error) {
      toast.error('Error saving: ' + error.message);
    } else {
      toast.success('Saved!');
      fetchContent();
    }
  };

  const filteredContent = content.filter(c => c.page === activePage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-semibold">Website Content Manager</h2>
          <p className="text-sm text-muted-foreground">Edit text content directly on your website</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gold hover:bg-gold-dark">
              <Plus className="h-4 w-4 mr-2" />
              Add Content Field
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContent ? 'Edit' : 'Add'} Content Field</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="key">Key (unique identifier) *</Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="homepage_hero_title"
                  required
                  disabled={!!editingContent}
                />
                <p className="text-xs text-muted-foreground">Use snake_case, e.g. page_section_field</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this field for?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page">Page *</Label>
                  <Select value={formData.page} onValueChange={(v) => setFormData({ ...formData, page: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homepage">Homepage</SelectItem>
                      <SelectItem value="about">About</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="resilient-hub">Resilient Hub</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input
                    id="section"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. hero, features"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field_type">Field Type *</Label>
                <Select value={formData.field_type} onValueChange={(v: any) => setFormData({ ...formData, field_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text (single line)</SelectItem>
                    <SelectItem value="textarea">Textarea (multi-line)</SelectItem>
                    <SelectItem value="html">HTML (rich content)</SelectItem>
                    <SelectItem value="image_url">Image URL</SelectItem>
                    <SelectItem value="video_url">Video URL (YouTube/Vimeo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Value *</Label>
                {formData.field_type === 'text' || formData.field_type === 'image_url' || formData.field_type === 'video_url' ? (
                  <Input
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    required
                  />
                ) : (
                  <Textarea
                    id="value"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    rows={formData.field_type === 'html' ? 10 : 4}
                    required
                  />
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="bg-gold hover:bg-gold-dark flex-1">
                  {editingContent ? 'Update' : 'Create'} Field
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activePage} onValueChange={setActivePage}>
        <TabsList className="bg-cream/50">
          {uniquePages.map(page => (
            <TabsTrigger key={page} value={page} className="capitalize">
              {page.replace('-', ' ')}
            </TabsTrigger>
          ))}
        </TabsList>

        {uniquePages.map(page => (
          <TabsContent key={page} value={page}>
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{page.replace('-', ' ')} Content</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : filteredContent.length === 0 ? (
                  <p className="text-muted-foreground">No content fields for this page yet.</p>
                ) : (
                  <div className="space-y-4">
                    {filteredContent.map((item) => (
                      <Card key={item.id} className="bg-background">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{item.key}</code>
                                <Badge variant="outline" className="text-xs">{item.field_type}</Badge>
                              </div>
                              {item.description && (
                                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {item.field_type === 'text' || item.field_type === 'image_url' || item.field_type === 'video_url' ? (
                            <Input
                              value={item.value}
                              onChange={(e) => {
                                const newContent = [...content];
                                const idx = newContent.findIndex(c => c.id === item.id);
                                newContent[idx] = { ...newContent[idx], value: e.target.value };
                                setContent(newContent);
                              }}
                              onBlur={(e) => handleQuickSave(item, e.target.value)}
                            />
                          ) : (
                            <Textarea
                              value={item.value}
                              onChange={(e) => {
                                const newContent = [...content];
                                const idx = newContent.findIndex(c => c.id === item.id);
                                newContent[idx] = { ...newContent[idx], value: e.target.value };
                                setContent(newContent);
                              }}
                              onBlur={(e) => handleQuickSave(item, e.target.value)}
                              rows={item.field_type === 'html' ? 6 : 3}
                            />
                          )}

                          {item.field_type === 'image_url' && item.value && (
                            <div className="mt-2">
                              <img src={item.value} alt="Preview" className="max-w-xs rounded border" />
                            </div>
                          )}
                          {item.field_type === 'video_url' && item.value && (
                            <div className="mt-2 aspect-video max-w-sm rounded overflow-hidden border">
                              <iframe
                                src={item.value.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Video preview"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminCMS;
