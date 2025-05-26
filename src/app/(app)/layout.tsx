
"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, loading } = useAuth(); // isApproved is handled by mock context
  const router = useRouter();
  const pathname = usePathname(); // Keep pathname for other logic if needed

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace("/connexion");
      }
      // No need to check for isApproved as mock users are always approved
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    // Show a loading spinner or a minimal layout while checking auth
    if (loading || (!currentUser && !pathname.startsWith("/connexion") && pathname !== "/inscription")) {
       return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
  }
  
  // If user is "authenticated" via mock context
  if (currentUser && userProfile) {
    return (
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8 bg-slate-100">
                {children}
            </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // Fallback for edge cases, though ideally handled by redirects in AuthProvider.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
