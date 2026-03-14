import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, CheckCircle2, Star, Github, ExternalLink, ClipboardCheck,
} from 'lucide-react';

interface PendingCompletion {
  id: string;
  summary: string | null;
  submission_url: string | null;
  demo_url: string | null;
  created_at: string;
  graduate_id: string;
  project: { title: string; difficulty: string | null };
  graduate: { full_name: string };
}

export default function VerifyCompletionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [completions, setCompletions] = useState<PendingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [scores, setScores] = useState({ rating: 4, code: 3, comm: 3, problem: 3 });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCompletions = async () => {
    if (!user) return;
    // Get projects created by this mentor, then find submitted completions
    const { data: projects } = await supabase.from('projects').select('id').eq('created_by', user.id);
    if (!projects || projects.length === 0) { setLoading(false); return; }

    const projectIds = projects.map(p => p.id);
    const { data } = await supabase
      .from('project_completions')
      .select('*, project:projects(title, difficulty)')
      .in('project_id', projectIds)
      .eq('status', 'submitted')
      .order('created_at', { ascending: false });

    // Fetch graduate names separately
    const completionsData = (data as any) || [];
    if (completionsData.length > 0) {
      const gradIds = [...new Set(completionsData.map((c: any) => c.graduate_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', gradIds as string[]);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      completionsData.forEach((c: any) => {
        c.graduate = { full_name: profileMap.get(c.graduate_id) || 'Unknown' };
      });
    }

    setCompletions(completionsData);
    setLoading(false);
  };

  useEffect(() => { fetchCompletions(); }, [user]);

  const handleVerify = async (completionId: string) => {
    setSubmitting(true);
    const { error } = await supabase
      .from('project_completions')
      .update({
        mentor_id: user?.id,
        status: 'verified',
        mentor_rating: scores.rating,
        code_quality_score: scores.code,
        communication_score: scores.comm,
        problem_solving_score: scores.problem,
        mentor_comment: comment || null,
        verified_at: new Date().toISOString(),
      })
      .eq('id', completionId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Verified!', description: 'Project completion has been verified and added to the graduate\'s portfolio.' });
      setReviewingId(null);
      setComment('');
      setScores({ rating: 4, code: 3, comm: 3, problem: 3 });
      fetchCompletions();
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Verify Completions</h2>
        <p className="text-muted-foreground">Review and verify project submissions from your mentees.</p>
      </div>

      {completions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ClipboardCheck className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No pending submissions</p>
            <p className="text-sm text-muted-foreground">When graduates submit project work, you'll review it here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {completions.map((c) => (
            <Card key={c.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{c.project?.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Submitted by <span className="font-medium text-foreground">{(c.graduate as any)?.full_name}</span>
                    </p>
                  </div>
                  <Badge>{c.project?.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {c.summary && <p className="text-sm text-muted-foreground">{c.summary}</p>}

                <div className="flex gap-3">
                  {c.submission_url && (
                    <a href={c.submission_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-secondary hover:underline">
                      <Github className="h-4 w-4" /> View Code
                    </a>
                  )}
                  {c.demo_url && (
                    <a href={c.demo_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-secondary hover:underline">
                      <ExternalLink className="h-4 w-4" /> Live Demo
                    </a>
                  )}
                </div>

                {reviewingId === c.id ? (
                  <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                    <h4 className="font-semibold text-sm">Rate this submission</h4>
                    {[
                      { label: 'Overall Rating', key: 'rating' as const },
                      { label: 'Code Quality', key: 'code' as const },
                      { label: 'Communication', key: 'comm' as const },
                      { label: 'Problem Solving', key: 'problem' as const },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <span className="text-sm">{item.label}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} onClick={() => setScores({ ...scores, [item.key]: n })}
                              className="p-0.5">
                              <Star className={`h-5 w-5 transition-colors ${n <= scores[item.key] ? 'text-secondary fill-secondary' : 'text-muted-foreground/30'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div>
                      <label className="text-sm font-medium">Feedback Comment</label>
                      <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your feedback on this submission..."
                        className="mt-1" rows={3} />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => setReviewingId(null)}>Cancel</Button>
                      <Button size="sm" onClick={() => handleVerify(c.id)} disabled={submitting}
                        className="bg-accent text-accent-foreground hover:bg-accent/90">
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <CheckCircle2 className="mr-1 h-4 w-4" /> Verify & Approve
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setReviewingId(c.id)}
                    className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                    <Star className="mr-1 h-4 w-4" /> Review & Verify
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
