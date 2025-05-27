"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon, AlertTriangle, Download, FileDown } from "lucide-react";
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
  const { toast } = useToast();

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

  if (loading) {
    return <div className="flex items-center justify-center h-96">Chargement des données KPI...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-96 text-destructive">{error}</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Temps de Stockage Moyen</CardTitle>
          <BarChart3 className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgStorageTime} jours</div>
          <p className="text-xs text-muted-foreground">+2% par rapport au mois dernier</p>
          <div className="h-[200px] mt-4">
            <BarChart 
              data={kpiData.storageTimeData} 
              color="#4f46e5"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lots à Risque</CardTitle>
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{riskyPercentage}%</div>
          <p className="text-xs text-muted-foreground">-5% par rapport au mois dernier</p>
          <div className="h-[200px] mt-4">
            <PieChart 
              data={kpiData.riskyBatchesData} 
              colors={['#10b981', '#f97316', '#ef4444']} 
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Statut des Interventions</CardTitle>
          <LineChartIcon className="h-5 w-5 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalInterventions} Interventions ce mois</div>
          <p className="text-xs text-muted-foreground">{completedPercentage}% terminées</p>
          <div className="h-[200px] mt-4">
            <BarChart 
              data={kpiData.interventionStatusData} 
              color="#8b5cf6"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Utilisation de la Capacité des Hangars</CardTitle>
          <CardDescription>Pourcentage de capacité utilisée par hangar.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
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

      <Card className="lg:col-span-2 xl:col-span-1">
        <CardHeader>
          <CardTitle>Performance des Équipes</CardTitle>
          <CardDescription>Nombre d'interventions par équipe et temps de résolution moyen (heures).</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
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
  );
}
