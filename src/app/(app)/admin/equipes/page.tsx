
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
import { mockTeams, mockUserProfiles, generateId } from "@/lib/mockData";

const teamSchema = z.object({
  name: z.string().min(3, "Le nom de l'équipe est requis (min 3 caractères)."),
  managerId: z.string().min(1, "Un chef d'équipe est requis."),
  contact: z.string().email("Email de contact invalide.").optional().or(z.literal('')),
});

export default function TeamsAdminPage() {
  const { userProfile, loading: authLoading, localUserProfiles, setLocalUserProfiles: setLocalUsers } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [users, setUsers] = useState<UserProfile[]>(localUserProfiles); 
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

  useEffect(() => {
    if (userProfile?.role === "SUPER_ADMIN") {
      setUsers(localUserProfiles); // Update users when localUserProfiles change
      setLoadingData(false);
    }
  }, [userProfile, localUserProfiles]);
  
  const getUserName = (uid: string) => {
    const user = users.find(u => u.uid === uid);
    return user ? `${user.firstName} ${user.lastName}` : uid;
  }

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
    try {
      if (editingTeam) { // Update existing team
        setTeams(prevTeams => prevTeams.map(t => t.id === editingTeam.id ? { ...editingTeam, ...values } : t));
        toast({ title: "Succès (simulation)", description: "Équipe mise à jour." });
        setEditingTeam(null);
        setIsEditDialogOpen(false);
      } else { // Create new team
        const newTeam: Team = {
          id: generateId(),
          ...values,
          members: [values.managerId], 
          createdAt: new Date(),
        };
        setTeams(prevTeams => [...prevTeams, newTeam]);
        
        // Update manager's teamId and role in localUsers
        const managerProfile = users.find(u => u.uid === values.managerId);
        if (managerProfile) {
          setLocalUsers(prevLocalUsers => prevLocalUsers.map(u => 
            u.uid === values.managerId ? { ...u, teamId: newTeam.id, role: u.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "TEAM_MANAGER" } : u
          ));
        }
        toast({ title: "Succès (simulation)", description: "Nouvelle équipe créée." });
        setIsCreateDialogOpen(false);
      }
      form.reset();
    } catch (error) {
      console.error("Error saving team:", error);
      toast({ title: "Erreur (simulation)", description: "Impossible de sauvegarder l'équipe.", variant: "destructive" });
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
    try {
      const oldMembers = teamToManageMembers.members || [];
      
      setTeams(prevTeams => prevTeams.map(t => 
        t.id === teamToManageMembers.id ? { ...t, members: selectedMembers } : t
      ));

      // Update teamId for users locally
      const addedMembers = selectedMembers.filter(id => !oldMembers.includes(id));
      const removedMembers = oldMembers.filter(id => !selectedMembers.includes(id) && id !== teamToManageMembers.managerId);

      setLocalUsers(prevLocalUsers => prevLocalUsers.map(u => {
        if (addedMembers.includes(u.uid)) return { ...u, teamId: teamToManageMembers.id };
        if (removedMembers.includes(u.uid)) return { ...u, teamId: undefined }; // Or an empty string
        return u;
      }));

      toast({ title: "Succès (simulation)", description: "Membres de l'équipe mis à jour." });
      setIsManageMembersDialogOpen(false);
      setTeamToManageMembers(null);
    } catch (error) {
      console.error("Error updating team members:", error);
      toast({ title: "Erreur (simulation)", description: "Impossible de mettre à jour les membres.", variant: "destructive" });
    }
  };


  if (authLoading || (userProfile?.role !== "SUPER_ADMIN" && !loadingData)) {
    return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Équipes</h1>
          <p className="text-muted-foreground">Créez et gérez les équipes d'intervention (simulation locale).</p>
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
                    name="managerId"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="managerId">
                            <SelectValue placeholder="Sélectionner un chef d'équipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Utilisateurs disponibles</SelectLabel>
                            {users.filter(u => u.role !== 'USER' && u.isActive).map(user => ( 
                                <SelectItem key={user.uid} value={user.uid}>
                                {user.firstName} {user.lastName} ({user.email})
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    )}
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
                    name="managerId"
                    control={form.control}
                    render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="edit-managerId">
                            <SelectValue placeholder="Sélectionner un chef d'équipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                            <SelectLabel>Utilisateurs disponibles</SelectLabel>
                            {users.filter(u => u.role !== 'USER' && u.isActive).map(user => (
                                <SelectItem key={user.uid} value={user.uid}>
                                {user.firstName} {user.lastName} ({user.email})
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                        </Select>
                    )}
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
              {users.filter(u => u.uid !== teamToManageMembers?.managerId && u.isActive).map(user => ( 
                <div key={user.uid} className="flex items-center space-x-2 p-2 border rounded-md">
                  <Checkbox
                    id={`member-${user.uid}`}
                    checked={selectedMembers.includes(user.uid)}
                    onCheckedChange={() => handleMemberSelection(user.uid)}
                    disabled={user.uid === teamToManageMembers?.managerId} 
                  />
                  <label htmlFor={`member-${user.uid}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {user.firstName} {user.lastName} ({user.email})
                  </label>
                </div>
              ))}
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
                      <TableCell>{getUserName(team.managerId)}</TableCell>
                      <TableCell>{team.members?.length || 0}</TableCell>
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
                                if(confirm("Supprimer cette équipe ? (Simulation)")) {
                                  setTeams(prev => prev.filter(t => t.id !== team.id));
                                  toast({title: "Équipe supprimée (simulation)"});
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
