import { Card, CardContent } from '@/components/ui/card';
import { FolderOpen } from 'lucide-react';

export default function MyProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Projects</h2>
        <p className="text-muted-foreground">Track your active and completed projects.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No projects yet</p>
          <p className="text-sm text-muted-foreground">Apply to projects in the marketplace to get started.</p>
        </CardContent>
      </Card>
    </div>
  );
}
