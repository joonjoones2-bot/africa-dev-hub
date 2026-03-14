import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FolderOpen, CheckCircle2, Clock } from 'lucide-react';

interface Application {
  id: string;
  project_id: string;
  status: string;
  project: {
    id: string;
    title: string;
    difficulty: string | null;
    estimated_hours: number | null;
  };
}

interface ExistingCompletion {
  project_id: string;
  status: string;
}

export default function SubmitProjectPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [existingCompletions, setExistingCompletions] = useState<ExistingCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFor, setSubmittingFor] = useState<string | null>(null);
  const [form, setForm] = useState({ summary: '', submission_url: '', demo_url: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [appsRes, completionsRes] = await Promise.all([
        supabase.from('project_applications').select('*, project:projects(id, title, difficulty, estimated_hours)').eq('graduate_id', user.id),
        supabase.from('project_completions').select('project_id, status').eq('graduate_id', user.id),
      ]);
      setApplications((appsRes.data as any) || []);
      setExistingCompletions((completionsRes.data as any) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const getCompletionStatus = (projectId: string) => {
    return existingCompletions.find(c => c.project_id === projectId);
  };

  const handleSubmit = async (projectId: string) => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('project_completions').insert({
      project_id: projectId,
      graduate_id: user.id,
      summary: form.summary || null,
      submission_url: form.submission_url || null,
      demo_url: form.demo_url || null,
      status: 'submitted',
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Submitted!', description: 'Your project has been submitted for mentor review.' });
      setSubmittingFor(null);
      setForm({ summary: '', submission_url: '', demo_url: '' });
      // Refresh completions
      const { data } = await supabase.from('project_completions').select('project_id, status').eq('graduate_id', user.id);
      setExistingCompletions((data as any) || []);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Submit Project Work</h2>
        <p className="text-muted-foreground">Submit your completed projects for mentor verification.</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No project applications yet</p>
            <p className="text-sm text-muted-foreground">Apply to projects first, then submit your work here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const completion = getCompletionStatus(app.project_id);
            return (
              <Card key={app.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{app.project?.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{app.project?.difficulty}</Badge>
                        {app.project?.estimated_hours && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {app.project.estimated_hours}h
                          </span>
                        )}
                      </div>
                    </div>
                    {completion && (
                      <Badge className={completion.status === 'verified'
                        ? 'bg-accent/10 text-accent border-accent/20'
                        : 'bg-secondary/10 text-secondary border-secondary/20'}>
                        {completion.status === 'verified' ? (
                          <><CheckCircle2 className="mr-1 h-3 w-3" /> Verified</>
                        ) : (
                          <><Clock className="mr-1 h-3 w-3" /> Pending Review</>
                        )}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {completion ? (
                    <p className="text-sm text-muted-foreground">
                      {completion.status === 'verified' ? 'This project has been verified and added to your portfolio!' : 'Awaiting mentor review.'}
                    </p>
                  ) : submittingFor === app.project_id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium">Summary of Work</label>
                        <Textarea value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })}
                          placeholder="Describe what you built and what you learned..." rows={3} className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">GitHub / Source URL</label>
                        <Input value={form.submission_url} onChange={(e) => setForm({ ...form, submission_url: e.target.value })}
                          placeholder="https://github.com/..." className="mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Live Demo URL (optional)</label>
                        <Input value={form.demo_url} onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                          placeholder="https://..." className="mt-1" />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => setSubmittingFor(null)}>Cancel</Button>
                        <Button size="sm" onClick={() => handleSubmit(app.project_id)} disabled={submitting}
                          className="bg-accent text-accent-foreground hover:bg-accent/90">
                          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <Upload className="mr-1 h-4 w-4" /> Submit
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" onClick={() => setSubmittingFor(app.project_id)}
                      className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                      <Upload className="mr-1 h-4 w-4" /> Submit Work
                    </Button>
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
