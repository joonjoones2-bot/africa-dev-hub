import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Mentor {
  user_id: string;
  years_of_experience: number;
  specializations: string[];
  profile?: { full_name: string; country: string; github_url: string };
}

export default function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMentors = async () => {
      const { data } = await supabase
        .from('mentor_profiles')
        .select('*, profile:profiles!mentor_profiles_user_id_fkey(full_name, country, github_url)');
      setMentors((data as any) || []);
      setLoading(false);
    };
    fetchMentors();
  }, []);

  const requestMentorship = async (mentorId: string) => {
    if (!user) return;
    const { error } = await supabase.from('mentorship_requests').insert({
      graduate_id: user.id,
      mentor_id: mentorId,
      status: 'pending',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Request sent!', description: 'The mentor will review your request.' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Available Mentors</h2>
        <p className="text-muted-foreground">Connect with experienced developers to guide your journey.</p>
      </div>

      {mentors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No mentors available yet</p>
            <p className="text-sm text-muted-foreground">Check back soon as more mentors join the platform.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((m) => (
            <Card key={m.user_id}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-sm font-bold text-secondary">
                    {(m.profile as any)?.full_name?.[0] || '?'}
                  </div>
                  <div>
                    <CardTitle className="text-base">{(m.profile as any)?.full_name || 'Mentor'}</CardTitle>
                    <p className="text-xs text-muted-foreground">{m.years_of_experience} years experience</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {m.specializations?.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <Button size="sm" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={() => requestMentorship(m.user_id)}>
                  Request Mentorship
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
