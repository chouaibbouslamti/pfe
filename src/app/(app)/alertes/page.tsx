import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BellRing, Info, TriangleAlert, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Alertes - Gestion Hangar Intelligent",
  description: "Consultez et gérez les alertes du système.",
};

// Mock data for alerts
const mockAlerts = [
  { id: "A001", title: "Expiration Imminente Lot #L0T78", message: "Le lot #L0T78 dans Hangar Bravo expire dans 2 jours.", type: "STORAGE_EXPIRY", severity: "CRITICAL", status: "ACTIVE", hangarId: "H002", batchId: "L0T78", createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "A002", title: "Intervention Requise Hangar Alpha", message: "Température anormale détectée dans Hangar Alpha.", type: "INTERVENTION_NEEDED", severity: "EMERGENCY", status: "ACTIVE", hangarId: "H001", createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "A003", title: "Maintenance Préventive Hangar Gamma", message: "Équipement de ventilation nécessite une vérification.", type: "INTERVENTION_NEEDED", severity: "WARNING", status: "ACKNOWLEDGED", hangarId: "H003", createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: "A004", title: "Lot #L0T55 Résolu", message: "Problème de stockage pour le lot #L0T55 résolu.", type: "STORAGE_EXPIRY", severity: "INFO", status: "RESOLVED", hangarId: "H001", batchId: "L0T55", createdAt: new Date(Date.now() - 345600000).toISOString() },
];

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
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des Alertes</h1>
            <p className="text-muted-foreground">Suivez et gérez toutes les alertes critiques du système.</p>
        </div>
        <Button className="mt-4 md:mt-0">Créer une Alerte Manuelle</Button>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>Liste des Alertes</CardTitle>
                <div className="flex gap-2">
                    <Select defaultValue="all">
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
                    <Select defaultValue="all">
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
          {mockAlerts.length > 0 ? (
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
                  {mockAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>{getSeverityIcon(alert.severity)}</TableCell>
                      <TableCell className="font-medium">{alert.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{alert.message}</TableCell>
                      <TableCell className="text-sm">
                        {alert.hangarId}{alert.batchId ? ` / ${alert.batchId}` : ''}
                      </TableCell>
                      <TableCell className="text-sm">{new Date(alert.createdAt).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell>{getStatusBadge(alert.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
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
