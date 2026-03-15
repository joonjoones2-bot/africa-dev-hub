import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  user_id: string;
  full_name: string;
  last_message: string;
  last_at: string;
  unread: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string } | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    const loadConversations = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (!data) { setLoading(false); return; }

      const convMap = new Map<string, { last_message: string; last_at: string; unread: number }>();
      data.forEach((m: any) => {
        const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
        if (!convMap.has(otherId)) {
          convMap.set(otherId, {
            last_message: m.content,
            last_at: m.created_at,
            unread: (!m.read && m.receiver_id === user.id) ? 1 : 0,
          });
        } else if (!m.read && m.receiver_id === user.id) {
          convMap.get(otherId)!.unread++;
        }
      });

      const userIds = Array.from(convMap.keys());
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);

        const convs: Conversation[] = userIds.map((uid) => {
          const profile = profiles?.find((p: any) => p.id === uid);
          const conv = convMap.get(uid)!;
          return {
            user_id: uid,
            full_name: profile?.full_name || 'User',
            ...conv,
          };
        });
        convs.sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
        setConversations(convs);
      }
      setLoading(false);
    };
    loadConversations();
  }, [user]);

  // Load messages for selected conversation
  useEffect(() => {
    if (!user || !selectedUser) return;
    const loadMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${selectedUser.id}),and(sender_id.eq.${selectedUser.id},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      setMessages((data as Message[]) || []);

      // Mark unread as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('sender_id', selectedUser.id)
        .eq('receiver_id', user.id)
        .eq('read', false);
    };
    loadMessages();
  }, [user, selectedUser]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('messages-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          if (selectedUser && (msg.sender_id === selectedUser.id || msg.receiver_id === selectedUser.id)) {
            setMessages((prev) => [...prev, msg]);
            if (msg.receiver_id === user.id) {
              supabase.from('messages').update({ read: true }).eq('id', msg.id);
            }
          } else {
            // Update conversation list
            setConversations((prev) => {
              const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
              const existing = prev.find((c) => c.user_id === otherId);
              if (existing) {
                return prev.map((c) =>
                  c.user_id === otherId
                    ? { ...c, last_message: msg.content, last_at: msg.created_at, unread: c.unread + (msg.receiver_id === user.id ? 1 : 0) }
                    : c
                ).sort((a, b) => new Date(b.last_at).getTime() - new Date(a.last_at).getTime());
              }
              return prev;
            });
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, selectedUser]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!user || !selectedUser || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: selectedUser.id,
      content: newMessage.trim(),
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setNewMessage('');
    }
    setSending(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-muted-foreground">Chat with mentors, graduates, and employers.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[300px_1fr] h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <Card className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="space-y-1 p-2">
              {conversations.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">No conversations yet</p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.user_id}
                    onClick={() => setSelectedUser({ id: c.user_id, name: c.full_name })}
                    className={`w-full rounded-lg p-3 text-left transition-colors ${
                      selectedUser?.id === c.user_id ? 'bg-accent/10 text-foreground' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{c.full_name}</span>
                      {c.unread > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px] font-bold text-secondary-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground truncate">{c.last_message}</p>
                  </button>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>

        {/* Chat area */}
        <Card className={`${!selectedUser ? 'hidden md:flex' : 'flex'} flex-col`}>
          {selectedUser ? (
            <>
              <CardHeader className="flex flex-row items-center gap-3 pb-3 border-b border-border">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                  {selectedUser.name[0]?.toUpperCase()}
                </div>
                <CardTitle className="text-sm">{selectedUser.name}</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                        m.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}>
                        {m.content}
                        <p className={`mt-1 text-[10px] ${m.sender_id === user?.id ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
              <div className="border-t border-border p-3">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <CardContent className="flex flex-1 flex-col items-center justify-center text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/40" />
              <p className="mt-4 text-lg font-medium">Select a conversation</p>
              <p className="text-sm text-muted-foreground">Choose a conversation to start chatting.</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
