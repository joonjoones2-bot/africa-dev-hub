import { Card, CardContent } from '@/components/ui/card';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notifications</h2>
        <p className="text-muted-foreground">Stay updated on your activity.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center">
          <Bell className="h-12 w-12 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">No notifications</p>
          <p className="text-sm text-muted-foreground">You'll be notified when something important happens.</p>
        </CardContent>
      </Card>
    </div>
  );
}
