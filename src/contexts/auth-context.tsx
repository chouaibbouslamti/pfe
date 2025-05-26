
"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile, UserRole, MockUser, DbId } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
// Removed mockUserProfiles import, will fetch from API or use DB directly

interface AuthContextType {
  currentUser: MockUser | null; // This will hold data derived from User (DB)
  userProfile: UserProfile | null; // This is the detailed profile, might be redundant if MockUser is rich enough
  loading: boolean;
  role: UserRole | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  signup: (userData: Omit<UserProfile, 'uid' | 'id' | 'lastLogin' | 'isApproved' | 'isActive' | 'createdAt' | 'role' | 'teamId' | 'photoURL'> & {password: string}) => Promise<boolean>;
  // Ajout de la gestion des utilisateurs locaux pour le mode démo
  localUserProfiles: UserProfile[];
  setLocalUserProfiles: (users: UserProfile[]) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Import des données mockées pour le mode démo
import { mockUserProfiles } from "@/lib/mockData";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [localUserProfiles, setLocalUserProfiles] = useState<UserProfile[]>(mockUserProfiles);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Attempt to load user from session/localStorage (client-side only)
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        const parsedUser: MockUser = JSON.parse(storedUser);
        // Optionally re-validate session with backend here
        setCurrentUser(parsedUser);
        // Fetch full userProfile if needed, or ensure MockUser has all necessary fields
        setUserProfile({ // Reconstruct a basic UserProfile from MockUser
            uid: parsedUser.uid,
            id: parsedUser.id,
            email: parsedUser.email,
            firstName: parsedUser.displayName?.split(' ')[0] || '',
            lastName: parsedUser.displayName?.split(' ')[1] || '',
            username: parsedUser.displayName || '', // Or fetch proper username
            role: parsedUser.role,
            isActive: true, // Assume active if stored
            isApproved: true, // Assume approved
            createdAt: new Date(), // Placeholder
            lastLogin: new Date(), // Placeholder
            photoURL: parsedUser.photoURL,
        });

      } catch (e) {
        localStorage.removeItem("currentUser");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      const publicRoutes = ["/connexion", "/inscription"];
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

      if (!currentUser && !isPublicRoute) {
        router.replace("/connexion");
      } else if (currentUser && isPublicRoute) {
        router.replace("/dashboard");
      }
    }
  }, [currentUser, loading, router, pathname]);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await response.json();

      if (response.ok && data.user) {
        const loggedInUser: UserProfile = data.user;
        const mockUser: MockUser = {
          uid: loggedInUser.id!.toString(), // Use DB ID as string for uid
          id: loggedInUser.id!,
          email: loggedInUser.email,
          displayName: `${loggedInUser.firstName} ${loggedInUser.lastName}`,
          photoURL: loggedInUser.photoURL,
          role: loggedInUser.role,
        };
        setCurrentUser(mockUser);
        setUserProfile(loggedInUser); // Store the full profile
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        setLoading(false);
        router.push("/dashboard");
        return true;
      } else {
        console.error("Login failed:", data.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Login API error:", error);
      setLoading(false);
      return false;
    }
  };

  const signup = async (
    userData: Omit<UserProfile, 'uid' | 'id' | 'lastLogin' | 'isApproved' | 'isActive' | 'createdAt' | 'role' | 'teamId' | 'photoURL'> & {password: string}
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await response.json();

      if (response.ok && data.user) {
        const signedUpUser: UserProfile = data.user;
         const mockUser: MockUser = {
          uid: signedUpUser.id!.toString(),
          id: signedUpUser.id!,
          email: signedUpUser.email,
          displayName: `${signedUpUser.firstName} ${signedUpUser.lastName}`,
          photoURL: signedUpUser.photoURL,
          role: signedUpUser.role,
        };
        setCurrentUser(mockUser);
        setUserProfile(signedUpUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        setLoading(false);
        router.push("/dashboard");
        return true;
      } else {
         console.error("Signup failed:", data.error);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error("Signup API error:", error);
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setLoading(true);
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem("currentUser");
    // Optionally call a backend logout endpoint if session is managed server-side
    // await fetch('/api/auth/logout', { method: 'POST' });
    setLoading(false);
    router.push("/connexion");
  };

  const role = currentUser?.role || null;

  // This loading state is critical for preventing premature redirects or rendering.
  if (loading) {
     const publicRoutes = ["/connexion", "/inscription"];
     const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      // Only show loader for non-public routes if loading and no user
     if (!isPublicRoute && !currentUser) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
     }
  }


  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      userProfile, 
      loading, 
      role, 
      login, 
      logout, 
      signup, 
      localUserProfiles, 
      setLocalUserProfiles 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
