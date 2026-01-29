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
  week_number: number | null;
  video_type: 'eft' | 'art_therapy' | 'meditation' | 'other';
  is_intro: boolean;
}

interface Category {
  id: string;
  name: string;
  month_number: number;
}

const membershipLabels = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium'
};

const videoTypeLabels = {
  eft: 'EFT',
  art_therapy: 'Art Therapy',
  meditation: 'Meditation',
  other: 'Other'
};

const AdminVideos = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Video | null>(null);

  // Filters
  const [weekFilter, setWeekFilter] = useState<string>('all');
  const [videoTypeFilter, setVideoTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    video_url: '',
    thumbnail_url: '',
    duration_minutes: '',
    is_free: false,
    min_membership: 'basic' as 'free' | 'basic' | 'premium',
    category_id: '',
    sort_order: '0',
    week_number: '',
    video_type: 'other' as 'eft' | 'art_therapy' | 'meditation' | 'other',
    is_intro: false
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
      sort_order: '0',
      week_number: '',
      video_type: 'other',
      is_intro: false
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
      sort_order: video.sort_order.toString(),
      week_number: video.week_number?.toString() || '',
      video_type: video.video_type,
      is_intro: video.is_intro
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
      sort_order: parseInt(formData.sort_order) || 0,
      week_number: formData.week_number ? parseInt(formData.week_number) : null,
      video_type: formData.video_type,
      is_intro: formData.is_intro
    };

    if (editingVideo) {
      const { error } = await supabase
        .from('videos')
        .update(videoData)
        .eq('id', editingVideo.id);

      if (error) {
        toast.error('Error saving: ' + error.message);
        return;
      }
      toast.success('Video updated');
    } else {
      const { error } = await supabase
        .from('videos')
        .insert(videoData);

      if (error) {
        toast.error('Error creating: ' + error.message);
        return;
      }
      toast.success('Video added');
    }

    setDialogOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;

    const { error } = await supabase.from('videos').delete().eq('id', id);

    if (error) {
      toast.error('Error deleting: ' + error.message);
      return;
    }

    toast.success('Video deleted');
    fetchData();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading videos...</div>;
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">Video Management</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Edit Video' : 'New Video'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <Input
                    id="video_url"
                    type="url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="thumbnail_url">Thumbnail URL</Label>
                  <Input
                    id="thumbnail_url"
                    type="url"
                    value={formData.thumbnail_url}
                    onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                  <Label htmlFor="min_membership">Minimum Membership</Label>
                  <Select
                    value={formData.min_membership}
                    onValueChange={(value: 'free' | 'basic' | 'premium') => setFormData({ ...formData, min_membership: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="week_number">Week Number</Label>
                  <Select
                    value={formData.week_number}
                    onValueChange={(value) => setFormData({ ...formData, week_number: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Not assigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Not assigned</SelectItem>
                      <SelectItem value="1">Week 1</SelectItem>
                      <SelectItem value="2">Week 2</SelectItem>
                      <SelectItem value="3">Week 3</SelectItem>
                      <SelectItem value="4">Week 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="video_type">Video Type</Label>
                  <Select
                    value={formData.video_type}
                    onValueChange={(value: 'eft' | 'art_therapy' | 'meditation' | 'other') => setFormData({ ...formData, video_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eft">EFT</SelectItem>
                      <SelectItem value="art_therapy">Art Therapy</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
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
                  <Label htmlFor="is_free">Free for Everyone</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_intro"
                    checked={formData.is_intro}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_intro: checked })}
                  />
                  <Label htmlFor="is_intro">Intro Video</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                  {editingVideo ? 'Save Changes' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Label htmlFor="weekFilter" className="mb-2 block">Filter by Week</Label>
            <Select value={weekFilter} onValueChange={setWeekFilter}>
              <SelectTrigger id="weekFilter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                <SelectItem value="intro">Intro Videos</SelectItem>
                <SelectItem value="1">Week 1</SelectItem>
                <SelectItem value="2">Week 2</SelectItem>
                <SelectItem value="3">Week 3</SelectItem>
                <SelectItem value="4">Week 4</SelectItem>
                <SelectItem value="unassigned">Not Assigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="videoTypeFilter" className="mb-2 block">Filter by Type</Label>
            <Select value={videoTypeFilter} onValueChange={setVideoTypeFilter}>
              <SelectTrigger id="videoTypeFilter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="eft">EFT</SelectItem>
                <SelectItem value="art_therapy">Art Therapy</SelectItem>
                <SelectItem value="meditation">Meditation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {videos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No videos yet</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Week</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Access</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos
                .filter((video) => {
                  // Week filter
                  if (weekFilter === 'intro' && !video.is_intro) return false;
                  if (weekFilter === 'unassigned' && (video.week_number !== null || video.is_intro)) return false;
                  if (weekFilter !== 'all' && weekFilter !== 'intro' && weekFilter !== 'unassigned') {
                    if (video.week_number !== parseInt(weekFilter)) return false;
                  }

                  // Video type filter
                  if (videoTypeFilter !== 'all' && video.video_type !== videoTypeFilter) return false;

                  return true;
                })
                .map((video) => {
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
                        {video.is_intro ? (
                          <Badge variant="default" className="bg-purple-500">Intro</Badge>
                        ) : video.week_number ? (
                          <Badge variant="outline">Week {video.week_number}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{videoTypeLabels[video.video_type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={video.is_free ? 'secondary' : 'outline'}>
                          {video.is_free ? 'Free' : membershipLabels[video.min_membership]}
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
