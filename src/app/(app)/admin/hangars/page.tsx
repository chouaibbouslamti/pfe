
"use client";

import Link from "next/link";
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
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Warehouse, PlusCircle, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { mockHangars, generateId } from "@/lib/mockData";
import { useMockDataContext } from "@/contexts/MockDataContext";

const hangarSchema = z.object({
  name: z.string().min(3, "Le nom du hangar est requis (min 3 caractères)."),
  location: z.string().min(3, "La localisation est requise."),
  capacity: z.coerce.number().min(1, "La capacité doit être supérieure à 0."),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export default function HangarsAdminPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const { useMockData } = useMockDataContext();
  const router = useRouter();
  const { toast } = useToast();
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [loadingData, setLoadingData] = useState(true); // Chargement initial
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHangar, setEditingHangar] = useState<Hangar | null>(null);
  
  // Récupérer les données des hangars depuis l'API ou utiliser les données mockées
  useEffect(() => {
    const fetchHangars = async () => {
      setLoadingData(true);
      
      if (useMockData) {
        // Utiliser les données mockées si le toggle est activé
        console.log("Utilisation des données mockées pour les hangars", { mockHangarsCount: mockHangars.length });
        setHangars(mockHangars);
        setLoadingData(false);
      } else {
        // Faire un appel API pour récupérer les données réelles
        try {
          const response = await fetch('/api/hangars');
          if (!response.ok) {
            throw new Error('Failed to fetch hangars');
          }
          const data = await response.json();
          setHangars(data);
        } catch (error) {
          console.error('Error fetching hangars:', error);
          // Utiliser les données mockées en cas d'erreur
          setHangars(mockHangars);
          toast({ 
            title: "Erreur de connexion", 
            description: "Impossible de récupérer les données. Utilisation des données de démonstration.", 
            variant: "destructive" 
          });
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchHangars();
  }, [toast, useMockData]);

  const form = useForm<z.infer<typeof hangarSchema>>({
    resolver: zodResolver(hangarSchema),
    defaultValues: { name: "", location: "", capacity: 0, status: "ACTIVE" },
  });

  useEffect(() => {
    if (!authLoading && userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role)) {
      router.replace("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const onSubmit = async (values: z.infer<typeof hangarSchema>) => {
    setLoadingData(true);
    try {
      if (useMockData) {
        // Gestion des données mockées
        if (editingHangar) {
          // Mise à jour d'un hangar existant dans les données mockées
          const updatedHangar = {
            ...editingHangar,
            ...values,
            id: editingHangar.id,
          };
          
          // Mettre à jour l'état local
          setHangars(prevHangars => 
            prevHangars.map(h => h.id === editingHangar.id ? updatedHangar : h)
          );
          
          toast({
            title: "Hangar mis à jour",
            description: `Le hangar ${updatedHangar.name} a été mis à jour avec succès (données mockées).`,
          });
        } else {
          // Création d'un nouveau hangar dans les données mockées
          const newId = generateId();
          const newHangar = {
            id: newId,
            ...values,
            createdAt: new Date(),
          };
          
          // Ajouter le nouveau hangar à l'état local
          setHangars(prevHangars => [...prevHangars, newHangar]);
          
          toast({
            title: "Hangar ajouté",
            description: `Le hangar ${newHangar.name} a été ajouté avec succès (données mockées).`,
          });
        }
      } else {
        // Gestion des données réelles via API
        if (editingHangar) {
          // Mise à jour d'un hangar existant
          const response = await fetch(`/api/hangars/${editingHangar.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
          });
          
          if (response.ok) {
            const updatedHangar = await response.json();
            // Mettre à jour l'état local avec les données de la base de données
            setHangars(prevHangars => 
              prevHangars.map(h => h.id === editingHangar.id ? updatedHangar : h)
            );
            toast({
              title: "Hangar mis à jour",
              description: `Le hangar ${updatedHangar.name} a été mis à jour avec succès.`,
            });
          } else {
            throw new Error('Failed to update hangar');
          }
        } else {
          // Création d'un nouveau hangar
          const response = await fetch('/api/hangars', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
          });
          
          if (response.ok) {
            const newHangar = await response.json();
            // Ajouter le nouveau hangar à l'état local
            setHangars(prevHangars => [...prevHangars, newHangar]);
            toast({
              title: "Hangar ajouté",
              description: `Le hangar ${newHangar.name} a été ajouté avec succès.`,
            });
          } else {
            throw new Error('Failed to create hangar');
          }
        }
      }
      
      // Fermer le dialogue et réinitialiser le formulaire
      setIsDialogOpen(false);
      form.reset({ name: "", location: "", capacity: 0, status: "ACTIVE" });
      setEditingHangar(null);
    } catch (error) {
      console.error('Error submitting hangar data:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement du hangar.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };
  
  const openEditDialog = (hangar: Hangar) => {
    setEditingHangar(hangar);
    form.reset(hangar);
    setIsDialogOpen(true);
  };

  const handleDeleteHangar = async (hangarId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce hangar ? Cette action est irréversible.')) {
      setLoadingData(true);
      try {
        if (useMockData) {
          // Supprimer le hangar de l'état local sans appel API
          setHangars(prevHangars => prevHangars.filter(h => String(h.id) !== String(hangarId)));
          toast({
            title: "Hangar supprimé",
            description: "Le hangar a été supprimé avec succès (données mockées).",
          });
        } else {
          // Appel API pour supprimer le hangar
          const response = await fetch(`/api/hangars/${hangarId}`, {
            method: 'DELETE',
          });
          
          if (response.ok) {
            // Supprimer le hangar de l'état local
            setHangars(prevHangars => prevHangars.filter(h => h.id !== hangarId));
            toast({
              title: "Hangar supprimé",
              description: "Le hangar a été supprimé avec succès.",
            });
          } else {
            throw new Error('Failed to delete hangar');
          }
        }
      } catch (error) {
        console.error('Error deleting hangar:', error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors de la suppression du hangar.",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    }
  };

  if (authLoading || (userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role) && !loadingData)) {
     return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0c1015] dark:text-[#0c1015] drop-shadow-sm">Gestion des Hangars</h1>
          <p className="text-[#0c1015] dark:text-[#0c1015] font-medium">Ajoutez, modifiez ou supprimez des hangars de stockage (simulation locale).</p>
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loadingData}>Annuler</Button>
                  <Button type="submit" disabled={loadingData}>
                    {loadingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {loadingData ? "Sauvegarde en cours..." : "Sauvegarder"}
                  </Button>
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
                              <DropdownMenuItem 
                                onClick={() => openEditDialog(hangar)}
                                disabled={loadingData}
                              >
                                {loadingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit className="mr-2 h-4 w-4" />} Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteHangar(hangar.id)} 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                disabled={loadingData}
                              >
                                {loadingData ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />} Supprimer
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                               <DropdownMenuItem asChild>
                                <Link href={`/lots?hangarId=${hangar.id}`}>Voir Lots</Link>
                              </DropdownMenuItem>
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
