import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Clock, Loader2 } from 'lucide-react';
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
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Applied!', description: 'Your application has been submitted.' });
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Projects Marketplace</h2>
        <p className="text-muted-foreground">Browse real-world coding projects and build your portfolio.</p>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No projects available yet</p>
            <p className="text-sm text-muted-foreground">Mentors and employers will post projects soon.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
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
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => applyToProject(p.id)}>
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
