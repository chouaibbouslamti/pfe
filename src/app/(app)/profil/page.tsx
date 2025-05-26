
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Edit3, Eye, EyeOff } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis."),
  lastName: z.string().min(2, "Le nom est requis."),
  username: z.string().min(3, "Le nom d'utilisateur est requis."),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis (simulation)."),
  newPassword: z.string().min(1, "Le nouveau mot de passe est requis (simulation)."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { userProfile, currentUser, loading: authLoading, setLocalUserProfiles } = useAuth();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(userProfile?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: { // Use values to allow dynamic updates if userProfile changes
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      username: userProfile?.username || "",
      phoneNumber: userProfile?.phoneNumber || "",
    }
  });
   useEffect(() => {
    if (userProfile) {
      profileForm.reset({
        firstName: userProfile.firstName || "",
        lastName: userProfile.lastName || "",
        username: userProfile.username || "",
        phoneNumber: userProfile.phoneNumber || "",
      });
      setAvatarPreview(userProfile.photoURL || null);
    }
  }, [userProfile, profileForm]);


  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file); // Keep file for potential "upload" simulation
      setAvatarPreview(URL.createObjectURL(file)); // Show preview
    }
  };

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!currentUser || !userProfile) return;
    setLoadingProfile(true);
    // Simulate update
    const updatedProfile: UserProfile = {
        ...userProfile,
        ...values,
        photoURL: avatarPreview, // Use the preview URL as the new photoURL
    };
    // Update in local mock user list
    setLocalUserProfiles(prev => prev.map(u => u.uid === currentUser.uid ? updatedProfile : u));
    // Potentially update auth context's userProfile directly if needed for immediate reflection
    // For simplicity, relying on localUserProfiles to be the source of truth for next login
    
    toast({ title: "Profil mis à jour (simulation)", description: "Vos informations ont été sauvegardées localement." });
    setLoadingProfile(false);
  }

  async function onPasswordSubmit(_values: z.infer<typeof passwordSchema>) {
    if (!currentUser) return;
    setLoadingPassword(true);
    // Simulate password change
    toast({ title: "Mot de passe modifié (simulation)", description: "Votre mot de passe a été mis à jour (simulation)." });
    passwordForm.reset();
    setLoadingPassword(false);
  }
  
  async function handleEmailChange() {
    if (!currentUser || !newEmail || !userProfile) return;
    setLoadingEmail(true);
    // Simulate email change
    const updatedProfile: UserProfile = {
        ...userProfile,
        email: newEmail,
    };
    setLocalUserProfiles(prev => prev.map(u => u.uid === currentUser.uid ? updatedProfile : u));
    
    toast({ title: "Email modifié (simulation)", description: `Votre email a été mis à jour vers ${newEmail} (simulation).` });
    setNewEmail("");
    setLoadingEmail(false);
  }


  if (authLoading || !userProfile) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
    if (firstName) return `${firstName[0]}`.toUpperCase();
    return userProfile.email ? userProfile.email[0].toUpperCase() : "U";
  };

  return (
    <div className="container mx-auto py-2 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et paramètres de compte (simulation locale).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations Personnelles</CardTitle>
          <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={avatarPreview || `https://placehold.co/128x128.png?text=${getInitials(userProfile.firstName, userProfile.lastName)}`} alt="Avatar" data-ai-hint="profile photo" />
                  <AvatarFallback>{getInitials(userProfile.firstName, userProfile.lastName)}</AvatarFallback>
                </Avatar>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full bg-background"
                  onClick={() => fileInputRef.current?.click()}
                  title="Changer l'avatar"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleAvatarChange} 
                />
              </div>
            </div>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={profileForm.control} name="firstName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={profileForm.control} name="lastName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={profileForm.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom d'utilisateur</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={profileForm.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de téléphone</FormLabel>
                  <FormControl><Input type="tel" {...field} placeholder="Optionnel" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={loadingProfile}>
                {loadingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sauvegarder les modifications
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe actuel</FormLabel>
                  <FormControl>
                    <div className="relative">
                    <Input type={showCurrentPassword ? "text" : "password"} {...field} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowCurrentPassword(prev => !prev)}>
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                   <FormControl>
                    <div className="relative">
                    <Input type={showNewPassword ? "text" : "password"} {...field} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowNewPassword(prev => !prev)}>
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le nouveau mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                    <Input type={showConfirmPassword ? "text" : "password"} {...field} />
                    <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowConfirmPassword(prev => !prev)}>
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={loadingPassword}>
                 {loadingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Changer le mot de passe
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Adresse E-mail</CardTitle>
          <CardDescription>Votre adresse e-mail actuelle est {userProfile.email}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <Label htmlFor="newEmail">Nouvelle adresse e-mail</Label>
              <div className="flex space-x-2 mt-1">
                <Input 
                  id="newEmail" 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  placeholder="nouvel.email@example.com"
                />
                <Button onClick={handleEmailChange} disabled={loadingEmail || !newEmail}>
                  {loadingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Mettre à jour l'e-mail
                </Button>
              </div>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
