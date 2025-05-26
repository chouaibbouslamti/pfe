"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Hangar, Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon, Warehouse, Users, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { mockHangars, mockTeams } from "@/lib/mockData";

const interventionSchema = z.object({
  description: z.string().min(10, "La description doit contenir au moins 10 caractères."),
  scheduledTime: z.date({ required_error: "La date planifiée est requise." }),
  expectedResolutionTime: z.date({ required_error: "Le temps estimé de résolution est requis." }),
  hangarId: z.string().min(1, "Le hangar est requis."),
  teamId: z.string().min(1, "L'équipe est requise."),
});

type InterventionFormData = z.infer<typeof interventionSchema>;

export default function CreateInterventionPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [hangars, setHangars] = useState<Hangar[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      description: "",
      scheduledTime: new Date(),
      expectedResolutionTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2 heures
      hangarId: "",
      teamId: "",
    },
  });

  useEffect(() => {
    if (!authLoading && userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role)) {
      router.replace("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les hangars
        const hangarsResponse = await fetch('/api/hangars');
        
        if (hangarsResponse.ok) {
          const hangarsData = await hangarsResponse.json();
          setHangars(hangarsData);
        } else {
          // Utiliser les données mockées en cas d'erreur
          setHangars(mockHangars);
          console.error('Failed to fetch hangars');
        }
      } catch (error) {
        console.error('Error fetching hangars:', error);
        // Utiliser les données mockées en cas d'erreur
        setHangars(mockHangars);
      }

      try {
        // Récupérer les équipes
        const teamsResponse = await fetch('/api/teams');
        
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          setTeams(teamsData);
        } else {
          // Utiliser les données mockées en cas d'erreur
          setTeams(mockTeams);
          console.error('Failed to fetch teams');
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
        // Utiliser les données mockées en cas d'erreur
        setTeams(mockTeams);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (values: InterventionFormData) => {
    try {
      // Envoyer les données à l'API
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('Failed to create intervention');
      }

      toast({ 
        title: "Intervention créée", 
        description: "L'intervention a été créée avec succès." 
      });
      
      // Rediriger vers la liste des interventions
      router.push('/interventions');
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast({ 
        title: "Erreur", 
        description: "Impossible de créer l'intervention. Veuillez réessayer.", 
        variant: "destructive" 
      });
    }
  };

  if (authLoading || (!userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile?.role || ""))) {
    return <div className="flex justify-center items-center h-screen"><p>Chargement ou accès non autorisé...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex items-center">
        <Link href="/interventions" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Planifier une Intervention</h1>
          <p className="text-muted-foreground">Créez une nouvelle intervention pour un hangar.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulaire d'Intervention</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 md:col-span-2">
                <div>
                  <Label htmlFor="description">Description de l'intervention</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez l'intervention à réaliser..."
                    className="min-h-[120px]"
                    {...form.register("description")}
                  />
                  {form.formState.errors.description && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.description.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="hangarId">Hangar</Label>
                  <Controller
                    name="hangarId"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="hangarId" className="w-full">
                          <SelectValue placeholder="Sélectionner un hangar" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingData ? (
                            <SelectItem value="loading" disabled>Chargement...</SelectItem>
                          ) : (
                            hangars.map((hangar) => (
                              <SelectItem key={hangar.id} value={String(hangar.id)}>
                                <div className="flex items-center">
                                  <Warehouse className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{hangar.name} ({hangar.location})</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.hangarId && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.hangarId.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="teamId">Équipe assignée</Label>
                  <Controller
                    name="teamId"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="teamId" className="w-full">
                          <SelectValue placeholder="Sélectionner une équipe" />
                        </SelectTrigger>
                        <SelectContent>
                          {loadingData ? (
                            <SelectItem value="loading" disabled>Chargement...</SelectItem>
                          ) : (
                            teams.map((team) => (
                              <SelectItem key={team.id} value={String(team.id)}>
                                <div className="flex items-center">
                                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                                  <span>{team.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.teamId && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.teamId.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="scheduledTime">Date planifiée</Label>
                  <Controller
                    name="scheduledTime"
                    control={form.control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="scheduledTime"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP à HH:mm", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Label htmlFor="scheduledTime-time">Heure</Label>
                            <Input
                              id="scheduledTime-time"
                              type="time"
                              value={format(field.value || new Date(), "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const newDate = new Date(field.value || new Date());
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                field.onChange(newDate);
                              }}
                              className="mt-1"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.scheduledTime && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.scheduledTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="expectedResolutionTime">Temps estimé de résolution</Label>
                  <Controller
                    name="expectedResolutionTime"
                    control={form.control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                            id="expectedResolutionTime"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP à HH:mm", { locale: fr })
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => field.onChange(date)}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <Label htmlFor="expectedResolutionTime-time">Heure</Label>
                            <Input
                              id="expectedResolutionTime-time"
                              type="time"
                              value={format(field.value || new Date(), "HH:mm")}
                              onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(":");
                                const newDate = new Date(field.value || new Date());
                                newDate.setHours(parseInt(hours, 10));
                                newDate.setMinutes(parseInt(minutes, 10));
                                field.onChange(newDate);
                              }}
                              className="mt-1"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {form.formState.errors.expectedResolutionTime && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedResolutionTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => router.push('/interventions')}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Création..." : "Créer l'intervention"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
