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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
  month_number: number;
  icon: string | null;
}

const iconOptions = [
  { value: 'heart', label: '❤️ Srdce' },
  { value: 'brain', label: '🧠 Mozek' },
  { value: 'shield', label: '🛡️ Štít' },
  { value: 'palette', label: '🎨 Paleta' },
  { value: 'eye', label: '👁️ Oko' },
  { value: 'users', label: '👥 Lidé' },
  { value: 'zap', label: '⚡ Blesk' },
  { value: 'compass', label: '🧭 Kompas' },
  { value: 'target', label: '🎯 Cíl' },
  { value: 'globe', label: '🌍 Svět' },
  { value: 'sun', label: '☀️ Slunce' },
  { value: 'puzzle', label: '🧩 Puzzle' }
];

const AdminCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    month_number: '1',
    icon: 'heart'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('video_categories')
      .select('*')
      .order('month_number');

    if (error) {
      toast.error('Chyba při načítání kategorií');
      return;
    }
    
    setCategories(data || []);
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      month_number: '1',
      icon: 'heart'
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      month_number: category.month_number.toString(),
      icon: category.icon || 'heart'
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      description: formData.description || null,
      month_number: parseInt(formData.month_number),
      icon: formData.icon
    };

    if (editingCategory) {
      const { error } = await supabase
        .from('video_categories')
        .update(categoryData)
        .eq('id', editingCategory.id);

      if (error) {
        toast.error('Chyba při ukládání: ' + error.message);
        return;
      }
      toast.success('Kategorie aktualizována');
    } else {
      const { error } = await supabase
        .from('video_categories')
        .insert(categoryData);

      if (error) {
        toast.error('Chyba při vytváření: ' + error.message);
        return;
      }
      toast.success('Kategorie přidána');
    }

    setDialogOpen(false);
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tuto kategorii? Smaže se i všechna přidružená videa!')) return;

    const { error } = await supabase.from('video_categories').delete().eq('id', id);
    
    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
      return;
    }
    
    toast.success('Kategorie smazána');
    fetchCategories();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Načítám kategorie...</div>;
  }

  return (
    <Card className="border-gold/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-serif">Správa kategorií (měsíců)</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Přidat kategorii
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? 'Upravit kategorii' : 'Nová kategorie'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Název</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="např. Sebeuvědomění"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Popis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Krátký popis měsíce..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month_number">Číslo měsíce</Label>
                  <Input
                    id="month_number"
                    type="number"
                    min="1"
                    max="12"
                    value={formData.month_number}
                    onChange={(e) => setFormData({ ...formData, month_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Ikona</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                  {editingCategory ? 'Uložit změny' : 'Vytvořit'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Zatím žádné kategorie</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Měsíc</TableHead>
                <TableHead>Název</TableHead>
                <TableHead>Popis</TableHead>
                <TableHead>Ikona</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => {
                const iconOption = iconOptions.find(i => i.value === category.icon);
                return (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.month_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-gold" />
                        {category.name}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {category.description || '-'}
                    </TableCell>
                    <TableCell>{iconOption?.label.split(' ')[0] || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(category.id)}>
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

export default AdminCategories;
