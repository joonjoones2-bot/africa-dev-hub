import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FolderOpen, Clock, Loader2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  difficulty: string;
  estimated_hours: number;
  created_by: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('*').eq('status', 'open');
      setProjects((data as any) || []);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const applyToProject = async (projectId: string) => {
    if (!user) return;
    const { error } = await supabase.from('project_applications').insert({
      project_id: projectId,
      graduate_id: user.id,
      status: 'pending',
    });
    if (error) {
      if (error.code === '23505') toast({ title: 'Already applied' });
      else toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Applied!', description: 'Your application has been submitted.' });
    }
  };

  // Collect all unique skills for filter
  const allSkills = Array.from(new Set(projects.flatMap((p) => p.required_skills || [])));

  const filtered = projects.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.description?.toLowerCase().includes(search.toLowerCase());
    const matchDifficulty = difficultyFilter === 'all' || p.difficulty === difficultyFilter;
    const matchSkill = skillFilter === 'all' || p.required_skills?.includes(skillFilter);
    return matchSearch && matchDifficulty && matchSkill;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Projects Marketplace</h2>
        <p className="text-muted-foreground">Browse real-world coding projects and build your portfolio.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Difficulty" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Skill" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No projects found</p>
            <p className="text-sm text-muted-foreground">
              {projects.length === 0 ? 'Mentors and employers will post projects soon.' : 'Try adjusting your filters.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{p.title}</CardTitle>
                  <Badge variant={p.difficulty === 'Beginner' ? 'secondary' : p.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                    {p.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                <div className="flex flex-wrap gap-1">
                  {p.required_skills?.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {p.estimated_hours}h estimated
                  </span>
                  <Button size="sm" onClick={() => applyToProject(p.id)}>Apply</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
