import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Code, LogOut, Menu, X, Home, User, Users, Briefcase, FolderOpen,
  MessageSquare, Bell, Star, GraduationCap, PlusCircle, Bookmark, Search,
  Upload, ClipboardCheck, Globe,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: any;
}

const graduateNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'My Profile', path: '/dashboard/profile', icon: User },
  { label: 'Find Mentors', path: '/dashboard/mentors', icon: Users },
  { label: 'Projects', path: '/dashboard/projects', icon: FolderOpen },
  { label: 'My Projects', path: '/dashboard/my-projects', icon: Briefcase },
  { label: 'Submit Work', path: '/dashboard/submit-project', icon: Upload },
  { label: 'Feedback', path: '/dashboard/feedback', icon: Star },
  { label: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
];

const mentorNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'My Profile', path: '/dashboard/profile', icon: User },
  { label: 'Requests', path: '/dashboard/requests', icon: GraduationCap },
  { label: 'Create Project', path: '/dashboard/create-project', icon: PlusCircle },
  { label: 'My Students', path: '/dashboard/students', icon: Users },
  { label: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
];

const employerNav: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Discover Talent', path: '/dashboard/discover', icon: Search },
  { label: 'Post Opportunity', path: '/dashboard/post-job', icon: PlusCircle },
  { label: 'Bookmarked', path: '/dashboard/bookmarked', icon: Bookmark },
  { label: 'Messages', path: '/dashboard/messages', icon: MessageSquare },
  { label: 'Notifications', path: '/dashboard/notifications', icon: Bell },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { userRole, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = userRole === 'mentor' ? mentorNav : userRole === 'employer' ? employerNav : graduateNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <Code className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <span className="font-bold text-sidebar-foreground font-[Space_Grotesk]">LinkDevs<span className="text-sidebar-primary">Org</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'}`}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 truncate">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-sidebar-foreground/50 capitalize">{userRole || 'member'}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}
            className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold capitalize">
            {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
