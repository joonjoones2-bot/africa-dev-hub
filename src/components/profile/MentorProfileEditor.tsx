import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X, Plus, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function MentorProfileEditor() {
  const { user, roleProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSpec, setNewSpec] = useState('');
  const [form, setForm] = useState({
    bio: '',
    years_of_experience: 0,
    specializations: [] as string[],
  });

  const startEditing = () => {
    setForm({
      bio: roleProfile?.bio || '',
      years_of_experience: roleProfile?.years_of_experience || 0,
      specializations: roleProfile?.specializations || [],
    });
    setEditing(true);
  };

  const addSpec = () => {
    const s = newSpec.trim();
    if (s && !form.specializations.includes(s)) {
      setForm({ ...form, specializations: [...form.specializations, s] });
      setNewSpec('');
    }
  };

  const removeSpec = (s: string) => {
    setForm({ ...form, specializations: form.specializations.filter((x) => x !== s) });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('mentor_profiles')
      .update({
        bio: form.bio || null,
        years_of_experience: form.years_of_experience,
        specializations: form.specializations,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error('Failed to update mentor profile');
    } else {
      toast.success('Mentor profile updated!');
      setEditing(false);
      await refreshProfile();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BookOpen className="h-5 w-5 text-primary" /> Mentor Details
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
              <span className="text-muted-foreground">Bio:</span>{' '}
              <span className="font-medium">{roleProfile?.bio || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Experience:</span>{' '}
              <span className="font-medium">{roleProfile?.years_of_experience || 0} years</span>
            </div>
            <div>
              <span className="text-muted-foreground">Specializations:</span>{' '}
              {roleProfile?.specializations?.length > 0 ? (
                <span className="inline-flex flex-wrap gap-1 ml-1">
                  {roleProfile.specializations.map((s: string) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
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
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell graduates about yourself..." rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Years of Experience</Label>
              <Input type="number" min={0} value={form.years_of_experience} onChange={(e) => setForm({ ...form, years_of_experience: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-2">
              <Label>Specializations</Label>
              <div className="flex gap-2">
                <Input value={newSpec} onChange={(e) => setNewSpec(e.target.value)} placeholder="e.g. React"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSpec(); } }} />
                <Button type="button" variant="outline" size="icon" onClick={addSpec}><Plus className="h-4 w-4" /></Button>
              </div>
              {form.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {form.specializations.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs gap-1 cursor-pointer" onClick={() => removeSpec(s)}>
                      {s} <X className="h-3 w-3" />
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
