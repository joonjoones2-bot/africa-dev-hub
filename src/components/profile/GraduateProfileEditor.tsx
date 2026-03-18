import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Save, X, GraduationCap, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function GraduateProfileEditor() {
  const { user, roleProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newLang, setNewLang] = useState('');
  const [form, setForm] = useState({
    education: '',
    area_of_interest: '',
    skill_level: 'Beginner',
    programming_languages: [] as string[],
  });

  const startEditing = () => {
    setForm({
      education: roleProfile?.education || '',
      area_of_interest: roleProfile?.area_of_interest || '',
      skill_level: roleProfile?.skill_level || 'Beginner',
      programming_languages: roleProfile?.programming_languages || [],
    });
    setEditing(true);
  };

  const addLanguage = () => {
    const lang = newLang.trim();
    if (lang && !form.programming_languages.includes(lang)) {
      setForm({ ...form, programming_languages: [...form.programming_languages, lang] });
      setNewLang('');
    }
  };

  const removeLanguage = (lang: string) => {
    setForm({ ...form, programming_languages: form.programming_languages.filter((l) => l !== lang) });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('graduate_profiles')
      .update({
        education: form.education || null,
        area_of_interest: form.area_of_interest || null,
        skill_level: form.skill_level,
        programming_languages: form.programming_languages,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error('Failed to update graduate profile');
    } else {
      toast.success('Graduate profile updated!');
      setEditing(false);
      await refreshProfile();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <GraduationCap className="h-5 w-5 text-accent" /> Graduate Details
          </CardTitle>
          {!editing && (
            <Button variant="outline" size="sm" onClick={startEditing}>
              <Pencil className="mr-1 h-4 w-4" /> Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Education:</span>{' '}
              <span className="font-medium">{roleProfile?.education || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Area of Interest:</span>{' '}
              <span className="font-medium">{roleProfile?.area_of_interest || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Skill Level:</span>{' '}
              <span className="font-medium">{roleProfile?.skill_level || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Languages:</span>{' '}
              {roleProfile?.programming_languages?.length > 0 ? (
                <span className="inline-flex flex-wrap gap-1 ml-1">
                  {roleProfile.programming_languages.map((l: string) => (
                    <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>
                  ))}
                </span>
              ) : (
                <span className="font-medium">—</span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Education</Label>
              <Input value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} placeholder="e.g. BSc Computer Science" />
            </div>
            <div className="space-y-2">
              <Label>Area of Interest</Label>
              <Input value={form.area_of_interest} onChange={(e) => setForm({ ...form, area_of_interest: e.target.value })} placeholder="e.g. Frontend Development" />
            </div>
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <Select value={form.skill_level} onValueChange={(v) => setForm({ ...form, skill_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Programming Languages</Label>
              <div className="flex gap-2">
                <Input value={newLang} onChange={(e) => setNewLang(e.target.value)} placeholder="e.g. TypeScript"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }} />
                <Button type="button" variant="outline" size="icon" onClick={addLanguage}><Plus className="h-4 w-4" /></Button>
              </div>
              {form.programming_languages.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.programming_languages.map((l) => (
                    <Badge key={l} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => removeLanguage(l)}>
                      {l} <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}><Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}><X className="mr-1 h-4 w-4" /> Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
