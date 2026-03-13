import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderOpen, Users, Star, Briefcase, GraduationCap, Bookmark } from 'lucide-react';

export default function DashboardHome() {
  const { userRole, profile } = useAuth();

  const graduateStats = [
    { label: 'Active Projects', value: '0', icon: FolderOpen, color: 'text-secondary' },
    { label: 'Mentors', value: '0', icon: Users, color: 'text-accent' },
    { label: 'Completed Projects', value: '0', icon: Star, color: 'text-primary' },
    { label: 'Feedback Received', value: '0', icon: Star, color: 'text-secondary' },
  ];

  const mentorStats = [
    { label: 'Active Mentees', value: '0', icon: GraduationCap, color: 'text-accent' },
    { label: 'Projects Posted', value: '0', icon: FolderOpen, color: 'text-secondary' },
    { label: 'Pending Requests', value: '0', icon: Users, color: 'text-primary' },
    { label: 'Reviews Given', value: '0', icon: Star, color: 'text-secondary' },
  ];

  const employerStats = [
    { label: 'Jobs Posted', value: '0', icon: Briefcase, color: 'text-secondary' },
    { label: 'Bookmarked Grads', value: '0', icon: Bookmark, color: 'text-accent' },
    { label: 'Applications', value: '0', icon: GraduationCap, color: 'text-primary' },
    { label: 'Talent Discovered', value: '0', icon: Users, color: 'text-secondary' },
  ];

  const stats = userRole === 'mentor' ? mentorStats : userRole === 'employer' ? employerStats : graduateStats;

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
              <p className="text-3xl font-bold">{stat.value}</p>
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
