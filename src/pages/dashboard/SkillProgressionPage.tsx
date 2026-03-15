import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Award, TrendingUp, Star } from 'lucide-react';

interface SkillNode {
  skill: string;
  completedProjects: number;
  totalProjects: number;
  avgRating: number;
  badges: { name: string; difficulty: string }[];
}

export default function SkillProgressionPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const [avgOverall, setAvgOverall] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      // Get completed & verified projects
      const { data: completions } = await supabase
        .from('project_completions')
        .select('*, project:projects(title, required_skills, difficulty)')
        .eq('graduate_id', user.id)
        .eq('status', 'verified');

      // Get earned badges
      const { data: earnedBadges } = await supabase
        .from('earned_badges')
        .select('*, badge:skill_badges(name, difficulty, category)')
        .eq('graduate_id', user.id);

      if (!completions) { setLoading(false); return; }

      setTotalCompleted(completions.length);

      // Aggregate by skill
      const skillMap = new Map<string, { completed: number; total: number; ratings: number[]; badges: { name: string; difficulty: string }[] }>();

      completions.forEach((c: any) => {
        const skills = c.project?.required_skills || [];
        const rating = c.mentor_rating || 0;
        skills.forEach((s: string) => {
          if (!skillMap.has(s)) {
            skillMap.set(s, { completed: 0, total: 0, ratings: [], badges: [] });
          }
          const node = skillMap.get(s)!;
          node.completed++;
          node.total++;
          if (rating > 0) node.ratings.push(rating);
        });
      });

      // Add badges to skills
      earnedBadges?.forEach((eb: any) => {
        const category = eb.badge?.category || 'general';
        if (skillMap.has(category)) {
          skillMap.get(category)!.badges.push({ name: eb.badge?.name, difficulty: eb.badge?.difficulty });
        }
      });

      // Also get all open projects to calculate total available per skill
      const { data: allProjects } = await supabase.from('projects').select('required_skills').eq('status', 'open');
      allProjects?.forEach((p: any) => {
        p.required_skills?.forEach((s: string) => {
          if (skillMap.has(s)) {
            skillMap.get(s)!.total++;
          }
        });
      });

      const skillNodes: SkillNode[] = Array.from(skillMap.entries()).map(([skill, data]) => ({
        skill,
        completedProjects: data.completed,
        totalProjects: Math.max(data.completed, data.total),
        avgRating: data.ratings.length > 0 ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length : 0,
        badges: data.badges,
      }));

      skillNodes.sort((a, b) => b.completedProjects - a.completedProjects);
      setSkills(skillNodes);

      const allRatings = completions.filter((c: any) => c.mentor_rating).map((c: any) => c.mentor_rating);
      setAvgOverall(allRatings.length > 0 ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length : 0);

      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  const level = totalCompleted >= 10 ? 'Advanced' : totalCompleted >= 5 ? 'Intermediate' : totalCompleted >= 1 ? 'Beginner' : 'Newcomer';
  const levelColor = level === 'Advanced' ? 'text-destructive' : level === 'Intermediate' ? 'text-secondary' : level === 'Beginner' ? 'text-accent' : 'text-muted-foreground';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Skill Progression</h2>
        <p className="text-muted-foreground">Track your growth across technologies.</p>
      </div>

      {/* Overview stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
              <TrendingUp className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalCompleted}</p>
              <p className="text-xs text-muted-foreground">Verified Projects</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10">
              <Star className="h-6 w-6 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{avgOverall.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${levelColor}`}>{level}</p>
              <p className="text-xs text-muted-foreground">Overall Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skill tree */}
      {skills.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No skills tracked yet</p>
            <p className="text-sm text-muted-foreground">Complete verified projects to build your skill tree.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((s) => {
            const pct = s.totalProjects > 0 ? Math.round((s.completedProjects / s.totalProjects) * 100) : 0;
            return (
              <Card key={s.skill}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{s.skill}</CardTitle>
                    <Badge variant={pct >= 75 ? 'default' : pct >= 40 ? 'secondary' : 'outline'}>
                      {s.completedProjects} projects
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </div>
                  {s.avgRating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-secondary fill-secondary" />
                      <span className="font-medium">{s.avgRating.toFixed(1)}</span>
                      <span className="text-muted-foreground text-xs">avg mentor rating</span>
                    </div>
                  )}
                  {s.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {s.badges.map((b, i) => (
                        <Badge key={i} variant="outline" className="text-xs gap-1">
                          <Award className="h-3 w-3" /> {b.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
