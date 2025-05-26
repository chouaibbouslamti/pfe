"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { currentUser, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (currentUser) {
        if (userProfile?.isApproved) {
          router.replace("/dashboard");
        } else {
          router.replace("/en-attente-approbation");
        }
      } else {
        router.replace("/connexion");
      }
    }
  }, [currentUser, userProfile, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-4 text-lg">Chargement...</p>
    </div>
  );
}
