import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Bookmark, Loader2 } from 'lucide-react';

export default function DiscoverPage() {
  const [graduates, setGraduates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('graduate_profiles')
        .select('*, profile:profiles!graduate_profiles_user_id_fkey(full_name, country, github_url)');
      setGraduates(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const bookmarkGraduate = async (graduateId: string) => {
    if (!user) return;
    const { error } = await supabase.from('bookmarks').insert({
      employer_id: user.id,
      graduate_id: graduateId,
    });
    if (error?.code === '23505') {
      toast({ title: 'Already bookmarked' });
    } else if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Bookmarked!' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Discover Talent</h2>
        <p className="text-muted-foreground">Browse graduates with real project experience.</p>
      </div>

      {graduates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No graduates yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {graduates.map((g) => (
            <Card key={g.user_id}>
              <CardHeader>
                <CardTitle className="text-base">{g.profile?.full_name || 'Graduate'}</CardTitle>
                <p className="text-xs text-muted-foreground">{g.profile?.country} · {g.skill_level}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{g.area_of_interest}</p>
                <div className="flex flex-wrap gap-1">
                  {g.programming_languages?.map((l: string) => (
                    <Badge key={l} variant="outline" className="text-xs">{l}</Badge>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => bookmarkGraduate(g.user_id)}>
                  <Bookmark className="mr-1 h-4 w-4" /> Bookmark
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
