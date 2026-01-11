import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  rating: number;
  is_visible: boolean;
  sort_order: number;
}

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    avatar_url: '',
    rating: '5',
    is_visible: true,
    sort_order: '0'
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Chyba při načítání recenzí');
      return;
    }
    
    setTestimonials(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      avatar_url: '',
      rating: '5',
      is_visible: true,
      sort_order: '0'
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role || '',
      content: testimonial.content,
      avatar_url: testimonial.avatar_url || '',
      rating: testimonial.rating.toString(),
      is_visible: testimonial.is_visible,
      sort_order: testimonial.sort_order.toString()
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const testimonialData = {
      name: formData.name,
      role: formData.role || null,
      content: formData.content,
      avatar_url: formData.avatar_url || null,
      rating: parseInt(formData.rating),
      is_visible: formData.is_visible,
      sort_order: parseInt(formData.sort_order) || 0
    };

    if (editingTestimonial) {
      const { error } = await supabase
        .from('testimonials')
        .update(testimonialData)
        .eq('id', editingTestimonial.id);

      if (error) {
        toast.error('Chyba při ukládání: ' + error.message);
        return;
      }
      toast.success('Recenze aktualizována');
    } else {
      const { error } = await supabase
        .from('testimonials')
        .insert(testimonialData);

      if (error) {
        toast.error('Chyba při vytváření: ' + error.message);
        return;
      }
      toast.success('Recenze přidána');
    }

    setDialogOpen(false);
    resetForm();
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto recenzi?')) return;

    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    
    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
      return;
    }
    
    toast.success('Recenze smazána');
    fetchTestimonials();
  };

  const toggleVisibility = async (testimonial: Testimonial) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_visible: !testimonial.is_visible })
      .eq('id', testimonial.id);

    if (error) {
      toast.error('Chyba při změně viditelnosti');
      return;
    }
    
    fetchTestimonials();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Načítám recenze...</div>;
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">Správa recenzí</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Přidat recenzi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Upravit recenzi' : 'Nová recenze'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Jméno</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="např. Anna K."
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role / Lokace</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="např. Expat Mom, Barcelona"
                />
              </div>
              <div>
                <Label htmlFor="content">Text recenze</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Text recenze..."
                  rows={4}
                  required
                />
              </div>
              <div>
                <Label htmlFor="avatar_url">URL profilového obrázku</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rating">Hodnocení (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                    required
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
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is_visible"
                  checked={formData.is_visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_visible: checked })}
                />
                <Label htmlFor="is_visible">Zobrazit na webu</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                  {editingTestimonial ? 'Uložit změny' : 'Vytvořit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {testimonials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Zatím žádné recenze</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jméno</TableHead>
                <TableHead>Recenze</TableHead>
                <TableHead>Hodnocení</TableHead>
                <TableHead>Viditelnost</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <p className="truncate">{testimonial.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-0.5">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-gold fill-gold" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleVisibility(testimonial)}
                    >
                      {testimonial.is_visible ? (
                        <Badge variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" /> Viditelné
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <EyeOff className="h-3 w-3" /> Skryté
                        </Badge>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminTestimonials;
