"use client";

import type { User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, db } from "@/lib/firebase/config";
import { doc, onSnapshot,setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import type { UserProfile, UserRole } from "@/types";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            const profileData = snapshot.data() as UserProfile;
            setUserProfile(profileData);
            if (!profileData.isApproved && pathname !== "/en-attente-approbation" && !pathname.startsWith("/connexion")) {
              router.push("/en-attente-approbation");
            } else if (profileData.isApproved && pathname === "/en-attente-approbation") {
              router.push("/dashboard");
            }
          } else {
            // Create a new user profile if it doesn't exist (e.g., first sign-up)
            const newUserProfile: UserProfile = {
              uid: user.uid,
              email: user.email,
              firstName: user.displayName?.split(" ")[0] || "",
              lastName: user.displayName?.split(" ")[1] || "",
              username: user.email?.split("@")[0] || `user_${user.uid.substring(0,5)}`,
              role: "USER", // Default role
              isActive: true,
              isApproved: false, // New users are not approved by default
              createdAt: serverTimestamp() as any, // Will be converted by Firestore
              lastLogin: serverTimestamp() as any,
              photoURL: user.photoURL,
            };
            await setDoc(userDocRef, newUserProfile);
            setUserProfile(newUserProfile);
            if (pathname !== "/en-attente-approbation" && !pathname.startsWith("/connexion")) {
                 router.push("/en-attente-approbation");
            }
          }
          setLoading(false);
        }, (error) => {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
          setLoading(false);
          if (!pathname.startsWith("/connexion") && pathname !== "/inscription") {
            router.push("/connexion");
          }
        });
        return () => unsubscribeSnapshot();
      } else {
        setUserProfile(null);
        setLoading(false);
        if (!pathname.startsWith("/connexion") && pathname !== "/inscription" && pathname !== "/en-attente-approbation" && pathname !== "/") {
           router.push("/connexion");
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  const logout = async () => {
    setLoading(true);
    try {
      await auth.signOut();
      setCurrentUser(null);
      setUserProfile(null);
      router.push("/connexion");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const role = userProfile?.role || null;

  if (loading && !currentUser && (pathname.startsWith('/app') || pathname === '/dashboard' || pathname === '/profil' || pathname === '/alertes' || pathname === '/interventions' || pathname === '/taches' || pathname === '/kpi' || pathname.startsWith('/admin'))) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ currentUser, userProfile, loading, role, logout }}>
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
