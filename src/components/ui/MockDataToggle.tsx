"use client";

import { Button } from "@/components/ui/button";
import { useMockDataContext } from "@/contexts/MockDataContext";
import { Database, FileStack } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MockDataToggle() {
  const { useMockData, toggleMockData } = useMockDataContext();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-xs"
            onClick={toggleMockData}
          >
            {useMockData ? (
              <FileStack className="h-4 w-4 text-amber-500" />
            ) : (
              <Database className="h-4 w-4 text-blue-500" />
            )}
            <span className="hidden md:inline">Données</span>
            <Badge
              variant={useMockData ? "outline" : "default"}
              className={useMockData ? "bg-amber-100 hover:bg-amber-100" : ""}
            >
              {useMockData ? "Statiques" : "Base de données"}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            {useMockData
              ? "Utilise les données statiques enrichies"
              : "Utilise les données de la base de données"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
