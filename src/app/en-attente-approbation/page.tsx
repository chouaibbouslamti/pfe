"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { CheckCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WaitingApprovalPage() {
  const { userProfile, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.isApproved) {
      router.push("/dashboard");
    }
    if(!loading && !userProfile) {
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
  
  if (userProfile?.isApproved) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="mt-4 text-2xl">Compte Approuvé!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Votre compte a été approuvé. Vous allez être redirigé.</p>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md text-center shadow-xl">
        <CardHeader>
           <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="mt-4 text-2xl">En attente d'approbation</CardTitle>
          <CardDescription>
            Votre compte a été créé avec succès. Un administrateur doit approuver votre demande avant que vous puissiez accéder à la plateforme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vous recevrez une notification par e-mail une fois votre compte approuvé.
            Merci de votre patience.
          </p>
          <Button onClick={logout} variant="outline" className="mt-6 w-full">
            Se déconnecter
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
