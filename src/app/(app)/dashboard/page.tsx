import type { Metadata } from "next";
import { Suspense } from "react";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Tableau de Bord - Gestion hangar et intervention au cacking (GHIC)",
  description: "Vue d'ensemble de vos activités et indicateurs clés.",
};

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-2">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[#0c1015] dark:text-[#0c1015] drop-shadow-sm">Tableau de Bord</h1>
        <p className="text-[#0c1015] dark:text-[#0c1015] font-medium">Bienvenue ! Voici un aperçu de vos activités.</p>
      </div>

      <Suspense fallback={<div className="flex items-center justify-center h-48">Chargement du tableau de bord...</div>}>
        <DashboardClient />
      </Suspense>
    </div>
  );
}
