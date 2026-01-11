import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Play, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_minutes: number | null;
  is_free: boolean;
  min_membership: 'free' | 'basic' | 'premium';
  category_id: string;
  sort_order: number;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

const membershipLabels = {
  free: 'Zdarma',
  basic: 'Základní',
  premium: 'Premium'
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    is_free: false,
    min_membership: 'basic' as 'free' | 'basic' | 'premium',
    category_id: '',
    sort_order: '0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [videosRes, categoriesRes] = await Promise.all([
      supabase.from('videos').select('*').order('sort_order'),
      supabase.from('video_categories').select('id, name, month_number').order('month_number')
    ]);

    if (videosRes.data) setVideos(videosRes.data as Video[]);
    if (categoriesRes.data) setCategories(categoriesRes.data);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      video_url: '',
      thumbnail_url: '',
      duration_minutes: '',
      is_free: false,
      min_membership: 'basic',
      category_id: categories[0]?.id || '',
      sort_order: '0'
    });
    setEditingVideo(null);
  };

  const handleEdit = (video: Video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      video_url: video.video_url,
      thumbnail_url: video.thumbnail_url || '',
      duration_minutes: video.duration_minutes?.toString() || '',
      is_free: video.is_free,
      min_membership: video.min_membership,
      category_id: video.category_id,
      sort_order: video.sort_order.toString()
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const videoData = {
      title: formData.title,
      description: formData.description || null,
      video_url: formData.video_url,
      thumbnail_url: formData.thumbnail_url || null,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      is_free: formData.is_free,
      min_membership: formData.min_membership,
      category_id: formData.category_id,
      sort_order: parseInt(formData.sort_order) || 0
    };

    if (editingVideo) {
      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', editingVideo.id);

      if (error) {
        toast.error('Chyba při ukládání: ' + error.message);
        return;
      }
      toast.success('Video aktualizováno');
    } else {
      const { error } = await supabase
        .from('videos')
        .insert(videoData);

      if (error) {
        toast.error('Chyba při vytváření: ' + error.message);
        return;
      }
      toast.success('Video přidáno');
    }

    setDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat toto video?')) return;

    const { error } = await supabase.from('videos').delete().eq('id', id);
    
    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
      return;
    }
    
    toast.success('Video smazáno');
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Načítám videa...</div>;
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">Správa videí</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Přidat video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Upravit video' : 'Nové video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Název</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Popis</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="video_url">URL videa</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="thumbnail_url">URL náhledu</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">Kategorie</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte kategorii" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.month_number}. {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="min_membership">Minimální členství</Label>
                  <Select
                    value={formData.min_membership}
                    onValueChange={(value: 'free' | 'basic' | 'premium') => setFormData({ ...formData, min_membership: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Zdarma</SelectItem>
                      <SelectItem value="basic">Základní</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Délka (minuty)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Pořadí</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_free"
                    checked={formData.is_free}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                  />
                  <Label htmlFor="is_free">Zdarma pro všechny</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                  {editingVideo ? 'Uložit změny' : 'Vytvořit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Zatím žádná videa</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>Přístup</TableHead>
                <TableHead>Délka</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => {
                const category = categories.find(c => c.id === video.category_id);
                return (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-gold" />
                        {video.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      {category ? `${category.month_number}. ${category.name}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={video.is_free ? 'secondary' : 'outline'}>
                        {video.is_free ? 'Zdarma' : membershipLabels[video.min_membership]}
                      </Badge>
                    </TableCell>
                    <TableCell>{video.duration_minutes ? `${video.duration_minutes} min` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(video)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(video.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminVideos;
