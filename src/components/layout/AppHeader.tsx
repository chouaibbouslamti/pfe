"use client";

import Link from "next/link";
import { UserNav } from "./UserNav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Package2 } from "lucide-react"; // Using a generic app icon

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 justify-between">
      <div className="flex items-center gap-2">
        <div className="md:hidden">
            <SidebarTrigger />
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6 text-primary" />
          <span className="sr-only">Gestion Hangar Intelligent</span>
        </Link>
        <h1 className="text-lg font-semibold hidden md:block">Gestion Hangar Intelligent</h1>
      </div>
      <UserNav />
    </header>
  );
}
