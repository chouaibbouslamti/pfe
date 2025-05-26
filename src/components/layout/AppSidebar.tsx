"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import {
  LayoutDashboard,
  Bell,
  UserCircle,
  Warehouse,
  ListChecks,
  BarChart3,
  Users,
  Building2,
  Settings,
  PackageSearch, // For Batches
  ClipboardList, // For Interventions
} from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuSkeleton
} from "@/components/ui/sidebar"; // Using the complex sidebar from shadcn

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: ("SUPER_ADMIN" | "TEAM_MANAGER" | "USER")[];
  disabled?: boolean; // For features not yet implemented
}

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Tableau de Bord", icon: LayoutDashboard, roles: ["SUPER_ADMIN", "TEAM_MANAGER", "USER"] },
  { href: "/alertes", label: "Alertes", icon: Bell, roles: ["SUPER_ADMIN", "TEAM_MANAGER", "USER"] },
  { href: "/interventions", label: "Interventions", icon: ClipboardList, roles: ["SUPER_ADMIN", "TEAM_MANAGER"] },
  { href: "/taches", label: "Mes Tâches", icon: ListChecks, roles: ["USER"] },
  { href: "/admin/hangars", label: "Hangars", icon: Warehouse, roles: ["SUPER_ADMIN", "TEAM_MANAGER"], disabled: false },
  { href: "/lots", label: "Lots d'Engrais", icon: PackageSearch, roles: ["SUPER_ADMIN", "TEAM_MANAGER"], disabled: false },
  { href: "/kpi", label: "Indicateurs (KPI)", icon: BarChart3, roles: ["SUPER_ADMIN", "TEAM_MANAGER"] },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["SUPER_ADMIN"] },
  { href: "/admin/equipes", label: "Équipes", icon: Building2, roles: ["SUPER_ADMIN"] },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return (
       <Sidebar>
        <SidebarHeader className="p-4">
          <h2 className="text-lg font-semibold">Chargement...</h2>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {[...Array(5)].map((_, i) => <SidebarMenuSkeleton key={i} showIcon />)}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    );
  }
  
  const userRole = userProfile.role;

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-0">
        {/* Can add a logo or app name here if desired, currently in AppHeader */}
      </SidebarHeader>
      <SidebarContent className="flex-grow p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.disabled ? "#" : item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  className={cn(
                    "w-full justify-start",
                    item.disabled && "cursor-not-allowed opacity-50"
                  )}
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  aria-disabled={item.disabled}
                  disabled={item.disabled}
                  tooltip={item.label}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="truncate">{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-2">
         <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/profil" legacyBehavior passHref>
                <SidebarMenuButton 
                  className="w-full justify-start"
                  isActive={pathname === "/profil"}
                  tooltip="Profil"
                >
                  <UserCircle className="h-5 w-5 mr-3" />
                  <span className="truncate">Profil</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            {/* Can add settings or other footer items here */}
         </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
