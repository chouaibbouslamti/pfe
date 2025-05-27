"use client";

import Link from "next/link";
import { UserNav } from "./UserNav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Warehouse } from "lucide-react"; // Using a warehouse icon to better match the app theme

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-gradient-to-r from-primary/90 to-primary px-4 md:px-6 justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="md:hidden text-white">
            <SidebarTrigger />
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base transition-transform hover:scale-105">
          <div className="bg-white p-1.5 rounded-full shadow-sm">
            <Warehouse className="h-5 w-5 text-primary" />
          </div>
          <span className="sr-only">Gestion hangar et intervention au cacking (GHIC)</span>
        </Link>
        <h1 className="text-lg font-semibold hidden md:block text-white tracking-wide">Gestion hangar et intervention au cacking (GHIC)</h1>
      </div>
      <UserNav />      
    </header>
  );
}
