import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Feedback & Reviews</h2>
        <p className="text-muted-foreground">See feedback from your mentors on completed projects.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Star className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No feedback yet</p>
          <p className="text-sm text-muted-foreground">Complete projects to receive mentor feedback.</p>
        </CardContent>
      </Card>
    </div>
  );
}
