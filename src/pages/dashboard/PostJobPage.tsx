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

export default function PostJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [skills, setSkills] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('job_opportunities').insert({
      title,
      description,
      type,
      required_skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
      location,
      employer_id: user.id,
      status: 'open',
    });

    setLoading(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Job posted!' });
      navigate('/dashboard');
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Post an Opportunity</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="e.g. Junior Frontend Developer" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe the role..." value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="junior">Junior Position</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="Remote / Lagos..." value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Required Skills (comma separated)</Label>
              <Input placeholder="React, Python..." value={skills} onChange={(e) => setSkills(e.target.value)} />
            </div>
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post Opportunity
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
