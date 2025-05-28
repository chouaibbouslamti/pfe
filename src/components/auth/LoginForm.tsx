
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
});

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Keep for potential future use, though AuthProvider handles redirect
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const success = await login(values.email, values.password);
    if (success) {
      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });
      // AuthProvider handles redirection
    } else {
      toast({
        title: "Erreur de connexion",
        description: "Email ou mot de passe incorrect, ou compte inactif/non approuvé.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <Card className="w-full overflow-hidden border-none shadow-xl">
          <div className="h-2 bg-gradient-to-r from-primary to-primary/60 w-full"></div>
          <CardHeader className="space-y-1 pt-6">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-white shadow-md p-1 w-24 h-24 flex items-center justify-center">
                <img 
                  src="/logo.svg" 
                  alt="Logo Hangar Intelligent" 
                  className="w-20 h-20 object-contain" 
                />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">Connexion</CardTitle>
            <CardDescription className="text-center">Entrez vos identifiants pour accéder à votre compte.</CardDescription>
          </CardHeader>
      <CardContent className="px-6 py-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="exemple@domaine.com" 
                      className="h-10 px-3 py-2 rounded-md border border-input focus:ring-2 focus:ring-primary/30 focus:border-primary" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className="font-medium">Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="********" 
                        className="h-10 px-3 py-2 rounded-md border border-input focus:ring-2 focus:ring-primary/30 focus:border-primary"
                        {...field} 
                      />
                       <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                          {showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs font-medium" />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-colors mt-6 h-11 font-medium" 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Se connecter"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2 pb-6 pt-0 px-6">
        <p className="text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-medium text-primary hover:underline">
            S'inscrire
          </Link>
        </p>
         <p className="text-xs text-muted-foreground mt-2">
            Utilisez les identifiants de votre base de données.
        </p>
      </CardFooter>
        </Card>
      </div>
    </div>
  );
}
