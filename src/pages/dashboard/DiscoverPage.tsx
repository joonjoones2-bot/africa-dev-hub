import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Search, Bookmark, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiscoverPage() {
  const [graduates, setGraduates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('graduate_profiles')
        .select('*');

      if (data && data.length > 0) {
        const userIds = data.map((g: any) => g.user_id);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, country, github_url')
          .in('id', userIds);

        const merged = data.map((g: any) => ({
          ...g,
          profile: profiles?.find((p: any) => p.id === g.user_id) || null,
        }));
        setGraduates(merged);
      }
      setLoading(false);
    };
    load();
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

  const allSkills = Array.from(new Set(graduates.flatMap((g) => g.programming_languages || [])));

  const filtered = graduates.filter((g) => {
    const matchSearch = !search || g.profile?.full_name?.toLowerCase().includes(search.toLowerCase()) || g.area_of_interest?.toLowerCase().includes(search.toLowerCase());
    const matchSkill = skillFilter === 'all' || g.programming_languages?.includes(skillFilter);
    const matchLevel = levelFilter === 'all' || g.skill_level === levelFilter;
    return matchSearch && matchSkill && matchLevel;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Discover Talent</h2>
        <p className="text-muted-foreground">Browse graduates with real project experience.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name or interest..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Skill" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No graduates found</p>
            <p className="text-sm text-muted-foreground">
              {graduates.length === 0 ? 'No graduates have signed up yet.' : 'Try adjusting your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((g) => (
            <Card key={g.user_id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{g.profile?.full_name || 'Graduate'}</CardTitle>
                    <p className="text-xs text-muted-foreground">{g.profile?.country} · {g.skill_level}</p>
                  </div>
                  <Link to={`/portfolio/${g.user_id}`} target="_blank">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
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
