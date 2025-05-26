"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.replace("/connexion");
      } else if (currentUser && !userProfile?.isApproved) {
        router.replace("/en-attente-approbation");
      }
    }
  }, [currentUser, userProfile, loading, router]);

  if (loading || !currentUser || !userProfile?.isApproved) {
    // Show a loading spinner or a minimal layout while checking auth
    // or if user is not approved yet and not on the waiting page
    if (loading || (!currentUser && pathname !== "/en-attente-approbation" && !pathname.startsWith("/connexion"))) {
       return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }
    // If not loading and user is not approved, they should be on /en-attente-approbation
    // which has its own layout. Or if no current user, they should be on /connexion.
    // This check is to prevent rendering the app layout for unapproved/unauthed users.
    if (!userProfile?.isApproved && pathname !== "/en-attente-approbation") {
       return null; // Or redirect, but AuthProvider and HomePage already handle it.
    }
  }
  
  // If user is approved, render the app layout
  if (currentUser && userProfile?.isApproved) {
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
  
  // Fallback for edge cases, though ideally handled by redirects.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
