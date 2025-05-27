"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Bell, ClipboardList, Users, Warehouse, Download, FileDown } from "lucide-react";
import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";
import { Button } from "@/components/ui/button";
import { generatePDF, generateCSV } from "@/lib/reportUtils";

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
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

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

  // Fonction pour générer un rapport PDF du tableau de bord
  const generateDashboardReport = async () => {
    try {
      setGeneratingPdf(true);
      if (!dashboardRef.current) {
        alert("Impossible de générer le rapport : élément non trouvé");
        setGeneratingPdf(false);
        return;
      }

      await generatePDF(
        "dashboard-container", 
        "rapport-tableau-de-bord", 
        "Rapport du Tableau de Bord",
        "portrait"
      );
      
      alert("Rapport PDF généré avec succès !");
      setGeneratingPdf(false);
    } catch (err) {
      console.error("Erreur lors de la génération du rapport :", err);
      alert("Erreur lors de la génération du rapport");
      setGeneratingPdf(false);
    }
  };

  // Fonction pour télécharger les données de performance au format CSV
  const downloadPerformanceData = () => {
    try {
      if (!performanceData.length) {
        alert("Aucune donnée à exporter");
        return;
      }
      
      generateCSV(performanceData, "performance-mensuelle");
      
      alert("Données CSV téléchargées avec succès !");
    } catch (err) {
      console.error("Erreur lors du téléchargement des données CSV :", err);
      alert("Erreur lors du téléchargement des données CSV");
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          onClick={downloadPerformanceData}
          disabled={loading || generatingPdf || !performanceData.length}
        >
          <FileDown className="h-4 w-4" />
          <span>Télécharger données CSV</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center space-x-2"
          onClick={generateDashboardReport}
          disabled={loading || generatingPdf}
        >
          {generatingPdf ? (
            <>
              <span className="animate-spin mr-2">&#9696;</span>
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Télécharger rapport PDF</span>
            </>
          )}
        </Button>
      </div>

      <div id="dashboard-container" ref={dashboardRef}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Link href={stat.href} key={stat.title} legacyBehavior>
            <a className="block">
              <Card className="cursor-pointer overflow-hidden border-l-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1" 
                   style={{ borderLeftColor: stat.color.startsWith('text-') ? `var(--${stat.color.substring(5)})` : stat.color }}>
                <CardContent className="p-6 flex justify-between items-center bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-amber-200/80 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold tracking-tight dark:text-white">{stat.value}</p>
                  </div>
                  <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20">
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            </a>
          </Link>
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-amber-200">Interventions Récentes</CardTitle>
            <CardDescription className="dark:text-gray-300">Liste des dernières interventions programmées ou en cours.</CardDescription>
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

        <Card className="dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-amber-200">Alertes Actives</CardTitle>
            <CardDescription className="dark:text-gray-300">Alertes nécessitant une attention immédiate.</CardDescription>
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
      <Card className="mt-8 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-amber-200">Performance Mensuelle</CardTitle>
          <CardDescription className="dark:text-gray-300">Suivi des lots traités et interventions.</CardDescription>
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
      </div>
    </>
  );
}
