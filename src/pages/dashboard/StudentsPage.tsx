import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Students</h2>
        <p className="text-muted-foreground">Track and support your mentees.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No students yet</p>
          <p className="text-sm text-muted-foreground">Accept mentorship requests to start mentoring.</p>
        </CardContent>
      </Card>
    </div>
  );
}
