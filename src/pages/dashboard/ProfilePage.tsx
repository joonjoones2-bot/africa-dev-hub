import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Github, Linkedin, MapPin, User, Globe, Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { profile, userRole, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    country: '',
    github_url: '',
    linkedin_url: '',
  });

  const startEditing = () => {
    setForm({
      full_name: profile?.full_name || '',
      country: profile?.country || '',
      github_url: profile?.github_url || '',
      linkedin_url: profile?.linkedin_url || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        country: form.country || null,
        github_url: form.github_url || null,
        linkedin_url: form.linkedin_url || null,
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated!');
      setEditing(false);
      // Refresh profile data
      window.location.reload();
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-2xl font-bold text-secondary">
                {profile?.full_name?.[0]?.toUpperCase() || <User />}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile?.full_name || 'Your Name'}</CardTitle>
                <p className="text-muted-foreground capitalize">{userRole || 'Member'}</p>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={startEditing}>
                <Pencil className="mr-1 h-4 w-4" /> Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!editing ? (
            <>
              {profile?.country && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> {profile.country}
                </div>
              )}
              <div className="flex gap-3">
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
                    <Linkedin className="h-4 w-4" /> LinkedIn
                  </a>
                )}
              </div>
              {!profile?.country && !profile?.github_url && !profile?.linkedin_url && (
                <p className="text-sm text-muted-foreground">
                  Click "Edit" to complete your profile.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  placeholder="e.g. South Africa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="github_url">GitHub URL</Label>
                <Input
                  id="github_url"
                  value={form.github_url}
                  onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                  placeholder="https://github.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                <Input
                  id="linkedin_url"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving || !form.full_name.trim()}>
                  <Save className="mr-1 h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="mr-1 h-4 w-4" /> Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {userRole === 'graduate' && user && (
        <Card>
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-semibold">Public Portfolio</p>
              <p className="text-sm text-muted-foreground">Share your verified portfolio with employers.</p>
            </div>
            <Link to={`/portfolio/${user.id}`} target="_blank">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Globe className="mr-1 h-4 w-4" /> View Portfolio
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
