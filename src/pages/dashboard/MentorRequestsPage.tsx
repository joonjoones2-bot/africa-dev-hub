import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2, Check, X } from 'lucide-react';

export default function MentorRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchRequests = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('mentorship_requests')
      .select('*, graduate:profiles!mentorship_requests_graduate_id_fkey(full_name, country)')
      .eq('mentor_id', user.id)
      .eq('status', 'pending');
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, [user]);

  const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('mentorship_requests').update({ status }).eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: status === 'accepted' ? 'Accepted!' : 'Declined' });
      fetchRequests();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Mentorship Requests</h2>
        <p className="text-muted-foreground">Review requests from graduates seeking your guidance.</p>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground/40" />
            <p className="mt-4 text-lg font-medium">No pending requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="font-medium">{r.graduate?.full_name || 'Graduate'}</p>
                  <p className="text-sm text-muted-foreground">{r.graduate?.country}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAction(r.id, 'rejected')}>
                    <X className="mr-1 h-4 w-4" /> Decline
                  </Button>
                  <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90"
                    onClick={() => handleAction(r.id, 'accepted')}>
                    <Check className="mr-1 h-4 w-4" /> Accept
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
