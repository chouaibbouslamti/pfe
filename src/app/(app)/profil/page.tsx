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
import { doc, updateDoc } from "firebase/firestore";
import { db, storage, auth as firebaseAuth } from "@/lib/firebase/config"; // Renamed auth to firebaseAuth to avoid conflict
import { updatePassword, updateEmail as firebaseUpdateEmail } from "firebase/auth"; // Renamed updateEmail to firebaseUpdateEmail
import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Edit3, Eye, EyeOff } from "lucide-react";

const profileSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis."),
  lastName: z.string().min(2, "Le nom est requis."),
  username: z.string().min(3, "Le nom d'utilisateur est requis."),
  phoneNumber: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Mot de passe actuel requis."),
  newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères."),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

export default function ProfilePage() {
  const { userProfile, currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      firstName: userProfile?.firstName || "",
      lastName: userProfile?.lastName || "",
      username: userProfile?.username || "",
      phoneNumber: userProfile?.phoneNumber || "",
    }
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  
  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!currentUser) return;
    setLoadingProfile(true);
    try {
      let photoURL = userProfile?.photoURL;
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${currentUser.uid}/${avatarFile.name}`);
        await uploadBytes(storageRef, avatarFile);
        photoURL = await getDownloadURL(storageRef);
      }

      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { ...values, photoURL });
      toast({ title: "Profil mis à jour", description: "Vos informations ont été sauvegardées." });
    } catch (error) {
      console.error(error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le profil.", variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if (!currentUser) return;
    setLoadingPassword(true);
    // Re-authentication might be needed for password change, this is simplified
    try {
      // This is a simplified version. For production, re-authenticate user first.
      // const credential = EmailAuthProvider.credential(currentUser.email!, values.currentPassword);
      // await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, values.newPassword);
      passwordForm.reset();
      toast({ title: "Mot de passe modifié", description: "Votre mot de passe a été mis à jour." });
    } catch (error: any) {
      console.error(error);
      let message = "Impossible de modifier le mot de passe.";
      if (error.code === 'auth/wrong-password') message = "Mot de passe actuel incorrect.";
      if (error.code === 'auth/requires-recent-login') message = "Veuillez vous reconnecter pour modifier votre mot de passe.";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoadingPassword(false);
    }
  }
  
  // Email change functionality is complex due to re-authentication and verification.
  // Simplified version:
  async function handleEmailChange() {
    if (!currentUser || !newEmail) return;
    setLoadingEmail(true);
    try {
      // Requires re-authentication in a real scenario
      await firebaseUpdateEmail(currentUser, newEmail); 
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, { email: newEmail });
      toast({ title: "Email modifié", description: "Votre email a été mis à jour. Veuillez vérifier votre nouvelle adresse." });
      setNewEmail("");
    } catch (error: any) {
      console.error(error);
      let message = "Impossible de modifier l'email.";
      if (error.code === 'auth/requires-recent-login') message = "Veuillez vous reconnecter pour modifier votre email.";
      if (error.code === 'auth/email-already-in-use') message = "Cet email est déjà utilisé par un autre compte.";
      toast({ title: "Erreur", description: message, variant: "destructive" });
    } finally {
      setLoadingEmail(false);
    }
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
        <p className="text-muted-foreground">Gérez vos informations personnelles et paramètres de compte.</p>
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
                  <AvatarImage src={avatarPreview || userProfile.photoURL || `https://placehold.co/128x128.png?text=${getInitials(userProfile.firstName, userProfile.lastName)}`} alt="Avatar" data-ai-hint="profile photo" />
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
          <CardDescription>Votre adresse e-mail actuelle est {userProfile.email}. La modification de l'e-mail nécessitera une nouvelle vérification.</CardDescription>
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
               <p className="text-xs text-muted-foreground mt-1">Attention: La modification de l'e-mail peut vous déconnecter.</p>
            </div>
        </CardContent>
      </Card>

    </div>
  );
}
