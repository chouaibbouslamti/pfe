
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Team, UserProfile } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, PlusCircle, Edit, Users, Trash2, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
// Import axios pour les appels API
import axios from "axios";
import { mockTeams, mockUserProfiles, generateId } from "@/lib/mockData";
import { useMockDataContext } from "@/contexts/MockDataContext";

const teamSchema = z.object({
  name: z.string().min(3, "Le nom de l'équipe est requis (min 3 caractères)."),
  managerId: z.string().min(1, "Un chef d'équipe est requis."),
  contact: z.string().email("Email de contact invalide.").optional().or(z.literal('')),
});

export default function TeamsAdminPage() {
  const { userProfile, loading: authLoading, localUserProfiles, setLocalUserProfiles: setLocalUsers } = useAuth();
  const { useMockData } = useMockDataContext();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]); 
  const [loadingData, setLoadingData] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isManageMembersDialogOpen, setIsManageMembersDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamToManageMembers, setTeamToManageMembers] = useState<Team | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", managerId: "", contact: "" },
  });

  useEffect(() => {
    if (!authLoading && userProfile?.role !== "SUPER_ADMIN") {
      router.replace("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  // Charger les équipes depuis l'API ou depuis les données mockées
  useEffect(() => {
    if (userProfile?.role === "SUPER_ADMIN") {
      const fetchData = async () => {
        setLoadingData(true);
        
        if (useMockData) {
          // Utiliser les données mockées si le toggle est activé
          console.log("Utilisation des données mockées pour les équipes", { mockTeamsCount: mockTeams.length, mockUsersCount: mockUserProfiles.length });
          setTeams(mockTeams);
          setUsers(mockUserProfiles);
          setLoadingData(false);
        } else {
          try {
            // Charger les équipes
            const teamsResponse = await axios.get('/api/teams');
            setTeams(teamsResponse.data);
            
            // Charger les utilisateurs
            const usersResponse = await axios.get('/api/users');
            setUsers(usersResponse.data);
          } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            toast({ 
              title: "Erreur", 
              description: "Impossible de charger les données. Utilisation des données de démonstration.", 
              variant: "destructive" 
            });
            // Utiliser les données mockées en cas d'erreur
            setTeams(mockTeams);
            setUsers(mockUserProfiles);
          } finally {
            setLoadingData(false);
          }
        }
      };
      
      fetchData();
    }
  }, [userProfile, toast, useMockData]);
  
  const getUserName = (uid: string | number) => {
    if (!users || !Array.isArray(users)) return String(uid);
    const user = users.find(u => u && (u.uid === String(uid) || u.id === uid));
    if (!user) return String(uid);
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.email || String(uid);
  }

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    setLoadingData(true);
    try {
      if (useMockData) {
        // Utilisation des données mockées
        if (editingTeam) {
          // Mode édition avec données mockées
          const updatedTeam = {
            ...editingTeam,
            ...values,
            id: editingTeam.id
          };
          
          // Mise à jour réussie, on met à jour les données locales
          setTeams(prev => prev.map(team => team.id === editingTeam.id ? updatedTeam : team));
          toast({ title: "Succès", description: "Équipe mise à jour avec succès (données mockées)." });
        } else {
          // Mode création avec données mockées
          const newTeamId = generateId();
          const newTeam = {
            id: newTeamId,
            ...values,
            members: [values.managerId],
            createdAt: new Date()
          };
          
          // Création réussie, on ajoute l'équipe aux données locales
          setTeams(prev => [...prev, newTeam]);
          toast({ title: "Succès", description: "Nouvelle équipe créée avec succès (données mockées)." });
        }
      } else {
        // Utilisation de l'API
        if (editingTeam) {
          // Mode édition
          const response = await axios.put(`/api/teams/${editingTeam.id}`, values);
          
          if (response.status === 200) {
            // Mise à jour réussie, on met à jour les données locales
            setTeams(prev => prev.map(team => team.id === editingTeam.id ? response.data : team));
            toast({ title: "Succès", description: "Équipe mise à jour avec succès." });
          }
        } else {
          // Mode création
          const response = await axios.post('/api/teams', values);
          
          if (response.status === 201) {
            // Création réussie, on ajoute l'équipe aux données locales
            setTeams(prev => [...prev, response.data]);
            toast({ title: "Succès", description: "Nouvelle équipe créée avec succès." });
          }
        }
      }
      
      // Fermer le dialogue
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingTeam(null);
      
      // Réinitialiser le formulaire
      form.reset({ name: "", managerId: "", contact: "" });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'équipe:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de sauvegarder l'équipe. Veuillez réessayer.", 
        variant: "destructive" 
      });
    } finally {
      setLoadingData(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    form.reset({ name: team.name, managerId: team.managerId, contact: team.contact || "" });
    setIsEditDialogOpen(true);
  };

  const openManageMembersDialog = (team: Team) => {
    setTeamToManageMembers(team);
    setSelectedMembers(team.members || []);
    setIsManageMembersDialogOpen(true);
  };

  const handleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) ? prev.filter(id => id !== memberId) : [...prev, memberId]
    );
  };

  const saveTeamMembers = async () => {
    if (!teamToManageMembers) return;
    
    setLoadingData(true);
    try {
      // Créer une copie du tableau pour la mise à jour
      const updatedTeam = {
        ...teamToManageMembers,
        members: selectedMembers
      };
      
      if (useMockData) {
        // Mise à jour locale pour les données mockées
        setTeams(prev => prev.map(team => team.id === teamToManageMembers.id ? updatedTeam : team));
        toast({ title: "Succès", description: "Membres de l'équipe mis à jour avec succès (données mockées)." });
      } else {
        // Appel API pour les données réelles
        try {
          const response = await axios.put(`/api/teams/${teamToManageMembers.id}/members`, { members: selectedMembers });
          
          if (response.status === 200) {
            setTeams(prev => prev.map(team => team.id === teamToManageMembers.id ? response.data : team));
            toast({ title: "Succès", description: "Membres de l'équipe mis à jour avec succès." });
          }
        } catch (error) {
          console.error('Erreur lors de la mise à jour des membres:', error);
          // Fallback en cas d'erreur - mise à jour locale seulement
          setTeams(prev => prev.map(team => team.id === teamToManageMembers.id ? updatedTeam : team));
          toast({ title: "Avertissement", description: "API indisponible. Mise à jour simulée uniquement." });
        }
      }
      
      // Fermer le dialogue
      setIsManageMembersDialogOpen(false);
      setTeamToManageMembers(null);
      setSelectedMembers([]);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des membres:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de mettre à jour les membres. Veuillez réessayer.", 
        variant: "destructive" 
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || (userProfile?.role !== "SUPER_ADMIN" && !loadingData)) {
    return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#0c1015] dark:text-[#0c1015] drop-shadow-sm">Gestion des Équipes</h1>
          <p className="text-[#0c1015] dark:text-[#0c1015] font-medium">Créez et gérez les équipes d'intervention.</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { form.reset(); setEditingTeam(null); }}><PlusCircle className="mr-2 h-4 w-4" /> Créer une Équipe</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? "Modifier l'Équipe" : "Créer une Nouvelle Équipe"}</DialogTitle>
              <DialogDescription>
                {editingTeam ? "Modifiez les informations de l'équipe." : "Remplissez les informations pour créer une nouvelle équipe."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">Nom de l'équipe</Label>
                <Input id="name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="managerId">Chef d'équipe</Label>
                <Controller
                    key="managerId-create"
                    name="managerId"
                    control={form.control}
                    render={({ field }) => {
                        // Assurez-vous que la valeur est une chaîne de caractères
                        const value = field.value ? String(field.value) : "";
                        return (
                            <Select 
                                onValueChange={(newValue) => {
                                    console.log('Sélection du chef:', newValue);
                                    field.onChange(newValue);
                                }} 
                                value={value}
                                disabled={loadingData}
                            >
                                <SelectTrigger id="managerId" className="w-full">
                                    <SelectValue placeholder="Sélectionner un chef d'équipe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                    <SelectLabel>Utilisateurs disponibles</SelectLabel>
                                    {users?.filter(u => u && u.role !== 'USER' && u.isActive).map(user => { 
                                        const userId = user.uid || String(user.id);
                                        return (
                                            <SelectItem key={userId} value={userId}>
                                                <span>{user.firstName} {user.lastName} ({user.email})</span>
                                            </SelectItem>
                                        );
                                    })}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        );
                    }}
                />
                {form.formState.errors.managerId && <p className="text-sm text-destructive mt-1">{form.formState.errors.managerId.message}</p>}
              </div>
              <div>
                <Label htmlFor="contact">Email de contact (optionnel)</Label>
                <Input id="contact" type="email" {...form.register("contact")} />
                {form.formState.errors.contact && <p className="text-sm text-destructive mt-1">{form.formState.errors.contact.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier l'Équipe</DialogTitle>
              <DialogDescription>Modifiez les informations de l'équipe.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Nom de l'équipe</Label>
                <Input id="edit-name" {...form.register("name")} />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="edit-managerId">Chef d'équipe</Label>
                 <Controller
                  key="managerId-edit"
                  name="managerId"
                  control={form.control}
                  render={({ field }) => {
                      // Assurez-vous que la valeur est une chaîne de caractères
                      const value = field.value ? String(field.value) : "";
                      return (
                          <Select 
                              onValueChange={(newValue) => {
                                  console.log('Sélection du chef (edit):', newValue);
                                  field.onChange(newValue);
                              }}
                              value={value}
                              disabled={loadingData}
                          >
                              <SelectTrigger id="edit-managerId" className="w-full">
                                  <SelectValue placeholder="Sélectionner un chef d'équipe" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectGroup>
                                  <SelectLabel>Utilisateurs disponibles</SelectLabel>
                                  {users?.filter(u => u && u.role !== 'USER' && u.isActive).map(user => {
                                      const userId = user.uid || String(user.id);
                                      return (
                                          <SelectItem key={userId} value={userId}>
                                              <span>{user.firstName} {user.lastName} ({user.email})</span>
                                          </SelectItem>
                                      );
                                  })}
                                  </SelectGroup>
                              </SelectContent>
                          </Select>
                      );
                  }}
              />
                {form.formState.errors.managerId && <p className="text-sm text-destructive mt-1">{form.formState.errors.managerId.message}</p>}
              </div>
              <div>
                <Label htmlFor="edit-contact">Email de contact (optionnel)</Label>
                <Input id="edit-contact" type="email" {...form.register("contact")} />
                 {form.formState.errors.contact && <p className="text-sm text-destructive mt-1">{form.formState.errors.contact.message}</p>}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Annuler</Button>
                <Button type="submit">Sauvegarder</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      <Dialog open={isManageMembersDialogOpen} onOpenChange={setIsManageMembersDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gérer les Membres de l'Équipe: {teamToManageMembers?.name}</DialogTitle>
            <DialogDescription>Sélectionnez les utilisateurs à ajouter ou retirer de cette équipe.</DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto space-y-2">
            {users?.filter(u => u && u.uid !== teamToManageMembers?.managerId && u.isActive).map(user => { 
              const memberId = user.uid || user.id;
              return (
                <div key={`member-item-${memberId}`} className="flex items-center space-x-2 p-2 border rounded-md">
                  <Checkbox
                    key={`checkbox-${memberId}`}
                    id={`member-${memberId}`}
                    checked={selectedMembers.includes(memberId)}
                    onCheckedChange={() => handleMemberSelection(memberId)}
                    disabled={memberId === teamToManageMembers?.managerId} 
                  />
                  <label htmlFor={`member-${memberId}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {user.firstName} {user.lastName} ({user.email})
                  </label>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsManageMembersDialogOpen(false)}>Annuler</Button>
            <Button onClick={saveTeamMembers}>Sauvegarder Membres</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader><CardTitle>Liste des Équipes</CardTitle></CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="text-center py-10"><Building2 className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" /><p className="mt-2">Chargement des équipes...</p></div>
          ) : teams.length > 0 ? (
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom de l'Équipe</TableHead>
                    <TableHead>Chef d'Équipe</TableHead>
                    <TableHead>Membres</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>{!users ? 'Chargement...' : team.managerId ? getUserName(team.managerId) : 'Non défini'}</TableCell>
                      <TableCell>{team.memberIds?.length || team.members?.length || 0}</TableCell>
                      <TableCell>{team.contact || "N/A"}</TableCell>
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
                            <DropdownMenuItem onClick={() => openEditDialog(team)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openManageMembersDialog(team)}><Users className="mr-2 h-4 w-4" /> Gérer Membres</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10" 
                              onClick={() => {
                                if(confirm("Supprimer cette équipe ?")) {
                                  if (useMockData) {
                                    // Supprimer l'équipe des données mockées
                                    setTeams(prev => prev.filter(t => String(t.id) !== String(team.id)));
                                    toast({title: "Équipe supprimée", description: "Équipe supprimée avec succès (données mockées)."});
                                  } else {
                                    // Appel API pour les données réelles (simulé pour l'instant)
                                    setTeams(prev => prev.filter(t => t.id !== team.id));
                                    toast({title: "Équipe supprimée", description: "API indisponible. Suppression simulée uniquement."});
                                  }
                                }
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucune équipe trouvée</h3>
              <p className="mt-1 text-sm text-muted-foreground">Commencez par créer une nouvelle équipe.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
