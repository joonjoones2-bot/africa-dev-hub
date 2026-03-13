import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function CreateProjectPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [hours, setHours] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('projects').insert({
      title,
      description,
      required_skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty,
      estimated_hours: parseInt(hours) || 0,
      created_by: user.id,
      status: 'open',
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Project created!' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project Title</Label>
              <Input placeholder="e.g. Build a REST API" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the project..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
            </div>
            <div className="space-y-2">
              <Label>Required Skills (comma separated)</Label>
              <Input placeholder="React, TypeScript, Node.js" value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Hours</Label>
                <Input type="number" min="1" placeholder="e.g. 20" value={hours} onChange={(e) => setHours(e.target.value)} />
              </div>
            </div>
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Create Project
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
