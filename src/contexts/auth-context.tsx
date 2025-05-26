
"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { UserProfile, UserRole, MockUser } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { mockUserProfiles } from "@/lib/mockData"; // Import mock users

interface AuthContextType {
  currentUser: MockUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  login: (email: string, pass: string) => Promise<boolean>; // Pass a role for mock login
  logout: () => Promise<void>;
  signup: (userData: Omit<UserProfile, 'uid' | 'lastLogin' | 'isApproved' | 'isActive' | 'createdAt' | 'role'> & {password: string}) => Promise<boolean>;
  localUserProfiles: UserProfile[]; // To manage users locally for signup demo
  setLocalUserProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Function to get mock user profile by email (simple simulation)
const findMockUserByEmail = (email: string, localUsers: UserProfile[]): UserProfile | undefined => {
  return localUsers.find(p => p.email?.toLowerCase() === email.toLowerCase());
};


export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [localUserProfiles, setLocalUserProfiles] = useState<UserProfile[]>(mockUserProfiles);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for a logged-in user from localStorage (optional persistence)
    const storedUser = localStorage.getItem("mockCurrentUser");
    const storedProfile = localStorage.getItem("mockUserProfile");
    if (storedUser && storedProfile) {
      try {
        setCurrentUser(JSON.parse(storedUser));
        setUserProfile(JSON.parse(storedProfile));
      } catch (e) {
        // Clear corrupted data
        localStorage.removeItem("mockCurrentUser");
        localStorage.removeItem("mockUserProfile");
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!currentUser && !pathname.startsWith("/connexion") && pathname !== "/inscription") {
        router.replace("/connexion");
      } else if (currentUser && (pathname.startsWith("/connexion") || pathname === "/inscription")) {
        router.replace("/dashboard");
      }
    }
  }, [currentUser, loading, router, pathname]);


  const login = async (email: string, _pass: string): Promise<boolean> => {
    setLoading(true);
    const profile = findMockUserByEmail(email, localUserProfiles);
    if (profile && profile.isActive && profile.isApproved) {
      const mockUser: MockUser = {
        uid: profile.uid,
        email: profile.email,
        displayName: `${profile.firstName} ${profile.lastName}`,
        photoURL: profile.photoURL,
      };
      setCurrentUser(mockUser);
      setUserProfile(profile);
      localStorage.setItem("mockCurrentUser", JSON.stringify(mockUser));
      localStorage.setItem("mockUserProfile", JSON.stringify(profile));
      setLoading(false);
      router.push("/dashboard");
      return true;
    }
    setLoading(false);
    return false;
  };

  const signup = async (
    userData: Omit<UserProfile, 'uid' | 'lastLogin' | 'isApproved' | 'isActive' | 'createdAt' | 'role' | 'photoURL'> & {password: string}
  ): Promise<boolean> => {
    setLoading(true);
    const existingUser = findMockUserByEmail(userData.email!, localUserProfiles);
    if (existingUser) {
      setLoading(false);
      return false; // User already exists
    }

    const newUserUid = `user-${Date.now()}`;
    const newUserProfile: UserProfile = {
      ...userData,
      uid: newUserUid,
      role: "USER", // Default role
      isActive: true,
      isApproved: true, // Auto-approve for local demo
      createdAt: new Date(),
      lastLogin: new Date(),
      photoURL: `https://placehold.co/100x100.png?text=${userData.firstName[0]}${userData.lastName[0]}`,
    };

    setLocalUserProfiles(prev => [...prev, newUserProfile]);
    
    // Auto-login after signup for demo purposes
    const mockUser: MockUser = {
      uid: newUserProfile.uid,
      email: newUserProfile.email,
      displayName: `${newUserProfile.firstName} ${newUserProfile.lastName}`,
      photoURL: newUserProfile.photoURL,
    };
    setCurrentUser(mockUser);
    setUserProfile(newUserProfile);
    localStorage.setItem("mockCurrentUser", JSON.stringify(mockUser));
    localStorage.setItem("mockUserProfile", JSON.stringify(newUserProfile));
    
    setLoading(false);
    router.push("/dashboard"); // Or a "welcome" page if preferred
    return true;
  };


  const logout = async () => {
    setLoading(true);
    setCurrentUser(null);
    setUserProfile(null);
    localStorage.removeItem("mockCurrentUser");
    localStorage.removeItem("mockUserProfile");
    setLoading(false);
    router.push("/connexion");
  };
  
  const role = userProfile?.role || null;

  if (loading && !currentUser && (pathname.startsWith('/app') || pathname === '/dashboard' || pathname.startsWith('/admin') || pathname === '/profil' || pathname === '/alertes' || pathname === '/interventions' || pathname === '/taches' || pathname === '/kpi')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, role, login, logout, signup, localUserProfiles, setLocalUserProfiles }}>
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
