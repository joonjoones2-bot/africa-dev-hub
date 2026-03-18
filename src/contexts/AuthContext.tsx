import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type UserRole = 'graduate' | 'mentor' | 'employer';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  profile: any | null;
  roleProfile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userRole: null,
  profile: null,
  roleProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [roleProfile, setRoleProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    const role = roleData?.role as UserRole | undefined;
    if (role) setUserRole(role);

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileData) setProfile(profileData);

    // Fetch role-specific profile
    if (role === 'graduate') {
      const { data } = await supabase.from('graduate_profiles').select('*').eq('user_id', userId).single();
      setRoleProfile(data);
    } else if (role === 'mentor') {
      const { data } = await supabase.from('mentor_profiles').select('*').eq('user_id', userId).single();
      setRoleProfile(data);
    } else if (role === 'employer') {
      const { data } = await supabase.from('employer_profiles').select('*').eq('user_id', userId).single();
      setRoleProfile(data);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setUserRole(null);
          setProfile(null);
          setRoleProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setUserRole(null);
    setProfile(null);
    setRoleProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, userRole, profile, roleProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
