"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, Bell, ClipboardList, Users, Warehouse, Download, FileDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { LineChart } from "@/components/charts/LineChart";
import { Button } from "@/components/ui/button";
import { generatePDF, generateCSV } from "@/lib/reportUtils";
import { useMockDataContext } from "@/contexts/MockDataContext";
import { mockAlertsData, mockInterventionsData, mockKPIData, mockHangars, mockBatches } from "@/lib/mockData";

// Nous allons remplacer ces stats statiques par des données calculées dynamiquement

interface PerformanceData {
  name: string;
  lots: number;
  interventions: number;
}

// Type pour les données KPI enrichies qui peuvent inclure des propriétés supplémentaires
interface EnhancedKPI {
  id: string | number;
  name?: string;
  hangarId?: string | number;
  totalBatches?: number;
  riskyBatches?: number;
  interventionsCompleted?: number;
  averageStorageTime?: number;
  capacityUtilization?: number;
  alertsResolvedRatio?: number;
  value?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  changePercentage?: number;
  period?: string;
  description?: string;
  calculatedAt?: Date;
}

// Fonctions utilitaires pour les KPI
const getKPIColor = (kpi: EnhancedKPI): string => {
  // Attribuer des couleurs en fonction du type ou de l'ID du KPI
  const kpiId = String(kpi.id);
  switch (kpiId) {
    case 'kpi1': return 'var(--green-600)';
    case 'kpi2': return 'var(--amber-600)';
    case 'kpi3': return 'var(--blue-600)';
    case 'kpi4': return 'var(--purple-600)';
    case 'kpi5': return 'var(--red-600)';
    default: return 'var(--primary)';
  }
};

const getKPIName = (kpi: EnhancedKPI): string => {
  // Retourner le nom du KPI s'il existe, sinon générer un nom basé sur les propriétés
  if (kpi.name) return kpi.name;
  
  const kpiId = String(kpi.id);
  if (kpiId === 'kpi1') return 'KPI Global';
  if (kpi.hangarId) return `KPI Hangar ${kpi.hangarId}`;
  return `KPI #${kpi.id}`;
};

const getKPIPeriod = (kpi: EnhancedKPI): string => {
  // Formater la période
  const period = kpi.period || 'monthly';
  switch (period) {
    case 'daily': return 'Journalier';
    case 'weekly': return 'Hebdomadaire';
    case 'monthly': return 'Mensuel';
    case 'yearly': return 'Annuel';
    case 'actuel': return 'État actuel';
    case 'mensuel': return 'Mensuel';
    default: return period;
  }
};

const getKPIValue = (kpi: EnhancedKPI): number => {
  // Déterminer la valeur principale à afficher
  if (kpi.value !== undefined) return kpi.value;
  if (kpi.capacityUtilization !== undefined) return kpi.capacityUtilization;
  if (kpi.totalBatches !== undefined) return kpi.totalBatches;
  return 0;
};

const getKPIUnit = (kpi: EnhancedKPI): string => {
  // Déterminer l'unité à afficher
  if (kpi.unit) return kpi.unit;
  if (kpi.capacityUtilization !== undefined) return '%';
  if (kpi.totalBatches !== undefined) return 'lots';
  if (kpi.averageStorageTime !== undefined) return 'jours';
  return '';
};

