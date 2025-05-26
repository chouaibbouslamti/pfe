
"use client"; // Added "use client" for state management

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox"; // Checkbox not used in current display
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ListChecks, Clock, CalendarCheck2, AlertTriangle } from "lucide-react";
// import type { Metadata } from "next"; // Metadata for server components
import Link from "next/link";
import { useState, useMemo } from "react"; // Added useState, useMemo
import { mockInterventionsData } from "@/lib/mockData"; // Assuming tasks are derived from interventions
import { useAuth } from "@/contexts/auth-context";

// export const metadata: Metadata = { // Removed for client component
//   title: "Mes Tâches - Gestion Hangar Intelligent",
//   description: "Consultez les tâches qui vous sont assignées.",
// };

// Simplified Task type for this mock page
interface MockTask {
  id: string;
  interventionId: string;
  title: string;
  description: string;
  scheduledTime: string; // Keep as string for simplicity, or Date
  hangar: string;
  priority: "Haute" | "Moyenne" | "Basse";
  status: "À faire" | "En cours" | "Terminée";
  assignedToTeam?: string; // If tasks are team-specific
}

// Derive mock tasks from mockInterventions for the current user's team or generic tasks
const generateMockTasks = (userId?: string, userTeamId?: string): MockTask[] => {
    // For this demo, let's show a few generic tasks or tasks related to user's team
    // This logic can be more sophisticated if needed.
    const tasks: MockTask[] = [];
    mockInterventionsData.forEach((inv, index) => {
        // Assign some tasks to the current user's team, or show all if super/manager
        // Or just create generic tasks based on interventions
        if (inv.status === "PLANNED" || inv.status === "IN_PROGRESS") {
             tasks.push({
                id: `TASK${inv.id.replace('INT', '')}`,
                interventionId: inv.id,
                title: inv.title,
                description: inv.description,
                scheduledTime: new Date(inv.scheduledTime).toISOString(),
                hangar: `Hangar ${inv.hangarId.replace('H00', '')}`, // Basic display
                priority: index % 3 === 0 ? "Haute" : index % 3 === 1 ? "Moyenne" : "Basse",
                status: inv.status === "PLANNED" ? "À faire" : "En cours",
                assignedToTeam: inv.teamId,
            });
        } else if (inv.status === "COMPLETED" && tasks.length < 5) { // Show a few completed
             tasks.push({
                id: `TASK${inv.id.replace('INT', '')}`,
                interventionId: inv.id,
                title: inv.title,
                description: inv.description,
                scheduledTime: new Date(inv.scheduledTime).toISOString(),
                hangar: `Hangar ${inv.hangarId.replace('H00', '')}`,
                priority: "Basse",
                status: "Terminée",
                assignedToTeam: inv.teamId,
            });
        }
    });
    
    // Filter for user's team if teamId is available and user is 'USER'
    if (userTeamId && userId) { // Check if userProfile exists
        const user = mockUserProfiles.find(u => u.uid === userId);
        if (user && user.role === 'USER') {
            return tasks.filter(task => task.assignedToTeam === userTeamId || !task.assignedToTeam); // Show unassigned or team tasks
        }
    }
    return tasks.slice(0, 5); // Return a subset for general view
};

import { mockUserProfiles } from "@/lib/mockData"; // Import mock user profiles

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
  const { userProfile } = useAuth();
  const [tasks, setTasks] = useState<MockTask[]>([]);

  useEffect(() => {
    if (userProfile) {
      setTasks(generateMockTasks(userProfile.uid, userProfile.teamId));
    } else {
      // Handle case where userProfile is not yet loaded, or show generic tasks
      setTasks(generateMockTasks()); 
    }
  }, [userProfile]);


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Mes Tâches Assignées</h1>
        <p className="text-muted-foreground">Voici la liste des tâches qui vous ont été confiées (simulation locale).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste de Tâches</CardTitle>
          <CardDescription>Tâches planifiées, en cours et terminées.</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length > 0 ? (
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
                  {tasks.map((task) => (
                    <TableRow key={task.id} className={task.status === "Terminée" ? "opacity-60" : ""}>
                      <TableCell className="text-center">{getStatusIcon(task.status)}</TableCell>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>{task.hangar}</TableCell>
                      <TableCell>{new Date(task.scheduledTime).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          {/* Link to a generic intervention page for now, as task-specific page might not exist */}
                          <Link href={`/interventions`}>Voir Détails (désactivé)</Link>
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

