
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { currentUser, loading } = useAuth(); // userProfile.isApproved is always true in mock
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        router.replace("/dashboard");
      } else {
        router.replace("/connexion");
      }
    }
  }, [currentUser, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Chargement...</p>
    </div>
  );
}
