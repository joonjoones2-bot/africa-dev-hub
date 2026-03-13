import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-muted-foreground">Chat with mentors, graduates, and employers.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground">Start a conversation by connecting with someone.</p>
        </CardContent>
      </Card>
    </div>
  );
}
