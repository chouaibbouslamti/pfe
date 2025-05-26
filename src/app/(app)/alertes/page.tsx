
"use client"; // Added "use client" as we will use useState for mock data management

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BellRing, Info, TriangleAlert, ShieldAlert, CheckCircle2, PlusCircle } from "lucide-react";
// import type { Metadata } from "next"; // Metadata is for server components
import Link from "next/link";
import { useState, useMemo } from "react";
import { mockAlertsData, generateId } from "@/lib/mockData"; // Import mock data
import type { Alert as AlertType } from "@/types"; // Ensure AlertType matches our type
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// export const metadata: Metadata = { // Removed metadata for client component
//   title: "Alertes - Gestion Hangar Intelligent",
//   description: "Consultez et gérez les alertes du système.",
// };

const alertSchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  message: z.string().min(10, "Le message est requis (min 10 caractères)."),
  type: z.enum(["STORAGE_EXPIRY", "INTERVENTION_NEEDED", "LOW_STOCK", "EQUIPMENT_FAILURE"]),
  severity: z.enum(["CRITICAL", "EMERGENCY", "WARNING", "INFO"]),
  hangarId: z.string().optional(),
  batchId: z.string().optional(),
});
type AlertFormData = z.infer<typeof alertSchema>;


const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "CRITICAL": return <ShieldAlert className="h-5 w-5 text-red-600" />;
    case "EMERGENCY": return <BellRing className="h-5 w-5 text-orange-500" />;
    case "WARNING": return <TriangleAlert className="h-5 w-5 text-yellow-500" />;
    case "INFO": return <Info className="h-5 w-5 text-blue-500" />;
    default: return <Info className="h-5 w-5 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE": return <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">Actif</span>;
    case "ACKNOWLEDGED": return <span className="px-2 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full">Pris en compte</span>;
    case "RESOLVED": return <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">Résolu</span>;
    default: return <span className="px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">{status}</span>;
  }
}


export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertType[]>(mockAlertsData);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateAlertOpen, setIsCreateAlertOpen] = useState(false);

  const form = useForm<AlertFormData>({
    resolver: zodResolver(alertSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "INTERVENTION_NEEDED",
      severity: "INFO",
    },
  });

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => 
      (severityFilter === "all" || alert.severity === severityFilter) &&
      (statusFilter === "all" || alert.status === statusFilter)
    );
  }, [alerts, severityFilter, statusFilter]);

  const handleCreateAlert = (values: AlertFormData) => {
    const newAlert: AlertType = {
      ...values,
      id: generateId(),
      status: "ACTIVE",
      createdAt: new Date(),
      detectedAt: new Date(),
    };
    setAlerts(prev => [newAlert, ...prev]);
    setIsCreateAlertOpen(false);
    form.reset();
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? {...a, status: "ACKNOWLEDGED", acknowledgedAt: new Date()} : a));
  };

  const resolveAlert = (alertId: string) => {
     setAlerts(prev => prev.map(a => a.id === alertId ? {...a, status: "RESOLVED", resolvedAt: new Date()} : a));
  };


  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Alertes</h1>
            <p className="text-muted-foreground">Suivez et gérez toutes les alertes critiques du système (simulation locale).</p>
        </div>
        <Dialog open={isCreateAlertOpen} onOpenChange={setIsCreateAlertOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" onClick={() => form.reset()}><PlusCircle className="mr-2 h-4 w-4" />Créer une Alerte Manuelle</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Alerte Manuelle</DialogTitle>
              <DialogDescription>Remplissez les informations pour la nouvelle alerte.</DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCreateAlert)} className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input id="title" {...form.register("title")} />
                {form.formState.errors.title && <p className="text-sm text-destructive mt-1">{form.formState.errors.title.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" {...form.register("message")} />
                {form.formState.errors.message && <p className="text-sm text-destructive mt-1">{form.formState.errors.message.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Controller name="type" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STORAGE_EXPIRY">Expiration Stockage</SelectItem>
                        <SelectItem value="INTERVENTION_NEEDED">Intervention Requise</SelectItem>
                        <SelectItem value="LOW_STOCK">Stock Bas</SelectItem>
                        <SelectItem value="EQUIPMENT_FAILURE">Panne Équipement</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div>
                  <Label htmlFor="severity">Sévérité</Label>
                   <Controller name="severity" control={form.control} render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Critique</SelectItem>
                        <SelectItem value="EMERGENCY">Urgence</SelectItem>
                        <SelectItem value="WARNING">Avertissement</SelectItem>
                        <SelectItem value="INFO">Information</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="hangarId">ID Hangar (optionnel)</Label><Input id="hangarId" {...form.register("hangarId")} /></div>
                <div><Label htmlFor="batchId">ID Lot (optionnel)</Label><Input id="batchId" {...form.register("batchId")} /></div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateAlertOpen(false)}>Annuler</Button>
                <Button type="submit">Créer Alerte</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Liste des Alertes</CardTitle>
                <div className="flex gap-2">
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrer par sévérité" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les sévérités</SelectItem>
                            <SelectItem value="CRITICAL">Critique</SelectItem>
                            <SelectItem value="EMERGENCY">Urgence</SelectItem>
                            <SelectItem value="WARNING">Avertissement</SelectItem>
                            <SelectItem value="INFO">Information</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Filtrer par statut" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            <SelectItem value="ACTIVE">Actif</SelectItem>
                            <SelectItem value="ACKNOWLEDGED">Pris en compte</SelectItem>
                            <SelectItem value="RESOLVED">Résolu</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Sévérité</TableHead>
                    <TableHead>Titre</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Hangar/Lot</TableHead>
                    <TableHead>Date Création</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getSeverityIcon(alert.severity)}</TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell className="text-sm">
                        {alert.hangarId}{alert.batchId ? ` / ${alert.batchId}` : ''}
                      </TableCell>
                      <TableCell className="text-sm">{new Date(alert.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {alert.status === "ACTIVE" && <Button variant="outline" size="sm" onClick={() => acknowledgeAlert(alert.id)}>Accuser</Button>}
                        {alert.status === "ACKNOWLEDGED" && <Button variant="outline" size="sm" onClick={() => resolveAlert(alert.id)}>Résoudre</Button>}
                        <Button variant="default" size="sm" asChild>
                          <Link href={`/interventions/creer?alerteId=${alert.id}`}>Gérer</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucune alerte pour le moment</h3>
                <p className="text-muted-foreground">Le système est calme. Revenez plus tard pour de nouvelles alertes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
