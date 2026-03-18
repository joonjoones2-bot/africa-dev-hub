import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, X, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function EmployerProfileEditor() {
  const { user, roleProfile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    company_name: '',
    industry: '',
    company_website: '',
  });

  const startEditing = () => {
    setForm({
      company_name: roleProfile?.company_name || '',
      industry: roleProfile?.industry || '',
      company_website: roleProfile?.company_website || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user || !form.company_name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from('employer_profiles')
      .update({
        company_name: form.company_name,
        industry: form.industry || null,
        company_website: form.company_website || null,
      })
      .eq('user_id', user.id);

    setSaving(false);
    if (error) {
      toast.error('Failed to update employer profile');
    } else {
      toast.success('Employer profile updated!');
      setEditing(false);
      await refreshProfile();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="h-5 w-5 text-secondary" /> Company Details
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
              <span className="text-muted-foreground">Company:</span>{' '}
              <span className="font-medium">{roleProfile?.company_name || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Industry:</span>{' '}
              <span className="font-medium">{roleProfile?.industry || '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Website:</span>{' '}
              {roleProfile?.company_website ? (
                <a href={roleProfile.company_website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                  {roleProfile.company_website}
                </a>
              ) : (
                <span className="font-medium">—</span>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Company Name</Label>
              <Input value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Your company name" />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. FinTech" />
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })} placeholder="https://yourcompany.com" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving || !form.company_name.trim()}><Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditing(false)}><X className="mr-1 h-4 w-4" /> Cancel</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
