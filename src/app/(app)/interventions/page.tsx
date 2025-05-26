import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interventions - Gestion Hangar Intelligent",
  description: "Planifiez et suivez les interventions sur les lots et hangars.",
};

// Mock data for interventions
const mockInterventions = [
  { id: "INT001", title: "Contrôle qualité Lot #L0T78", description: "Vérification de l'état du lot suite à alerte expiration.", scheduledTime: new Date(Date.now() + 86400000 * 1).toISOString(), hangarId: "H002", teamId: "T001", status: "PLANNED" },
  { id: "INT002", title: "Réparation système ventilation Hangar Alpha", description: "Intervention suite à détection de température anormale.", scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString(), hangarId: "H001", teamId: "T002", status: "PLANNED" },
  { id: "INT003", title: "Rotation Stock Hangar Bravo", description: "Déplacement des lots anciens pour optimiser le stockage.", scheduledTime: new Date(Date.now() - 86400000 * 3).toISOString(), hangarId: "H002", teamId: "T001", status: "IN_PROGRESS" },
  { id: "INT004", title: "Nettoyage complet Hangar Gamma", description: "Maintenance annuelle et nettoyage.", scheduledTime: new Date(Date.now() - 86400000 * 7).toISOString(), hangarId: "H003", teamId: "T003", status: "COMPLETED" },
  { id: "INT005", title: "Reconditionnement Lot #L0T60", description: "Lot endommagé pendant transport.", scheduledTime: new Date(Date.now() - 86400000 * 5).toISOString(), hangarId: "H001", batchId: "L0T60", teamId: "T002", status: "CANCELLED" },
];

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "PLANNED": return "default"; // Blue (primary)
    case "IN_PROGRESS": return "secondary"; // Yellow/Orange (custom style if needed)
    case "COMPLETED": return "outline"; // Green (custom style if needed, using outline for now)
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
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Interventions</h1>
          <p className="text-muted-foreground">Planifiez, assignez et suivez toutes les interventions.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filtres
          </Button>
          <Button asChild>
            <Link href="/interventions/creer">
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
          {mockInterventions.length > 0 ? (
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
                  {mockInterventions.map((intervention) => (
                    <TableRow key={intervention.id}>
                      <TableCell className="font-medium">{intervention.title}</TableCell>
                      <TableCell>{intervention.hangarId}{intervention.batchId ? ` / ${intervention.batchId}`: ''}</TableCell>
                      <TableCell>Équipe {intervention.teamId.replace('T00', '')}</TableCell>
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
                            <DropdownMenuItem asChild><Link href={`/interventions/${intervention.id}`}>Voir Détails</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link href={`/interventions/modifier/${intervention.id}`}>Modifier</Link></DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">Annuler</DropdownMenuItem>
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
