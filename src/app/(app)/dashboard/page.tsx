import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Bell, ClipboardList, Users, Warehouse } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Tableau de Bord - Gestion Hangar Intelligent",
  description: "Vue d'ensemble de vos activités et indicateurs clés.",
};

// Mock data for demonstration
const stats = [
  { title: "Alertes Actives", value: "3", icon: Bell, color: "text-destructive", href: "/alertes" },
  { title: "Interventions Planifiées", value: "5", icon: ClipboardList, color: "text-amber-600", href: "/interventions" },
  { title: "Hangars Opérationnels", value: "8/10", icon: Warehouse, color: "text-green-600", href: "/hangars" },
  { title: "Lots à Risque", value: "12", icon: BarChart3, color: "text-red-500", href: "/lots" },
];

const kpiData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
  datasets: [
    {
      label: 'Lots Traités',
      data: [65, 59, 80, 81, 56, 55],
      borderColor: 'hsl(var(--primary))',
      backgroundColor: 'hsla(var(--primary), 0.2)',
    },
    {
      label: 'Interventions',
      data: [28, 48, 40, 19, 86, 27],
      borderColor: 'hsl(var(--accent))',
      backgroundColor: 'hsla(var(--accent), 0.2)',
    },
  ],
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="text-muted-foreground">Bienvenue ! Voici un aperçu de vos activités.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} legacyBehavior>
            <a className="block hover:shadow-lg transition-shadow duration-200">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <stat.icon className={`h-5 w-5 ${stat.color || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stat.color || 'text-foreground'}`}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground">Voir détails</p>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Interventions Récentes</CardTitle>
            <CardDescription>Liste des dernières interventions programmées ou en cours.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for interventions list */}
            <ul className="space-y-3">
              {[1,2,3].map(i => (
                <li key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                  <div>
                    <p className="font-medium">Intervention #{1234+i}</p>
                    <p className="text-sm text-muted-foreground">Hangar Alpha - Engrais Type X</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">Planifiée</span>
                </li>
              ))}
            </ul>
             <Link href="/interventions" className="text-sm text-primary hover:underline mt-4 block">
              Voir toutes les interventions &rarr;
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Actives</CardTitle>
            <CardDescription>Alertes nécessitant une attention immédiate.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for active alerts */}
             <ul className="space-y-3">
              {[1,2].map(i => (
                <li key={i} className="flex justify-between items-center p-3 bg-destructive/10 rounded-md">
                  <div>
                    <p className="font-medium">Alerte #{5678+i}: Expiration imminente</p>
                    <p className="text-sm text-muted-foreground">Lot #L0T{77+i} - Hangar Bravo</p>
                  </div>
                  <span className="text-sm font-semibold text-destructive">Critique</span>
                </li>
              ))}
            </ul>
            <Link href="/alertes" className="text-sm text-primary hover:underline mt-4 block">
              Voir toutes les alertes &rarr;
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder for KPI chart - requires chart component integration */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Performance Mensuelle</CardTitle>
          <CardDescription>Suivi des lots traités et interventions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Graphique de performance (à implémenter avec Recharts).</p>
          {/* Example image placeholder for chart */}
          <img src="https://placehold.co/600x300.png" alt="Placeholder chart" data-ai-hint="bar chart" className="mt-4 rounded-md opacity-50" />
        </CardContent>
      </Card>

    </div>
  );
}
