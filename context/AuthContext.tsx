import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { router } from "expo-router";

const REQUIRED_ROLE = "user";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserAndSetSession = async (session: Session | null) => {
    if (session?.user) {
      const { is_blocked, role } = session.user.app_metadata as {
        is_blocked?: boolean;
        role?: string;
      };

      if (is_blocked) {
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      if (role !== REQUIRED_ROLE) {
        await supabase.auth.signOut();
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(session.user);
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    // ✅ Restore session on app load
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Restored session:", session?.user); // DEBUG
      checkUserAndSetSession(session);
    });

    // ✅ Listen for session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth changed:", session?.user); // DEBUG
      checkUserAndSetSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { data, error };

    if (data.user) {
      const { is_blocked, role } = data.user.app_metadata as {
        is_blocked?: boolean;
        role?: string;
      };

      if (role !== REQUIRED_ROLE) {
        await supabase.auth.signOut();
        return {
          data: null,
          error: { message: "Access denied" },
        };
      }

      if (is_blocked) {
        await supabase.auth.signOut();
        return {
          data: null,
          error: { message: "This account has been blocked." },
        };
      }
    }

    return { data, error };
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp: (email, password) => supabase.auth.signUp({ email, password }),
    signIn,
    signOut: async () => {
      await supabase.auth.signOut();
      router.replace("/(public)/Login");
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
