
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InfoPageAfterAction() {
  const { userProfile, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userProfile) {
      // If somehow user lands here without being logged in (after logout for example)
      router.push("/connexion");
    }
  }, [userProfile, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }
  
  // This page is no longer for "waiting approval" in the mock setup,
  // as users are auto-approved. It can be repurposed or simply navigated away from.
  // For now, let's assume if a user lands here, they might have just signed up.
  // Or it's an old link. We'll guide them to dashboard or login.

  if (userProfile) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Action Réussie!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Vous êtes connecté. Votre compte est actif.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 w-full">
                Aller au Tableau de Bord
            </Button>
            <Button onClick={logout} variant="outline" className="mt-2 w-full">
                Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fallback if no userProfile but not loading (e.g. after logout and browser back button)
  return (
     <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Info className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">Information</CardTitle>
          <CardDescription>
            Vous n'êtes pas connecté.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/connexion')} className="mt-6 w-full">
            Se connecter
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
