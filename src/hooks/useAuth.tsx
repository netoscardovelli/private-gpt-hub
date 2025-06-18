import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  organization_id: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔐 Configurando auth listener...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile without causing infinite loop
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Sessão existente:', session?.user?.id || 'Nenhuma');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      console.log('🔐 Limpando auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('👤 Buscando perfil do usuário:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        return;
      }

      if (data) {
        console.log('✅ Perfil encontrado:', data);
        setProfile(data);
      } else {
        console.log('⚠️ Perfil não encontrado, criando...');
        // Se não existe perfil, criar um básico
        await createDefaultProfile(userId);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error);
    }
  };

  const createDefaultProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: 'Usuário',
          role: 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar perfil:', error);
        return;
      }

      console.log('✅ Perfil criado:', data);
      setProfile(data);
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Tentando fazer login:', email);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('✅ Login realizado:', data.user?.id);
      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!"
      });
    }

    setLoading(false);
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('🔐 Tentando criar conta:', email);
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (error) {
      console.error('❌ Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
    } else {
      console.log('✅ Conta criada:', data.user?.id);
      toast({
        title: "Conta criada!",
        description: "Você já pode fazer login."
      });
    }

    setLoading(false);
    return { error };
  };

  const signOut = async () => {
    console.log('🔐 Fazendo logout...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Erro no logout:', error);
    } else {
      console.log('✅ Logout realizado');
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso."
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } else {
      await fetchUserProfile(user.id);
      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram salvas."
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
