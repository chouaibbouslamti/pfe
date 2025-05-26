import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart, PieChart, AlertTriangle } from "lucide-react";
import type { Metadata } from "next";
// Note: Actual chart implementation requires a library like Recharts and client-side rendering.
// These are placeholders for where charts would go.

export const metadata: Metadata = {
  title: "Indicateurs de Performance (KPI) - Gestion Hangar Intelligent",
  description: "Visualisez les indicateurs clés de performance pour les hangars et les opérations.",
};

// Mock data for charts
const storageTimeData = {
  labels: ["Hangar A", "Hangar B", "Hangar C", "Hangar D"],
  values: [25, 32, 18, 28], // Average storage time in days
};

const riskyBatchesData = {
  labels: ["Sains", "À Risque", "Expirés"],
  values: [80, 15, 5], // Percentage or count
};

const interventionStatusData = {
  labels: ["Planifiées", "En Cours", "Terminées", "Annulées"],
  values: [10, 5, 25, 2],
};

export default function KpiPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Indicateurs de Performance Clés (KPI)</h1>
        <p className="text-muted-foreground">Analyse des performances opérationnelles.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Temps de Stockage Moyen</CardTitle>
            <BarChart3 className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">26 jours</div>
            <p className="text-xs text-muted-foreground">+2% par rapport au mois dernier</p>
            <div className="h-[200px] mt-4 flex items-center justify-center bg-muted/30 rounded-md">
              <img src="https://placehold.co/300x200.png?text=Graphique+Barres" alt="Bar chart placeholder" data-ai-hint="bar chart" className="opacity-70"/>
              {/* Placeholder for Bar Chart: storageTimeData */}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lots à Risque</CardTitle>
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">-5% par rapport au mois dernier</p>
             <div className="h-[200px] mt-4 flex items-center justify-center bg-muted/30 rounded-md">
               <img src="https://placehold.co/300x200.png?text=Graphique+Circulaire" alt="Pie chart placeholder" data-ai-hint="pie chart" className="opacity-70"/>
              {/* Placeholder for Pie Chart: riskyBatchesData */}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Statut des Interventions</CardTitle>
            <LineChart className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 Interventions ce mois</div>
            <p className="text-xs text-muted-foreground">85% terminées à temps</p>
             <div className="h-[200px] mt-4 flex items-center justify-center bg-muted/30 rounded-md">
              <img src="https://placehold.co/300x200.png?text=Graphique+Linéaire" alt="Line chart placeholder" data-ai-hint="line chart" className="opacity-70"/>
              {/* Placeholder for Line/Bar Chart: interventionStatusData */}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-1 lg:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Utilisation de la Capacité des Hangars</CardTitle>
            <CardDescription>Pourcentage de capacité utilisée par hangar.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
            <img src="https://placehold.co/500x300.png?text=Graphique+Détaillé" alt="Detailed chart placeholder" data-ai-hint="dashboard chart" className="opacity-70"/>
            {/* Placeholder for more detailed chart */}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Performance des Équipes</CardTitle>
            <CardDescription>Nombre d'interventions par équipe et temps de résolution moyen.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center bg-muted/30 rounded-md">
             <img src="https://placehold.co/500x300.png?text=Graphique+Équipes" alt="Team performance chart placeholder" data-ai-hint="team statistics" className="opacity-70"/>
            {/* Placeholder for team performance chart */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
