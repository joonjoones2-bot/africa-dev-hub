import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Code, Github, Linkedin, MapPin, Star, Award, ExternalLink,
  FolderOpen, Clock, Shield, ArrowLeft, User, CheckCircle2,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

interface ProfileData {
  full_name: string;
  country: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
}

interface GradProfile {
  area_of_interest: string | null;
  programming_languages: string[] | null;
  skill_level: string | null;
  education: string | null;
}

interface Completion {
  id: string;
  summary: string | null;
  submission_url: string | null;
  demo_url: string | null;
  mentor_rating: number | null;
  mentor_comment: string | null;
  code_quality_score: number | null;
  communication_score: number | null;
  problem_solving_score: number | null;
  status: string;
  verified_at: string | null;
  created_at: string;
  project: {
    title: string;
    difficulty: string | null;
    required_skills: string[] | null;
    estimated_hours: number | null;
  };
}

interface EarnedBadge {
  id: string;
  created_at: string;
  badge: {
    name: string;
    description: string | null;
    icon: string | null;
    category: string;
    difficulty: string;
  };
}

export default function PortfolioPage() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [gradProfile, setGradProfile] = useState<GradProfile | null>(null);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [badges, setBadges] = useState<EarnedBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const fetch = async () => {
      const [profileRes, gradRes, completionsRes, badgesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('graduate_profiles').select('*').eq('user_id', userId).single(),
        supabase.from('project_completions').select('*, project:projects(title, difficulty, required_skills, estimated_hours)').eq('graduate_id', userId).eq('status', 'verified').order('created_at', { ascending: false }),
        supabase.from('earned_badges').select('*, badge:skill_badges(name, description, icon, category, difficulty)').eq('graduate_id', userId).order('created_at', { ascending: false }),
      ]);

      if (!profileRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(profileRes.data as any);
      setGradProfile(gradRes.data as any);
      setCompletions((completionsRes.data as any) || []);
      setBadges((badgesRes.data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <User className="h-16 w-16 text-muted-foreground/30" />
        <h1 className="text-2xl font-bold">Portfolio Not Found</h1>
        <p className="text-muted-foreground">This user doesn't have a public portfolio.</p>
        <Link to="/"><Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Home</Button></Link>
      </div>
    );
  }

  const verifiedCount = completions.length;
  const avgRating = completions.length > 0
    ? (completions.reduce((sum, c) => sum + (c.mentor_rating || 0), 0) / completions.filter(c => c.mentor_rating).length).toFixed(1)
    : null;
  const totalHours = completions.reduce((sum, c) => sum + (c.project?.estimated_hours || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Code className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold font-[Space_Grotesk]">LinkDevs<span className="text-secondary">Org</span></span>
          </Link>
          <Link to="/signup">
            <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Join LinkDevsOrg</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        {/* Profile Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Card className="overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-primary via-secondary to-accent" />
            <CardContent className="relative pt-0 pb-6">
              <div className="flex flex-col sm:flex-row items-start gap-4 -mt-10">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-card bg-primary text-3xl font-bold text-primary-foreground shadow-lg">
                  {profile?.full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 pt-2">
                  <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    {gradProfile?.skill_level && (
                      <Badge className="bg-secondary/10 text-secondary border-secondary/20">{gradProfile.skill_level}</Badge>
                    )}
                    {profile?.country && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {profile.country}
                      </span>
                    )}
                  </div>
                  {gradProfile?.area_of_interest && (
                    <p className="mt-2 text-sm text-muted-foreground">Interested in {gradProfile.area_of_interest}</p>
                  )}
                  <div className="flex gap-3 mt-3">
                    {profile?.github_url && (
                      <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Github className="h-4 w-4" /> GitHub
                      </a>
                    )}
                    {profile?.linkedin_url && (
                      <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Linkedin className="h-4 w-4" /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Verified Projects', value: verifiedCount, icon: CheckCircle2, color: 'text-accent' },
            { label: 'Avg Rating', value: avgRating || '—', icon: Star, color: 'text-secondary' },
            { label: 'Hours Invested', value: totalHours, icon: Clock, color: 'text-primary' },
            { label: 'Badges Earned', value: badges.length, icon: Award, color: 'text-secondary' },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="flex flex-col items-center py-4 text-center">
                <s.icon className={`h-5 w-5 ${s.color} mb-1`} />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Skills */}
        {gradProfile?.programming_languages && gradProfile.programming_languages.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
            <Card>
              <CardHeader><CardTitle className="text-lg">Skills & Technologies</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {gradProfile.programming_languages.map((lang) => (
                    <Badge key={lang} variant="outline" className="px-3 py-1">{lang}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-secondary" /> Earned Badges</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {badges.map((eb) => (
                    <div key={eb.id} className="flex flex-col items-center gap-2 rounded-xl border border-border bg-muted/30 p-4 text-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10">
                        <Award className="h-5 w-5 text-secondary" />
                      </div>
                      <p className="text-sm font-semibold">{eb.badge?.name}</p>
                      <Badge variant="outline" className="text-[10px]">{eb.badge?.difficulty}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Verified Projects */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" /> Verified Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {completions.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <FolderOpen className="h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">No verified projects yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completions.map((c) => (
                    <div key={c.id} className="rounded-xl border border-border p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{c.project?.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{c.project?.difficulty}</Badge>
                            {c.project?.estimated_hours && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {c.project.estimated_hours}h
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-accent" />
                          <span className="text-xs font-medium text-accent">Verified</span>
                        </div>
                      </div>

                      {c.summary && <p className="text-sm text-muted-foreground">{c.summary}</p>}

                      {/* Scores */}
                      {c.mentor_rating && (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          {[
                            { label: 'Overall', score: c.mentor_rating },
                            { label: 'Code Quality', score: c.code_quality_score },
                            { label: 'Communication', score: c.communication_score },
                            { label: 'Problem Solving', score: c.problem_solving_score },
                          ].filter(s => s.score).map((s) => (
                            <div key={s.label} className="text-center">
                              <p className="text-xs text-muted-foreground">{s.label}</p>
                              <div className="flex items-center justify-center gap-1 mt-1">
                                <Star className="h-3 w-3 text-secondary fill-secondary" />
                                <span className="text-sm font-bold">{s.score}/5</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {c.mentor_comment && (
                        <blockquote className="border-l-2 border-secondary/30 pl-3 text-sm italic text-muted-foreground">
                          "{c.mentor_comment}"
                        </blockquote>
                      )}

                      {/* Skills used */}
                      {c.project?.required_skills && c.project.required_skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {c.project.required_skills.map((s) => (
                            <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                          ))}
                        </div>
                      )}

                      {/* Links */}
                      <div className="flex gap-3">
                        {c.submission_url && (
                          <a href={c.submission_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <Github className="h-3 w-3" /> Source Code
                          </a>
                        )}
                        {c.demo_url && (
                          <a href={c.demo_url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                            <ExternalLink className="h-3 w-3" /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">Portfolio powered by <Link to="/" className="font-semibold text-secondary hover:underline">LinkDevsOrg</Link></p>
        </div>
      </footer>
    </div>
  );
}
