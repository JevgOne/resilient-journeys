import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, Plus, Trash2, RefreshCw } from 'lucide-react';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

const defaultSettings = [
  { key: 'site_title', value: 'Resilient Mind', description: 'Název webu' },
  { key: 'site_description', value: 'Podpora pro expat rodiny', description: 'Popis webu' },
  { key: 'contact_email', value: '', description: 'Kontaktní email' },
  { key: 'hero_title', value: 'Find Your Resilient Mind', description: 'Nadpis na hlavní stránce' },
  { key: 'hero_subtitle', value: 'Creative support for expat families...', description: 'Podnadpis na hlavní stránce' },
  { key: 'about_text', value: '', description: 'Text na stránce O mně' },
];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSetting, setNewSetting] = useState({ key: '', value: '', description: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .order('key');

    if (error) {
      toast.error('Chyba při načítání nastavení');
      return;
    }
    
    setSettings(data || []);
    setLoading(false);
  };

  const initializeDefaults = async () => {
    const existingKeys = settings.map(s => s.key);
    const missingSettings = defaultSettings.filter(d => !existingKeys.includes(d.key));

    if (missingSettings.length === 0) {
      toast.info('Všechna výchozí nastavení již existují');
      return;
    }

    const { error } = await supabase
      .from('site_settings')
      .insert(missingSettings);

    if (error) {
      toast.error('Chyba při inicializaci: ' + error.message);
      return;
    }

    toast.success(`Přidáno ${missingSettings.length} výchozích nastavení`);
    fetchSettings();
  };

  const handleSave = async (setting: Setting) => {
    setSaving(true);
    
    const { error } = await supabase
      .from('site_settings')
      .update({ value: setting.value })
      .eq('id', setting.id);

    if (error) {
      toast.error('Chyba při ukládání: ' + error.message);
    } else {
      toast.success('Nastavení uloženo');
    }
    
    setSaving(false);
  };

  const handleAddSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSetting.key) {
      toast.error('Klíč je povinný');
      return;
    }

    const { error } = await supabase
      .from('site_settings')
      .insert({
        key: newSetting.key,
        value: newSetting.value || null,
        description: newSetting.description || null
      });

    if (error) {
      toast.error('Chyba při přidávání: ' + error.message);
      return;
    }

    toast.success('Nastavení přidáno');
    setNewSetting({ key: '', value: '', description: '' });
    fetchSettings();
  };

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Opravdu chcete smazat nastavení \\"${key}\\"?`)) return;

    const { error } = await supabase
      .from('site_settings')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Chyba při mazání: ' + error.message);
      return;
    }

    toast.success('Nastavení smazáno');
    fetchSettings();
  };

  const updateLocalSetting = (id: string, value: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value } : s));
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Načítám nastavení...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Initialize Defaults */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Rychlé akce</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={initializeDefaults}
            className="border-gold text-gold hover:bg-gold hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Inicializovat výchozí nastavení
          </Button>
        </CardContent>
      </Card>

      {/* Existing Settings */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif">Nastavení webu</CardTitle>
          <CardDescription>Upravte texty a konfiguraci webu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {settings.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Zatím žádná nastavení. Klikněte na "Inicializovat výchozí nastavení" pro začátek.
            </p>
          ) : (
            settings.map((setting) => (
              <div key={setting.id} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">
                      {setting.key}
                    </Label>
                    {setting.description && (
                      <p className="text-xs text-muted-foreground mb-2">{setting.description}</p>
                    )}
                    {setting.value && setting.value.length > 100 ? (
                      <Textarea
                        value={setting.value || ''}
                        onChange={(e) => updateLocalSetting(setting.id, e.target.value)}
                        rows={4}
                      />
                    ) : (
                      <Input
                        value={setting.value || ''}
                        onChange={(e) => updateLocalSetting(setting.id, e.target.value)}
                      />
                    )}
                  </div>
                  <div className="flex gap-2 pt-6">
                    <Button 
                      size="sm" 
                      onClick={() => handleSave(setting)}
                      disabled={saving}
                      className="bg-gold hover:bg-gold-dark text-white"
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(setting.id, setting.key)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Add New Setting */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif text-lg">Přidat nové nastavení</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddSetting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="new_key">Klíč</Label>
                <Input
                  id="new_key"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting({ ...newSetting, key: e.target.value })}
                  placeholder="např. footer_text"
                />
              </div>
              <div>
                <Label htmlFor="new_value">Hodnota</Label>
                <Input
                  id="new_value"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting({ ...newSetting, value: e.target.value })}
                  placeholder="Hodnota nastavení"
                />
              </div>
              <div>
                <Label htmlFor="new_description">Popis</Label>
                <Input
                  id="new_description"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                  placeholder="Popis nastavení"
                />
              </div>
            </div>
            <Button type="submit" className="bg-gold hover:bg-gold-dark text-white">
              <Plus className="h-4 w-4 mr-2" />
              Přidat nastavení
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
