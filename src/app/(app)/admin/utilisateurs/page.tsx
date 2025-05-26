"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, UserPlus, CheckCircle, XCircle, ShieldQuestion, Search } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserProfile, UserRole } from "@/types"; // Assuming types are defined
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";


const RoleSelect = ({ userId, currentRole, onRoleChange }: { userId: string, currentRole: UserRole, onRoleChange: (userId: string, newRole: UserRole) => void }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onRoleChange(userId, selectedRole);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
        <DialogTrigger asChild>
          <button className="w-full text-left">Assigner Rôle</button>
        </DialogTrigger>
      </DropdownMenuItem>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assigner un nouveau rôle</DialogTitle>
          <DialogDescription>Sélectionnez le nouveau rôle pour cet utilisateur.</DialogDescription>
        </DialogHeader>
        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">Utilisateur</SelectItem>
            <SelectItem value="TEAM_MANAGER">Chef d'équipe</SelectItem>
            <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
          <Button onClick={handleSave}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function UsersAdminPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending" | "inactive">("all");

  useEffect(() => {
    if (!authLoading && userProfile?.role !== "SUPER_ADMIN") {
      router.replace("/dashboard"); // Or an unauthorized page
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    if (userProfile?.role === "SUPER_ADMIN") {
      fetchUsers();
    }
  }, [userProfile]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersCollectionRef = collection(db, "users");
      // Simple client-side filtering for now. For larger datasets, use Firestore queries.
      const q = query(usersCollectionRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id } as UserProfile));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Erreur", description: "Impossible de charger les utilisateurs.", variant: "destructive" });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const handleApproveUser = async (userId: string, currentApprovalStatus: boolean) => {
    try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { isApproved: !currentApprovalStatus });
      toast({ title: "Succès", description: `Statut d'approbation de l'utilisateur mis à jour.` });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error updating user approval status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
     try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { role: newRole });
      toast({ title: "Succès", description: `Rôle de l'utilisateur mis à jour.` });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le rôle.", variant: "destructive" });
    }
  };
  
  const handleToggleActiveUser = async (userId: string, currentIsActive: boolean) => {
     try {
      const userDocRef = doc(db, "users", userId);
      await updateDoc(userDocRef, { isActive: !currentIsActive });
      toast({ title: "Succès", description: `Statut d'activité de l'utilisateur mis à jour.` });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Error updating user active status:", error);
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    }
  };

  const roleDisplay: { [key in UserRole]: string } = {
    USER: "Utilisateur",
    TEAM_MANAGER: "Chef d'équipe",
    SUPER_ADMIN: "Super Admin",
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email} ${user.username}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" ||
      (filterStatus === "approved" && user.isApproved && user.isActive) ||
      (filterStatus === "pending" && !user.isApproved && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);
    return matchesSearch && matchesStatus;
  });


  if (authLoading || (userProfile?.role !== "SUPER_ADMIN" && !loadingUsers)) {
     return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
            <p className="text-muted-foreground">Approuvez les inscriptions, assignez des rôles et gérez les accès.</p>
        </div>
        {/* <Button disabled><UserPlus className="mr-2 h-4 w-4" /> Inviter un Utilisateur</Button> */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
           <div className="mt-4 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                    type="search" 
                    placeholder="Rechercher (nom, email...)" 
                    className="pl-8 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="approved">Approuvé & Actif</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingUsers ? (
            <div className="text-center py-10"><UserPlus className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" /><p className="mt-2">Chargement des utilisateurs...</p></div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actif</TableHead>
                    <TableHead>Date Inscription</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell><Badge variant="outline">{roleDisplay[user.role]}</Badge></TableCell>
                      <TableCell>
                        {user.isApproved ? (
                          <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">Approuvé</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">En attente</Badge>
                        )}
                      </TableCell>
                       <TableCell>
                        {user.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>{user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString('fr-FR') : 'N/A'}</TableCell>
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
                            <DropdownMenuItem onClick={() => handleApproveUser(user.uid, user.isApproved)}>
                              {user.isApproved ? "Révoquer l'approbation" : "Approuver"}
                            </DropdownMenuItem>
                            <RoleSelect userId={user.uid} currentRole={user.role} onRoleChange={handleRoleChange} />
                             <DropdownMenuItem onClick={() => handleToggleActiveUser(user.uid, user.isActive)}>
                              {user.isActive ? "Désactiver le compte" : "Activer le compte"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled>Voir Profil Détaillé</DropdownMenuItem>
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
              <ShieldQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">Aucun utilisateur ne correspond à vos critères de recherche ou de filtre.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
