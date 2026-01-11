import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, User, Crown, Calendar, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  membership_type: 'free' | 'basic' | 'premium';
  membership_started_at: string | null;
  membership_expires_at: string | null;
  stripe_customer_id: string | null;
  created_at: string;
}

const membershipLabels = {
  free: 'Zdarma',
  basic: 'Základní',
  premium: 'Premium'
};

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const AdminUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [membershipFilter, setMembershipFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  const [formData, setFormData] = useState({
    membership_type: 'free' as 'free' | 'basic' | 'premium',
    membership_expires_at: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.full_name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term)
      );
    }
    
    if (membershipFilter !== 'all') {
      filtered = filtered.filter(u => u.membership_type === membershipFilter);
    }
    
    setFilteredUsers(filtered);
  }, [users, searchTerm, membershipFilter]);

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Chyba při načítání uživatelů');
      return;
    }
    
    setUsers((data || []) as Profile[]);
    setLoading(false);
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setFormData({
      membership_type: user.membership_type,
      membership_expires_at: user.membership_expires_at 
        ? format(new Date(user.membership_expires_at), 'yyyy-MM-dd')
        : ''
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;

    const updateData: Partial<Profile> = {
      membership_type: formData.membership_type,
      membership_expires_at: formData.membership_expires_at 
        ? new Date(formData.membership_expires_at).toISOString()
        : null,
      membership_started_at: formData.membership_type !== 'free' && !editingUser.membership_started_at
        ? new Date().toISOString()
        : editingUser.membership_started_at
    };

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', editingUser.id);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
      return;
    }
    
    toast.success('Uživatel aktualizován');
    setDialogOpen(false);
    setEditingUser(null);
    fetchUsers();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Načítám uživatele...</div>;
  }

  return (
    <Card className="border-gold/20">
      <CardHeader>
        <CardTitle className="font-serif">Správa uživatelů</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Hledat podle jména nebo emailu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={membershipFilter} onValueChange={setMembershipFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrovat členství" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všichni</SelectItem>
              <SelectItem value="free">Zdarma</SelectItem>
              <SelectItem value="basic">Základní</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          Celkem: {users.length} uživatelů | Zobrazeno: {filteredUsers.length}
        </div>
        
        {filteredUsers.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Žádní uživatelé nenalezeni</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Uživatel</TableHead>
                  <TableHead>Členství</TableHead>
                  <TableHead>Platnost do</TableHead>
                  <TableHead>Registrace</TableHead>
                  <TableHead className="text-right">Akce</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{user.full_name || 'Bez jména'}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={membershipColors[user.membership_type]}>
                        {user.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                        {membershipLabels[user.membership_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.membership_expires_at ? (
                        <div className={`flex items-center gap-1 ${isExpired(user.membership_expires_at) ? 'text-destructive' : ''}`}>
                          <Calendar className="h-4 w-4" />
                          {format(new Date(user.membership_expires_at), 'd. M. yyyy', { locale: cs })}
                          {isExpired(user.membership_expires_at) && (
                            <Badge variant="destructive" className="ml-2 text-xs">Vypršelo</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'd. M. yyyy', { locale: cs })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(user)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upravit členství</DialogTitle>
            </DialogHeader>
            {editingUser && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">{editingUser.full_name || 'Bez jména'}</div>
                  <div className="text-sm text-muted-foreground">{editingUser.email}</div>
                </div>
                <div>
                  <Label htmlFor="membership_type">Typ členství</Label>
                  <Select
                    value={formData.membership_type}
                    onValueChange={(value: 'free' | 'basic' | 'premium') => 
                      setFormData({ ...formData, membership_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Zdarma</SelectItem>
                      <SelectItem value="basic">Základní (27€/měsíc)</SelectItem>
                      <SelectItem value="premium">Premium (47€/měsíc)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.membership_type !== 'free' && (
                  <div>
                    <Label htmlFor="membership_expires_at">Platnost do</Label>
                    <Input
                      id="membership_expires_at"
                      type="date"
                      value={formData.membership_expires_at}
                      onChange={(e) => setFormData({ ...formData, membership_expires_at: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nechte prázdné pro neomezenou platnost
                    </p>
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Zrušit
                  </Button>
                  <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
                    Uložit změny
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
