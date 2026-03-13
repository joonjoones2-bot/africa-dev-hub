import { Card, CardContent } from '@/components/ui/card';
import { Bookmark } from 'lucide-react';

export default function BookmarkedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bookmarked Graduates</h2>
        <p className="text-muted-foreground">Candidates you're following.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Bookmark className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No bookmarks yet</p>
          <p className="text-sm text-muted-foreground">Discover talent and bookmark promising graduates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
