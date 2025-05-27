import type { Metadata } from "next";
import { Suspense } from "react";
import { KpiClient } from "./KpiClient";

export const metadata: Metadata = {
  title: "Indicateurs de Performance (KPI) - Gestion hangar et intervention au cacking (GHIC)",
  description: "Visualisez les indicateurs clés de performance pour les hangars et les opérations.",
};

export default function KpiPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#0c1015] dark:text-[#0c1015] drop-shadow-sm">Indicateurs de Performance Clés (KPI)</h1>
        <p className="text-[#0c1015] dark:text-[#0c1015] font-medium">Analyse des performances opérationnelles.</p>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center h-96">Chargement des graphiques...</div>}>
        <KpiClient />
      </Suspense>
    </div>
  );
}
