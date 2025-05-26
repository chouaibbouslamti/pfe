
"use client"; // Added "use client" for state management

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, SlidersHorizontal, ClipboardList } from "lucide-react";
// import type { Metadata } from "next"; // Metadata for server components
import Link from "next/link";
import { useState, useMemo } from "react";
import type { Intervention } from "@/types";
import { mockInterventionsData } from "@/lib/mockData";

// export const metadata: Metadata = { // Removed metadata for client component
//   title: "Interventions - Gestion Hangar Intelligent",
//   description: "Planifiez et suivez les interventions sur les lots et hangars.",
// };


const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "PLANNED": return "default"; 
    case "IN_PROGRESS": return "secondary"; 
    case "COMPLETED": return "outline"; 
    case "CANCELLED": return "destructive";
    default: return "outline";
  }
};

const statusTranslations: { [key: string]: string } = {
  PLANNED: "Planifiée",
  IN_PROGRESS: "En cours",
  COMPLETED: "Terminée",
  CANCELLED: "Annulée",
};


export default function InterventionsPage() {
  const [interventions, setInterventions] = useState<Intervention[]>(mockInterventionsData);
  // Add state for filters if needed, e.g.,
  // const [statusFilter, setStatusFilter] = useState("all");
  // const [teamFilter, setTeamFilter] = useState("all");

  const filteredInterventions = useMemo(() => {
    // Apply filters here if implemented
    return interventions;
  }, [interventions /*, statusFilter, teamFilter */]);
  
  // Placeholder for deleting/cancelling an intervention
  const handleCancelIntervention = (id: string) => {
    if(confirm("Êtes-vous sûr de vouloir annuler cette intervention (simulation)?")) {
      setInterventions(prev => prev.map(inv => inv.id === id ? {...inv, status: "CANCELLED"} : inv));
      // Add toast notification if desired
    }
  };


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Interventions</h1>
          <p className="text-muted-foreground">Planifiez, assignez et suivez toutes les interventions (simulation locale).</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline" disabled> {/* Filter functionality can be added later */}
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Button asChild>
            <Link href="/interventions/creer"> {/* Assuming creer page will be adapted */}
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Intervention
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Interventions</CardTitle>
          <CardDescription>Aperçu des interventions planifiées, en cours et terminées.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInterventions.length > 0 ? (
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Hangar/Lot</TableHead>
                    <TableHead>Équipe Assignée</TableHead>
                    <TableHead>Date Planifiée</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInterventions.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="font-medium">{intervention.title}</TableCell>
                      <TableCell>{intervention.hangarId}{intervention.batchId ? ` / ${intervention.batchId}`: ''}</TableCell>
                      <TableCell>Équipe {intervention.teamId.replace('team', '') /* Basic display */}</TableCell>
                      <TableCell>{new Date(intervention.scheduledTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(intervention.status)}>
                          {statusTranslations[intervention.status] || intervention.status}
                        </Badge>
                      </TableCell>
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
                            {/* Adapt links if /interventions/[id] and /interventions/modifier/[id] are implemented */}
                            <DropdownMenuItem asChild><Link href={`/interventions`}>Voir Détails (désactivé)</Link></DropdownMenuItem> 
                            <DropdownMenuItem asChild><Link href={`/interventions`}>Modifier (désactivé)</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {intervention.status !== "COMPLETED" && intervention.status !== "CANCELLED" && (
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                                onClick={() => handleCancelIntervention(intervention.id)}
                              >
                                Annuler
                              </DropdownMenuItem>
                            )}
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
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucune intervention trouvée</h3>
              <p className="mt-1 text-sm text-muted-foreground">Commencez par planifier une nouvelle intervention.</p>
              <Button className="mt-6" asChild>
                <Link href="/interventions/creer"><PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Intervention</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
