
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "Le prénom doit contenir au moins 2 caractères." }),
  lastName: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères." }), // Adjusted for better practice
  confirmPassword: z.string(),
  phoneNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { signup } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
    },
  });

  const [emailError, setEmailError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Vérification de disponibilité d'email
  const checkEmailAvailability = async (email: string) => {
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      
      if (!response.ok) {
        setEmailError(data.error || "Erreur lors de la vérification de l'email");
        return false;
      }
      
      if (data.exists) {
        setEmailError("Cet email est déjà utilisé");
        return false;
      }
      
      setEmailError(null);
      return true;
    } catch (error) {
      console.error("Error checking email availability:", error);
      return true; // En cas d'erreur, on laisse continuer l'inscription
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setEmailError(null);
    setUsernameError(null);
    
    // Vérifier la disponibilité de l'email avant l'inscription
    const emailAvailable = await checkEmailAvailability(values.email);
    if (!emailAvailable) {
      setLoading(false);
      form.setError("email", { 
        type: "manual", 
        message: "Cet email est déjà utilisé" 
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signupData } = values; 
    
    try {
      const success = await signup(signupData);

      if (success) {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé et vous êtes connecté.",
        });
        // AuthProvider handles redirection
      } else {
        // Gérer le cas où l'inscription échoue
        toast({
          title: "Erreur d'inscription",
          description: "Impossible de créer le compte. Veuillez vérifier vos informations.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Vérifier le type d'erreur
      if (error.message && error.message.includes("Email already exists")) {
        setEmailError("Cet email est déjà utilisé");
        form.setError("email", { 
          type: "manual", 
          message: "Cet email est déjà utilisé" 
        });
      } else if (error.message && error.message.includes("Username already exists")) {
        setUsernameError("Ce nom d'utilisateur est déjà utilisé");
        form.setError("username", { 
          type: "manual", 
          message: "Ce nom d'utilisateur est déjà utilisé" 
        });
      } else {
        toast({
          title: "Erreur d'inscription",
          description: "Une erreur s'est produite lors de l'inscription. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <Card className="w-full overflow-hidden border-none shadow-xl">
          <div className="h-2 bg-gradient-to-r from-primary/60 to-primary w-full"></div>
          <CardHeader className="space-y-1 pt-6">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold">Inscription</CardTitle>
            <CardDescription className="text-center">Créez votre compte utilisateur.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Prénom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Jean" 
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
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="font-medium">Nom</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Dupont" 
                            className="h-10 px-3 py-2 rounded-md border border-input focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="jeandupont" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Numéro de téléphone (Optionnel)</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
                          placeholder="0612345678" 
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
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="font-medium">Confirmer le mot de passe</FormLabel>
                      <FormControl>
                         <div className="relative">
                          <Input 
                            type={showConfirmPassword ? "text" : "password"} 
                            placeholder="********" 
                            className="h-10 px-3 py-2 rounded-md border border-input focus:ring-2 focus:ring-primary/30 focus:border-primary"
                            {...field} 
                          />
                           <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Eye className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span className="sr-only">
                              {showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "S'inscrire"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 pb-6 pt-0 px-6">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{" "}
              <Link href="/connexion" className="font-medium text-primary hover:underline">
                Se connecter
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
