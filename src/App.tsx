import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import ProfilePage from "./pages/dashboard/ProfilePage";
import MentorsPage from "./pages/dashboard/MentorsPage";
import ProjectsPage from "./pages/dashboard/ProjectsPage";
import MyProjectsPage from "./pages/dashboard/MyProjectsPage";
import FeedbackPage from "./pages/dashboard/FeedbackPage";
import MessagesPage from "./pages/dashboard/MessagesPage";
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import MentorRequestsPage from "./pages/dashboard/MentorRequestsPage";
import CreateProjectPage from "./pages/dashboard/CreateProjectPage";
import StudentsPage from "./pages/dashboard/StudentsPage";
import DiscoverPage from "./pages/dashboard/DiscoverPage";
import PostJobPage from "./pages/dashboard/PostJobPage";
import BookmarkedPage from "./pages/dashboard/BookmarkedPage";
import SubmitProjectPage from "./pages/dashboard/SubmitProjectPage";
import VerifyCompletionsPage from "./pages/dashboard/VerifyCompletionsPage";
import PortfolioPage from "./pages/PortfolioPage";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-secondary border-t-transparent" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function DashboardRoutes() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="mentors" element={<MentorsPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="my-projects" element={<MyProjectsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="requests" element={<MentorRequestsPage />} />
          <Route path="create-project" element={<CreateProjectPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="post-job" element={<PostJobPage />} />
          <Route path="bookmarked" element={<BookmarkedPage />} />
          <Route path="submit-project" element={<SubmitProjectPage />} />
          <Route path="verify-completions" element={<VerifyCompletionsPage />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/portfolio/:userId" element={<PortfolioPage />} />
            <Route path="/dashboard/*" element={<DashboardRoutes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
