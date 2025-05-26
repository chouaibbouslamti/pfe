import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Clock, CalendarCheck2, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mes Tâches - Gestion Hangar Intelligent",
  description: "Consultez les tâches qui vous sont assignées.",
};

// Mock data for tasks (derived from interventions for a specific user)
const mockTasks = [
  { id: "TASK001", interventionId: "INT001", title: "Contrôle qualité Lot #L0T78", description: "Vérifier l'état et la température du lot. Noter toute anomalie.", scheduledTime: new Date(Date.now() + 86400000 * 1).toISOString(), hangar: "Hangar Bravo", priority: "Haute", status: "À faire" },
  { id: "TASK002", interventionId: "INT003", title: "Participer à la rotation des stocks", description: "Aider à déplacer les lots selon le plan.", scheduledTime: new Date(Date.now() - 86400000 * 3).toISOString(), hangar: "Hangar Bravo", priority: "Moyenne", status: "En cours" },
  { id: "TASK003", interventionId: "INT004", title: "Assister au nettoyage du Hangar Gamma", description: "Suivre les protocoles de nettoyage et de sécurité.", scheduledTime: new Date(Date.now() - 86400000 * 7).toISOString(), hangar: "Hangar Gamma", priority: "Basse", status: "Terminée" },
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Haute": return <Badge variant="destructive">{priority}</Badge>;
    case "Moyenne": return <Badge variant="secondary" className="bg-yellow-400/80 text-yellow-900 hover:bg-yellow-400">{priority}</Badge>;
    case "Basse": return <Badge variant="outline">{priority}</Badge>;
    default: return <Badge>{priority}</Badge>;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "À faire": return <Clock className="h-5 w-5 text-blue-500" />;
    case "En cours": return <ListChecks className="h-5 w-5 text-orange-500 animate-pulse" />;
    case "Terminée": return <CalendarCheck2 className="h-5 w-5 text-green-500" />;
    default: return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
};


export default function TasksPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes Tâches Assignées</h1>
        <p className="text-muted-foreground">Voici la liste des tâches qui vous ont été confiées.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste de Tâches</CardTitle>
          <CardDescription>Tâches planifiées, en cours et terminées.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockTasks.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Statut</TableHead>
                    <TableHead>Titre de la Tâche</TableHead>
                    <TableHead>Hangar</TableHead>
                    <TableHead>Date Prévue</TableHead>
                    <TableHead>Priorité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTasks.map((task) => (
                    <TableRow key={task.id} className={task.status === "Terminée" ? "opacity-60" : ""}>
                      <TableCell className="text-center">{getStatusIcon(task.status)}</TableCell>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.hangar}</TableCell>
                      <TableCell>{new Date(task.scheduledTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/interventions/${task.interventionId}?tache=${task.id}`}>Voir Détails</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10">
              <ListChecks className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucune tâche assignée</h3>
              <p className="mt-1 text-sm text-muted-foreground">Vous n'avez actuellement aucune tâche en cours. Reposez-vous bien !</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
