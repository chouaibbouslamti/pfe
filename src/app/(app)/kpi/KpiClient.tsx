"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AlertTriangle, Download, FileDown, Warehouse, Users } from "lucide-react";
import { BarChart } from "@/components/charts/BarChart";
import { PieChart } from "@/components/charts/PieChart";
import { LineChart } from "@/components/charts/LineChart";
import { ComposedChart } from "@/components/charts/ComposedChart";
import { Button } from "@/components/ui/button";
import { generatePDF, generateCSV, generateMultiSectionReport } from "@/lib/reportUtils";
import { toast } from "@/components/ui/use-toast";

// Types pour les données KPI
interface KpiData {
  storageTimeData: {
    name: string;
    value: number;
  }[];
  riskyBatchesData: {
    name: string;
    value: number;
  }[];
  interventionStatusData: {
    name: string;
    value: number;
  }[];
  capacityData: {
    name: string;
    used: number;
    total: number;
    percentage: number;
  }[];
  teamPerformanceData: {
    name: string;
    interventions: number;
    avgResolutionTime: number;
  }[];
}

export function KpiClient() {
  const [kpiData, setKpiData] = useState<KpiData>({
    storageTimeData: [],
    riskyBatchesData: [],
    interventionStatusData: [],
    capacityData: [],
    teamPerformanceData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const kpiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      try {
        setLoading(true);
        // Dans une application réelle, vous feriez un appel API à vos endpoints KPI
        // const response = await axios.get('/api/kpi');
        // setKpiData(response.data);
        
        // Pour l'instant, nous utilisons des données simulées
        setKpiData({
          storageTimeData: [
            { name: "Hangar A", value: 25 },
            { name: "Hangar B", value: 32 },
            { name: "Hangar C", value: 18 },
            { name: "Hangar D", value: 28 },
          ],
          riskyBatchesData: [
            { name: "Sains", value: 80 },
            { name: "À Risque", value: 15 },
            { name: "Expirés", value: 5 },
          ],
          interventionStatusData: [
            { name: "Planifiées", value: 10 },
            { name: "En Cours", value: 5 },
            { name: "Terminées", value: 25 },
            { name: "Annulées", value: 2 },
          ],
          capacityData: [
            { name: "Hangar A", used: 750, total: 1000, percentage: 75 },
            { name: "Hangar B", used: 850, total: 1000, percentage: 85 },
            { name: "Hangar C", used: 600, total: 1000, percentage: 60 },
            { name: "Hangar D", used: 920, total: 1000, percentage: 92 },
          ],
          teamPerformanceData: [
            { name: "Équipe Alpha", interventions: 15, avgResolutionTime: 48 },
            { name: "Équipe Beta", interventions: 22, avgResolutionTime: 36 },
            { name: "Équipe Gamma", interventions: 8, avgResolutionTime: 72 },
            { name: "Équipe Delta", interventions: 18, avgResolutionTime: 42 },
          ],
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setError("Impossible de charger les données KPI. Veuillez réessayer.");
        setLoading(false);
      }
    };

    fetchKpiData();
  }, []);

  // Calculer le temps moyen de stockage global
  const avgStorageTime = kpiData.storageTimeData.length > 0
    ? Math.round(kpiData.storageTimeData.reduce((acc, item) => acc + item.value, 0) / kpiData.storageTimeData.length)
    : 0;

  // Calculer le pourcentage de lots à risque
  const riskyPercentage = kpiData.riskyBatchesData.find(item => item.name === "À Risque")?.value || 0;

  // Calculer le nombre total d'interventions
  const totalInterventions = kpiData.interventionStatusData.reduce((acc, item) => acc + item.value, 0);

  // Calculer le pourcentage d'interventions terminées
  const completedInterventions = kpiData.interventionStatusData.find(item => item.name === "Terminées")?.value || 0;
  const completedPercentage = totalInterventions > 0 ? Math.round((completedInterventions / totalInterventions) * 100) : 0;

  // Fonction pour générer un rapport PDF complet
  const generateFullReport = async () => {
    try {
      setGeneratingPdf(true);
      if (!kpiContainerRef.current) {
        alert("Impossible de générer le rapport : élément non trouvé");
        setGeneratingPdf(false);
        return;
      }

      await generatePDF(
        "kpi-container", 
        "rapport-kpi", 
        "Rapport des Indicateurs de Performance Clés",
        "landscape"
      );
      
      alert("Rapport PDF généré avec succès !");
      setGeneratingPdf(false);
    } catch (err) {
      console.error("Erreur lors de la génération du rapport :", err);
      alert("Erreur lors de la génération du rapport");
      setGeneratingPdf(false);
    }
  };

  // Fonction pour télécharger les données au format CSV
  const downloadCsvData = () => {
    try {
      // Préparer les données pour chaque type de graphique
      const storageTimeCSV = kpiData.storageTimeData.map(item => ({ 
        type: "Temps de Stockage", 
        ...item 
      }));
      
      const riskyBatchesCSV = kpiData.riskyBatchesData.map(item => ({ 
        type: "Lots à Risque", 
        ...item 
      }));
      
      const interventionStatusCSV = kpiData.interventionStatusData.map(item => ({ 
        type: "Statut des Interventions", 
        ...item 
      }));
      
      // Combiner toutes les données
      const allData = [...storageTimeCSV, ...riskyBatchesCSV, ...interventionStatusCSV];
      
      // Générer le CSV
      generateCSV(allData, "donnees-kpi");
      
      alert("Données CSV téléchargées avec succès !");
    } catch (err) {
      console.error("Erreur lors du téléchargement des données CSV :", err);
      alert("Erreur lors du téléchargement des données CSV");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Chargement des données KPI...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-destructive">{error}</div>;
  }

  return (
    <>
      <div className="mb-6 flex justify-end space-x-4">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
          onClick={downloadCsvData}
          disabled={loading || generatingPdf}
        >
          <FileDown className="h-4 w-4" />
          <span>Télécharger données CSV</span>
        </Button>
        <Button
          variant="default"
          size="sm"
          className="flex items-center space-x-2"
          onClick={generateFullReport}
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

      <div id="kpi-container" ref={kpiContainerRef} className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="overflow-hidden border-t-4 border-primary hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/20">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            Temps de Stockage Moyen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 mt-2">
            <div className="text-3xl font-bold tracking-tight">{avgStorageTime}</div>
            <div className="text-lg font-medium text-muted-foreground">jours</div>
          </div>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">+2% <span className="text-muted-foreground font-normal">par rapport au mois dernier</span></p>
          <div className="h-[200px] mt-6">
            <BarChart 
              data={kpiData.storageTimeData} 
              color="#4f46e5"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-t-4 border-destructive hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-destructive/5 to-destructive/10">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-destructive/20">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            Lots à Risque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-1 mt-2">
            <div className="text-3xl font-bold tracking-tight">{riskyPercentage}</div>
            <div className="text-lg font-medium text-muted-foreground">%</div>
          </div>
          <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">-5% <span className="text-muted-foreground font-normal">par rapport au mois dernier</span></p>
          <div className="h-[200px] mt-6">
            <PieChart 
              data={kpiData.riskyBatchesData} 
              colors={['#10b981', '#f97316', '#ef4444']} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden border-t-4 border-accent hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-accent/5 to-accent/10">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-accent/20">
              <LineChartIcon className="h-4 w-4 text-accent" />
            </div>
            Statut des Interventions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col mt-2">
            <div className="text-3xl font-bold tracking-tight">{totalInterventions}</div>
            <div className="text-sm font-medium text-muted-foreground">Interventions ce mois</div>
          </div>
          <div className="w-full bg-muted/50 h-2 rounded-full mt-2 overflow-hidden">
            <div 
              className="h-full bg-accent rounded-full" 
              style={{ width: `${completedPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{completedPercentage}% terminées</p>
          <div className="h-[200px] mt-4">
            <BarChart 
              data={kpiData.interventionStatusData} 
              color="#8b5cf6"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 overflow-hidden border-t-4 border-primary/70 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/20">
              <Warehouse className="h-4 w-4 text-primary" />
            </div>
            Utilisation de la Capacité des Hangars
          </CardTitle>
          <CardDescription>Pourcentage de capacité utilisée par hangar.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-6">
          <ComposedChart 
            data={kpiData.capacityData} 
            elements={[
              { type: 'bar', dataKey: 'used', color: '#4f46e5', name: 'Utilisée (tonnes)' },
              { type: 'bar', dataKey: 'total', color: '#94a3b8', name: 'Capacité Totale (tonnes)' },
              { type: 'line', dataKey: 'percentage', color: '#f97316', name: 'Pourcentage d\'utilisation' },
            ]} 
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2 xl:col-span-1 overflow-hidden border-t-4 border-green-500/70 hover:shadow-lg transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent border-b">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-green-500/20">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            Performance des Équipes
          </CardTitle>
          <CardDescription>Nombre d'interventions par équipe et temps de résolution moyen (heures).</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] pt-6">
          <ComposedChart 
            data={kpiData.teamPerformanceData} 
            elements={[
              { type: 'bar', dataKey: 'interventions', color: '#10b981', name: 'Nombre d\'interventions' },
              { type: 'line', dataKey: 'avgResolutionTime', color: '#f97316', name: 'Temps moyen de résolution (h)' },
            ]} 
          />
        </CardContent>
      </Card>
    </div>
    </>
  );
}
