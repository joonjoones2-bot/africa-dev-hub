import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Github, Linkedin, MapPin, User } from 'lucide-react';

export default function ProfilePage() {
  const { profile, userRole } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/10 text-2xl font-bold text-secondary">
              {profile?.full_name?.[0]?.toUpperCase() || <User />}
            </div>
            <div>
              <CardTitle className="text-2xl">{profile?.full_name || 'Your Name'}</CardTitle>
              <p className="text-muted-foreground capitalize">{userRole || 'Member'}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your full profile details will appear here once loaded. Complete your profile to stand out to {userRole === 'graduate' ? 'mentors and employers' : userRole === 'mentor' ? 'graduates' : 'candidates'}.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