const getKPITrendColor = (kpi: EnhancedKPI): string => {
  // Déterminer la couleur de la tendance
  const trend = kpi.trend || (kpi.changePercentage !== undefined && kpi.changePercentage > 0 ? 'up' : 
                              kpi.changePercentage !== undefined && kpi.changePercentage < 0 ? 'down' : 'stable');
  switch (trend) {
    case 'up': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'down': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
};

const getKPITrendIcon = (kpi: EnhancedKPI): string => {
  // Renvoyer l'icône de tendance appropriée
  const trend = kpi.trend || (kpi.changePercentage !== undefined && kpi.changePercentage > 0 ? 'up' : 
                              kpi.changePercentage !== undefined && kpi.changePercentage < 0 ? 'down' : 'stable');
  if (trend === 'up') return '↑';
  if (trend === 'down') return '↓';
  return '→';
};

const getKPIChangePercentage = (kpi: EnhancedKPI): string => {
  // Formater le pourcentage de changement
  if (kpi.changePercentage !== undefined) {
    const value = Math.abs(kpi.changePercentage).toFixed(1);
    return `${value}%`;
  }
  return '';
};

export function DashboardClient() {
  const { useMockData } = useMockDataContext();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [stats, setStats] = useState([
    { title: "Alertes Actives", value: "0", icon: Bell, color: "text-destructive", href: "/alertes" },
    { title: "Interventions Planifiées", value: "0", icon: ClipboardList, color: "text-amber-600", href: "/interventions" },
    { title: "Hangars Opérationnels", value: "0/0", icon: Warehouse, color: "text-green-600", href: "/admin/hangars" },
    { title: "Lots à Risque", value: "0", icon: BarChart3, color: "text-red-500", href: "/lots" },
  ]);
  const [recentInterventions, setRecentInterventions] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Simuler un délai pour les appels API
      const delay = useMockData ? 300 : 800;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      if (useMockData) {
        // Utiliser toutes les données mockées
        
        // Performance data pour le graphique
        const mockPerformanceData: PerformanceData[] = [
          { name: 'Jan', lots: 65, interventions: 28 },
          { name: 'Fév', lots: 59, interventions: 48 },
          { name: 'Mar', lots: 80, interventions: 40 },
          { name: 'Avr', lots: 81, interventions: 19 },
          { name: 'Mai', lots: 56, interventions: 86 },
          { name: 'Juin', lots: 55, interventions: 27 },
        ];
        setPerformanceData(mockPerformanceData);
        
        // Utiliser les données KPI mockées
        console.log("Utilisation des KPI mockées:", mockKPIData);
        
        // Statistiques
        const activeAlertsCount = mockAlertsData.filter(a => a.status === "ACTIVE").length;
        const plannedInterventionsCount = mockInterventionsData.filter(i => i.status === "PLANNED").length;
        const activeHangarsCount = mockHangars.filter(h => h.status === "ACTIVE").length;
        const totalHangarsCount = mockHangars.length;
        
        // Utiliser les données du premier KPI global (kpi1) pour les lots à risque
        const globalKPI = mockKPIData.find(k => k.id === "kpi1");
        const riskyBatchesCount = globalKPI ? globalKPI.riskyBatches : mockBatches.filter(b => {
          const storageDays = Math.floor((Date.now() - new Date(b.stockedDate).getTime()) / (1000 * 60 * 60 * 24));
          return storageDays > (b.maxStorageDays * 0.7) && b.status === "STOCKED";
        }).length;
        
        setStats([
          { title: "Alertes Actives", value: activeAlertsCount.toString(), icon: Bell, color: "text-destructive", href: "/alertes" },
          { title: "Interventions Planifiées", value: plannedInterventionsCount.toString(), icon: ClipboardList, color: "text-amber-600", href: "/interventions" },
          { title: "Hangars Opérationnels", value: `${activeHangarsCount}/${totalHangarsCount}`, icon: Warehouse, color: "text-green-600", href: "/admin/hangars" },
          { title: "Lots à Risque", value: riskyBatchesCount.toString(), icon: BarChart3, color: "text-red-500", href: "/lots" },
        ]);
        
        // Interventions récentes
        setRecentInterventions(
          mockInterventionsData
            .filter(i => i.status === "PLANNED" || i.status === "IN_PROGRESS")
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5)
        );
        
        // Alertes actives
        setActiveAlerts(
          mockAlertsData
            .filter(a => a.status === "ACTIVE" && (a.severity === "CRITICAL" || a.severity === "WARNING"))
            .sort((a, b) => {
              if (a.severity === "CRITICAL" && b.severity !== "CRITICAL") return -1;
              if (a.severity !== "CRITICAL" && b.severity === "CRITICAL") return 1;
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            })
            .slice(0, 5)
        );
      } else {
        // Ici, on simulerait des appels API pour récupérer les vraies données
        // Mais pour l'instant, on va juste utiliser des données mockées similaires mais moins complètes
        
        const apiPerformanceData: PerformanceData[] = [
          { name: 'Jan', lots: 45, interventions: 18 },
          { name: 'Fév', lots: 39, interventions: 28 },
          { name: 'Mar', lots: 60, interventions: 30 },
          { name: 'Avr', lots: 51, interventions: 19 },
          { name: 'Mai', lots: 36, interventions: 36 },
          { name: 'Juin', lots: 25, interventions: 17 },
        ];
        setPerformanceData(apiPerformanceData);
        
        // On simule des données plus limitées en base de données
        const dbActiveAlertsCount = Math.floor(mockAlertsData.filter(a => a.status === "ACTIVE").length * 0.6);
        const dbPlannedInterventionsCount = Math.floor(mockInterventionsData.filter(i => i.status === "PLANNED").length * 0.7);
        const dbActiveHangarsCount = Math.floor(mockHangars.filter(h => h.status === "ACTIVE").length * 0.8);
        const dbTotalHangarsCount = Math.floor(mockHangars.length * 0.8);
        const dbRiskyBatchesCount = Math.floor(mockBatches.filter(b => {
          const storageDays = Math.floor((Date.now() - new Date(b.stockedDate).getTime()) / (1000 * 60 * 60 * 24));
          return storageDays > (b.maxStorageDays * 0.7) && b.status === "STOCKED";
        }).length * 0.5);
        
        setStats([
          { title: "Alertes Actives", value: dbActiveAlertsCount.toString(), icon: Bell, color: "text-destructive", href: "/alertes" },
          { title: "Interventions Planifiées", value: dbPlannedInterventionsCount.toString(), icon: ClipboardList, color: "text-amber-600", href: "/interventions" },
          { title: "Hangars Opérationnels", value: `${dbActiveHangarsCount}/${dbTotalHangarsCount}`, icon: Warehouse, color: "text-green-600", href: "/admin/hangars" },
          { title: "Lots à Risque", value: dbRiskyBatchesCount.toString(), icon: BarChart3, color: "text-red-500", href: "/lots" },
        ]);
        
        // Seulement quelques interventions en base de données
        setRecentInterventions(
          mockInterventionsData
            .filter(i => i.status === "PLANNED" || i.status === "IN_PROGRESS")
            .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
            .slice(0, 3)  // Moins d'interventions disponibles
        );
        
        // Seulement quelques alertes en base de données
        setActiveAlerts(
          mockAlertsData
            .filter(a => a.status === "ACTIVE" && (a.severity === "CRITICAL" || a.severity === "WARNING"))
            .sort((a, b) => {
              if (a.severity === "CRITICAL" && b.severity !== "CRITICAL") return -1;
              if (a.severity !== "CRITICAL" && b.severity === "CRITICAL") return 1;
              return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
            })
            .slice(0, 2)  // Moins d'alertes disponibles
        );
      }
      
      setLoading(false);
    };
    
    fetchData();
  }, [useMockData]);

  // Fonction pour générer un rapport PDF du tableau de bord
  const generateDashboardReport = async () => {
    setGeneratingPdf(true);
    try {
      const htmlContent = dashboardRef.current?.innerHTML || '';
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      
      // Fonction generatePDF importée de lib/reportUtils
      await generatePDF({
        content: htmlContent,
        filename: `tableau-de-bord-${formattedDate}.pdf`,
        title: 'Tableau de Bord Gestion des Engrais',
        author: 'Système de Gestion'
      });
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Fonction pour télécharger les données de performance au format CSV
  const downloadPerformanceData = () => {
    if (!performanceData.length) return;
    
    const headers = ["Mois", "Lots Traités", "Interventions"];
    const rows = performanceData.map(item => [item.name, item.lots.toString(), item.interventions.toString()]);
    
    // Fonction generateCSV importée de lib/reportUtils
    generateCSV({
      headers,
      rows,
      filename: `performance-mensuelle-${new Date().toISOString().slice(0, 10)}.csv`
    });
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
        
        {/* Section KPI détaillés */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Indicateurs de Performance</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {useMockData && mockKPIData && mockKPIData.slice(0, 3).map((kpi) => (
              <Card key={kpi.id} className="overflow-hidden border-t-4 hover:shadow-lg transition-all duration-300" 
                style={{ borderTopColor: getKPIColor(kpi) }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{getKPIName(kpi)}</CardTitle>
                  <CardDescription>{getKPIPeriod(kpi)}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold">
                      {getKPIValue(kpi)}
                      <span className="text-sm ml-1 font-normal text-muted-foreground">{getKPIUnit(kpi)}</span>
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full ${getKPITrendColor(kpi)}`}>
                      {getKPITrendIcon(kpi)}
                      <span className="text-xs ml-1">{getKPIChangePercentage(kpi)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-amber-200">Interventions Récentes</CardTitle>
              <CardDescription className="dark:text-gray-300">Liste des dernières interventions programmées ou en cours.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {recentInterventions.length > 0 ? recentInterventions.map(intervention => (
                      <li key={intervention.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                        <div>
                          <p className="font-medium">{intervention.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Hangar {intervention.hangarId}
                            {intervention.batchId ? ` - Lot ${intervention.batchId}` : ''}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          {intervention.status === "PLANNED" ? "Planifiée" : "En cours"}
                        </span>
                      </li>
                    )) : (
                      <li className="text-center py-4 text-muted-foreground">Aucune intervention récente</li>
                    )}
                  </ul>
                  <Link href="/interventions" className="text-sm text-primary hover:underline mt-4 block">
                    Voir toutes les interventions &rarr;
                  </Link>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-amber-200">Alertes Actives</CardTitle>
              <CardDescription className="dark:text-gray-300">Alertes nécessitant une attention immédiate.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
                  <span>Chargement...</span>
                </div>
              ) : (
                <>
                  <ul className="space-y-3">
                    {activeAlerts.length > 0 ? activeAlerts.map(alert => (
                      <li key={alert.id} className="flex justify-between items-center p-3 bg-destructive/10 rounded-md">
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {alert.batchId ? `Lot ${alert.batchId} - ` : ''}
                            Hangar {alert.hangarId}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-destructive">
                          {alert.severity === "CRITICAL" ? "Critique" : "Urgence"}
                        </span>
                      </li>
                    )) : (
                      <li className="text-center py-4 text-muted-foreground">Aucune alerte critique active</li>
                    )}
                  </ul>
                  <Link href="/alertes" className="text-sm text-primary hover:underline mt-4 block">
                    Voir toutes les alertes &rarr;
                  </Link>
                </>
              )}
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
