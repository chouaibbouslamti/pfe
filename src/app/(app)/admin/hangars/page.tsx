"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Hangar } from "@/types";
import { collection, addDoc, getDocs, serverTimestamp, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Warehouse, PlusCircle, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const hangarSchema = z.object({
  name: z.string().min(3, "Le nom du hangar est requis (min 3 caractères)."),
  location: z.string().min(3, "La localisation est requise."),
  capacity: z.coerce.number().min(1, "La capacité doit être supérieure à 0."),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export default function HangarsAdminPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHangar, setEditingHangar] = useState<Hangar | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof hangarSchema>>({
    resolver: zodResolver(hangarSchema),
    defaultValues: { name: "", location: "", capacity: 0, status: "ACTIVE" },
  });

  useEffect(() => {
    // Allow SUPER_ADMIN and TEAM_MANAGER
    if (!authLoading && userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role)) {
      router.replace("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile && ["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role)) {
      fetchHangars();
    }
  }, [userProfile]);

  const fetchHangars = async () => {
    setLoadingData(true);
    try {
      const hangarsSnapshot = await getDocs(collection(db, "hangars"));
      setHangars(hangarsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Hangar)));
    } catch (error) {
      console.error("Error fetching hangars:", error);
      toast({ title: "Erreur", description: "Impossible de charger les hangars.", variant: "destructive" });
    } finally {
      setLoadingData(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof hangarSchema>) => {
    try {
      if (editingHangar) {
        const hangarDocRef = doc(db, "hangars", editingHangar.id);
        await updateDoc(hangarDocRef, values);
        toast({ title: "Succès", description: "Hangar mis à jour." });
      } else {
        await addDoc(collection(db, "hangars"), { ...values, createdAt: serverTimestamp() });
        toast({ title: "Succès", description: "Nouveau hangar créé." });
      }
      form.reset({ name: "", location: "", capacity: 0, status: "ACTIVE" });
      setEditingHangar(null);
      setIsDialogOpen(false);
      fetchHangars();
    } catch (error) {
      console.error("Error saving hangar:", error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder le hangar.", variant: "destructive" });
    }
  };
  
  const openEditDialog = (hangar: Hangar) => {
    setEditingHangar(hangar);
    form.reset(hangar);
    setIsDialogOpen(true);
  };

  const handleDeleteHangar = async (hangarId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce hangar? Cette action est irréversible.")) return;
    try {
      // Add checks here if hangar has batches, etc. before deleting
      await deleteDoc(doc(db, "hangars", hangarId));
      toast({ title: "Succès", description: "Hangar supprimé." });
      fetchHangars();
    } catch (error) {
      console.error("Error deleting hangar:", error);
      toast({ title: "Erreur", description: "Impossible de supprimer le hangar. Vérifiez s'il est utilisé.", variant: "destructive" });
    }
  };

  if (authLoading || (userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role) && !loadingData)) {
     return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Hangars</h1>
          <p className="text-muted-foreground">Ajoutez, modifiez ou supprimez des hangars de stockage.</p>
        </div>
         {userProfile?.role === "SUPER_ADMIN" && (
          <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
            setIsDialogOpen(isOpen);
            if (!isOpen) {
              form.reset({ name: "", location: "", capacity: 0, status: "ACTIVE" });
              setEditingHangar(null);
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { form.reset({ name: "", location: "", capacity: 0, status: "ACTIVE" }); setEditingHangar(null); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Hangar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingHangar ? "Modifier le Hangar" : "Ajouter un Nouveau Hangar"}</DialogTitle>
                <DialogDescription>
                  {editingHangar ? "Modifiez les informations du hangar." : "Remplissez les informations pour créer un nouveau hangar."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name">Nom du hangar</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input id="location" {...form.register("location")} />
                  {form.formState.errors.location && <p className="text-sm text-destructive mt-1">{form.formState.errors.location.message}</p>}
                </div>
                <div>
                  <Label htmlFor="capacity">Capacité (ex: tonnes)</Label>
                  <Input id="capacity" type="number" {...form.register("capacity")} />
                  {form.formState.errors.capacity && <p className="text-sm text-destructive mt-1">{form.formState.errors.capacity.message}</p>}
                </div>
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as "ACTIVE" | "INACTIVE")}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Actif</SelectItem>
                      <SelectItem value="INACTIVE">Inactif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit">Sauvegarder</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
         )}
      </div>

      <Card>
        <CardHeader><CardTitle>Liste des Hangars</CardTitle></CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-10"><Warehouse className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" /><p className="mt-2">Chargement des hangars...</p></div>
          ) : hangars.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Capacité</TableHead>
                    <TableHead>Statut</TableHead>
                    {userProfile?.role === "SUPER_ADMIN" && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hangars.map((hangar) => (
                    <TableRow key={hangar.id}>
                      <TableCell className="font-medium">{hangar.name}</TableCell>
                      <TableCell>{hangar.location}</TableCell>
                      <TableCell>{hangar.capacity}</TableCell>
                      <TableCell>
                        <Badge variant={hangar.status === "ACTIVE" ? "default" : "destructive"} className={hangar.status === "ACTIVE" ? "bg-green-500 hover:bg-green-600" : ""}>
                          {hangar.status === "ACTIVE" ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      {userProfile?.role === "SUPER_ADMIN" && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Ouvrir menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => openEditDialog(hangar)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteHangar(hangar.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild><Link href={`/lots?hangarId=${hangar.id}`}>Voir Lots</Link></DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
              <Warehouse className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucun hangar trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">Commencez par ajouter un nouveau hangar.</p>
               {userProfile?.role === "SUPER_ADMIN" && (
                <Button className="mt-6" onClick={() => { form.reset({ name: "", location: "", capacity: 0, status: "ACTIVE" }); setEditingHangar(null); setIsDialogOpen(true);}}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Hangar
                </Button>
               )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
