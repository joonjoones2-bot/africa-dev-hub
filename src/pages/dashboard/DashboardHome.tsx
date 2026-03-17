import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Users, Star, Briefcase, GraduationCap, Bookmark } from 'lucide-react';

export default function DashboardHome() {
  const { userRole, profile, user } = useAuth();
  const [stats, setStats] = useState<{ label: string; value: string; icon: any; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userRole) return;
    const fetchStats = async () => {
      setLoading(true);
      if (userRole === 'graduate') {
        const [apps, completions, mentorships, feedbacks] = await Promise.all([
          supabase.from('project_applications').select('id', { count: 'exact', head: true }).eq('graduate_id', user.id).eq('status', 'accepted'),
          supabase.from('project_completions').select('id', { count: 'exact', head: true }).eq('graduate_id', user.id).eq('status', 'verified'),
          supabase.from('mentorship_requests').select('id', { count: 'exact', head: true }).eq('graduate_id', user.id).eq('status', 'accepted'),
          supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('graduate_id', user.id),
        ]);
        setStats([
          { label: 'Active Projects', value: String(apps.count ?? 0), icon: FolderOpen, color: 'text-secondary' },
          { label: 'Mentors', value: String(mentorships.count ?? 0), icon: Users, color: 'text-accent' },
          { label: 'Completed Projects', value: String(completions.count ?? 0), icon: Star, color: 'text-primary' },
          { label: 'Feedback Received', value: String(feedbacks.count ?? 0), icon: Star, color: 'text-secondary' },
        ]);
      } else if (userRole === 'mentor') {
        const [mentees, projects, requests, reviews] = await Promise.all([
          supabase.from('mentorship_requests').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id).eq('status', 'accepted'),
          supabase.from('projects').select('id', { count: 'exact', head: true }).eq('created_by', user.id),
          supabase.from('mentorship_requests').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id).eq('status', 'pending'),
          supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('mentor_id', user.id),
        ]);
        setStats([
          { label: 'Active Mentees', value: String(mentees.count ?? 0), icon: GraduationCap, color: 'text-accent' },
          { label: 'Projects Posted', value: String(projects.count ?? 0), icon: FolderOpen, color: 'text-secondary' },
          { label: 'Pending Requests', value: String(requests.count ?? 0), icon: Users, color: 'text-primary' },
          { label: 'Reviews Given', value: String(reviews.count ?? 0), icon: Star, color: 'text-secondary' },
        ]);
      } else {
        const [jobs, bookmarks, applications, discovered] = await Promise.all([
          supabase.from('job_opportunities').select('id', { count: 'exact', head: true }).eq('employer_id', user.id),
          supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('employer_id', user.id),
          supabase.from('project_applications').select('id', { count: 'exact', head: true }),
          supabase.from('bookmarks').select('id', { count: 'exact', head: true }).eq('employer_id', user.id),
        ]);
        setStats([
          { label: 'Jobs Posted', value: String(jobs.count ?? 0), icon: Briefcase, color: 'text-secondary' },
          { label: 'Bookmarked Grads', value: String(bookmarks.count ?? 0), icon: Bookmark, color: 'text-accent' },
          { label: 'Applications', value: String(applications.count ?? 0), icon: GraduationCap, color: 'text-primary' },
          { label: 'Talent Discovered', value: String(discovered.count ?? 0), icon: Users, color: 'text-secondary' },
        ]);
      }
      setLoading(false);
    };
    fetchStats();
  }, [user, userRole]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {profile?.full_name || 'there'}! 👋</h2>
        <p className="text-muted-foreground">Here's what's happening on your {userRole} dashboard.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{loading ? '—' : stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            {userRole === 'graduate' && (
              <>
                <p>✅ Complete your profile with skills and education</p>
                <p>🔍 Browse available mentors and request mentorship</p>
                <p>📁 Explore the project marketplace and apply to projects</p>
                <p>🏆 Build your portfolio with completed projects</p>
              </>
            )}
            {userRole === 'mentor' && (
              <>
                <p>✅ Set up your mentor profile with your expertise</p>
                <p>📁 Create coding projects for graduates</p>
                <p>👥 Review and accept mentorship requests</p>
                <p>⭐ Provide feedback to help graduates grow</p>
              </>
            )}
            {userRole === 'employer' && (
              <>
                <p>✅ Complete your company profile</p>
                <p>🔍 Discover talented graduates with real project experience</p>
                <p>💼 Post internships and junior developer positions</p>
                <p>📌 Bookmark promising candidates for follow-up</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
