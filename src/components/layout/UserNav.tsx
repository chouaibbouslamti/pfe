"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { LogOut, User as UserIcon, ShieldCheck, UserCog } from "lucide-react";
import Link from "next/link";

export function UserNav() {
  const { currentUser, userProfile, logout } = useAuth();

  if (!currentUser || !userProfile) {
    return null;
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return `${firstName[0]}`.toUpperCase();
    }
    if (userProfile.email) {
      return userProfile.email[0].toUpperCase();
    }
    return "U";
  };
  
  const roleDisplay = {
    SUPER_ADMIN: "Super Admin",
    TEAM_MANAGER: "Chef d'équipe",
    USER: "Utilisateur",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={userProfile.photoURL || `https://placehold.co/100x100.png?text=${getInitials(userProfile.firstName, userProfile.lastName)}`} 
              alt={userProfile.username || "Avatar"}
              data-ai-hint="user avatar" 
            />
            <AvatarFallback>{getInitials(userProfile.firstName, userProfile.lastName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {userProfile.firstName} {userProfile.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profil" className="flex items-center">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </Link>
          </DropdownMenuItem>
          {userProfile.role === "SUPER_ADMIN" && (
            <DropdownMenuItem asChild>
               <Link href="/admin/utilisateurs" className="flex items-center">
                 <UserCog className="mr-2 h-4 w-4" />
                <span>Gestion Admin</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
         <DropdownMenuItem className="text-xs text-muted-foreground cursor-default hover:bg-transparent focus:bg-transparent">
            <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>Rôle: {roleDisplay[userProfile.role]}</span>
          </DropdownMenuItem>
        <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
