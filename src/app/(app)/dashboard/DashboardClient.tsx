"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Bell, ClipboardList, Users, Warehouse } from "lucide-react";
import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";

// Mock data for demonstration
const stats = [
  { title: "Alertes Actives", value: "3", icon: Bell, color: "text-destructive", href: "/alertes" },
  { title: "Interventions Planifiées", value: "5", icon: ClipboardList, color: "text-amber-600", href: "/interventions" },
  { title: "Hangars Opérationnels", value: "8/10", icon: Warehouse, color: "text-green-600", href: "/admin/hangars" },
  { title: "Lots à Risque", value: "12", icon: BarChart3, color: "text-red-500", href: "/lots" },
];

interface PerformanceData {
  name: string;
  lots: number;
  interventions: number;
}

export function DashboardClient() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dans un cas réel, vous feriez un appel API ici pour obtenir les données
    // const fetchData = async () => {
    //   const response = await fetch('/api/dashboard/performance');
    //   const data = await response.json();
    //   setPerformanceData(data);
    //   setLoading(false);
    // };
    
    // Pour l'instant, nous utilisons des données mockées
    const mockData: PerformanceData[] = [
      { name: 'Jan', lots: 65, interventions: 28 },
      { name: 'Fév', lots: 59, interventions: 48 },
      { name: 'Mar', lots: 80, interventions: 40 },
      { name: 'Avr', lots: 81, interventions: 19 },
      { name: 'Mai', lots: 56, interventions: 86 },
      { name: 'Juin', lots: 55, interventions: 27 },
    ];
    
    // Simuler un délai de chargement
    setTimeout(() => {
      setPerformanceData(mockData);
      setLoading(false);
    }, 300);
  }, []);

  return (
    <>
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

      {/* Performance chart */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Performance Mensuelle</CardTitle>
          <CardDescription>Suivi des lots traités et interventions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Chargement des données...</p>
            </div>
          ) : (
            <LineChart 
              data={performanceData.map(item => ({
                name: item.name,
                lots: item.lots,
                interventions: item.interventions
              }))}
              lines={[
                { dataKey: 'lots', color: '#4f46e5', name: 'Lots Traités' },
                { dataKey: 'interventions', color: '#8b5cf6', name: 'Interventions' }
              ]}
              height={280}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
