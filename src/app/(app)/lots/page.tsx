
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import type { Batch, Hangar, Team } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PackageSearch, PlusCircle, Edit, Trash2, MoreHorizontal, CalendarIcon, Filter } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";
import { mockBatches, mockHangars, mockTeams, generateId } from "@/lib/mockData";


const batchSchema = z.object({
  fertilizerType: z.string().min(3, "Le type d'engrais est requis."),
  quantity: z.coerce.number().min(0.1, "La quantité doit être positive."),
  unit: z.string().min(1, "L'unité est requise (ex: kg, tonnes)."),
  stockedDate: z.date({ required_error: "La date de stockage est requise." }),
  expectedTransportDate: z.date({ required_error: "La date de transport prévue est requise." }),
  maxStorageDays: z.coerce.number().min(1, "La durée max de stockage est requise."),
  hangarId: z.string().min(1, "Le hangar est requis."),
  teamId: z.string().optional(),
  status: z.enum(["STOCKED", "PROCESSING", "TRANSPORTED", "SPOILED"]),
});

type BatchFormData = z.infer<typeof batchSchema>;

export default function BatchesPage() {
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hangarIdFilter = searchParams.get('hangarId');

  const [allBatches, setAllBatches] = useState<Batch[]>(mockBatches);
  const [hangars] = useState<Hangar[]>(mockHangars); // Mock data, no need to fetch
  const [teams] = useState<Team[]>(mockTeams); // Mock data
  const [loadingData, setLoadingData] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const { toast } = useToast();

  const form = useForm<BatchFormData>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      fertilizerType: "",
      quantity: 0,
      unit: "tonnes",
      maxStorageDays: 30,
      hangarId: hangarIdFilter || "",
      status: "STOCKED",
    },
  });
  
  useEffect(() => {
    if (hangarIdFilter) {
        form.setValue("hangarId", hangarIdFilter);
    }
  }, [hangarIdFilter, form]);

  useEffect(() => {
    if (!authLoading && userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role)) {
      router.replace("/dashboard");
    }
  }, [userProfile, authLoading, router]);

  const filteredBatches = useMemo(() => {
    if (!hangarIdFilter) return allBatches;
    return allBatches.filter(batch => batch.hangarId === hangarIdFilter);
  }, [allBatches, hangarIdFilter]);


  const onSubmit = async (values: BatchFormData) => {
    try {
      if (editingBatch) {
        setAllBatches(prevBatches => 
          prevBatches.map(b => b.id === editingBatch.id ? { ...editingBatch, ...values } : b)
        );
        toast({ title: "Succès (simulation)", description: "Lot mis à jour." });
      } else {
        const newBatch: Batch = { 
          id: generateId(), 
          ...values, 
          createdAt: new Date() 
        };
        setAllBatches(prevBatches => [...prevBatches, newBatch]);
        toast({ title: "Succès (simulation)", description: "Nouveau lot créé." });
      }
      form.reset({ fertilizerType: "", quantity: 0, unit: "tonnes", maxStorageDays: 30, hangarId: hangarIdFilter || "", status: "STOCKED" });
      setEditingBatch(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving batch:", error);
      toast({ title: "Erreur (simulation)", description: "Impossible de sauvegarder le lot.", variant: "destructive" });
    }
  };
  
  const openEditDialog = (batch: Batch) => {
    setEditingBatch(batch);
    form.reset({
        ...batch,
        stockedDate: new Date(batch.stockedDate), // Ensure it's a Date object
        expectedTransportDate: new Date(batch.expectedTransportDate), // Ensure it's a Date object
    });
    setIsDialogOpen(true);
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce lot? Cette action est irréversible (simulation).")) return;
    setAllBatches(prevBatches => prevBatches.filter(b => b.id !== batchId));
    toast({ title: "Succès (simulation)", description: "Lot supprimé." });
  };
  
  const getHangarName = (id: string) => hangars.find(h => h.id === id)?.name || "N/A";

  if (authLoading || (userProfile && !["SUPER_ADMIN", "TEAM_MANAGER"].includes(userProfile.role) && !loadingData)) {
     return <div className="flex justify-center items-center h-screen"><p>Accès non autorisé ou chargement...</p></div>;
  }

  return (
    <div className="container mx-auto py-2">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Lots d'Engrais</h1>
          <p className="text-muted-foreground">Suivez les lots stockés, leur statut et dates clés (simulation locale).</p>
        </div>
         <div className="flex gap-2 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => router.push('/lots')} disabled={!hangarIdFilter}>
                <Filter className="mr-2 h-4 w-4" /> Tous les lots
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
                setIsDialogOpen(isOpen);
                if (!isOpen) {
                form.reset({ fertilizerType: "", quantity: 0, unit: "tonnes", maxStorageDays: 30, hangarId: hangarIdFilter || "", status: "STOCKED" });
                setEditingBatch(null);
                }
            }}>
            <DialogTrigger asChild>
                <Button onClick={() => { form.reset({ fertilizerType: "", quantity: 0, unit: "tonnes", maxStorageDays: 30, hangarId: hangarIdFilter || "", status: "STOCKED", stockedDate: new Date(), expectedTransportDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }); setEditingBatch(null); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Lot
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                <DialogTitle>{editingBatch ? "Modifier le Lot" : "Ajouter un Nouveau Lot"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="fertilizerType">Type d'engrais</Label><Input id="fertilizerType" {...form.register("fertilizerType")} />{form.formState.errors.fertilizerType && <p className="text-sm text-destructive mt-1">{form.formState.errors.fertilizerType.message}</p>}</div>
                        <div><Label htmlFor="quantity">Quantité</Label><Input id="quantity" type="number" step="0.01" {...form.register("quantity")} />{form.formState.errors.quantity && <p className="text-sm text-destructive mt-1">{form.formState.errors.quantity.message}</p>}</div>
                        <div><Label htmlFor="unit">Unité</Label><Input id="unit" {...form.register("unit")} />{form.formState.errors.unit && <p className="text-sm text-destructive mt-1">{form.formState.errors.unit.message}</p>}</div>
                        <div><Label htmlFor="maxStorageDays">Durée max stockage (jours)</Label><Input id="maxStorageDays" type="number" {...form.register("maxStorageDays")} />{form.formState.errors.maxStorageDays && <p className="text-sm text-destructive mt-1">{form.formState.errors.maxStorageDays.message}</p>}</div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller control={form.control} name="stockedDate" render={({ field }) => (
                            <div><Label>Date de Stockage</Label>
                            <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            {form.formState.errors.stockedDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.stockedDate.message}</p>}</div>
                        )} />
                        <Controller control={form.control} name="expectedTransportDate" render={({ field }) => (
                             <div><Label>Date Transport Prévue</Label>
                             <Popover><PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal"><CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP", { locale: fr }) : <span>Choisir une date</span>}</Button>
                            </PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            {form.formState.errors.expectedTransportDate && <p className="text-sm text-destructive mt-1">{form.formState.errors.expectedTransportDate.message}</p>}</div>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label htmlFor="hangarId">Hangar</Label><Controller name="hangarId" control={form.control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="hangarId"><SelectValue placeholder="Sélectionner un hangar" /></SelectTrigger>
                            <SelectContent>{hangars.filter(h => h.status === 'ACTIVE').map(h => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}</SelectContent></Select>
                        )} />{form.formState.errors.hangarId && <p className="text-sm text-destructive mt-1">{form.formState.errors.hangarId.message}</p>}</div>
                        <div><Label htmlFor="teamId">Équipe (optionnel)</Label><Controller name="teamId" control={form.control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="teamId"><SelectValue placeholder="Sélectionner une équipe" /></SelectTrigger>
                            <SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
                        )} /></div>
                    </div>
                    <div><Label htmlFor="status">Statut</Label><Controller name="status" control={form.control} render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}><SelectTrigger id="status"><SelectValue placeholder="Statut du lot" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="STOCKED">Stocké</SelectItem><SelectItem value="PROCESSING">En traitement</SelectItem>
                            <SelectItem value="TRANSPORTED">Transporté</SelectItem><SelectItem value="SPOILED">Détérioré</SelectItem>
                        </SelectContent></Select>
                    )} /></div>
                    <DialogFooter><Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button><Button type="submit">Sauvegarder</Button></DialogFooter>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Liste des Lots {hangarIdFilter ? `dans ${getHangarName(hangarIdFilter)}`: ''}</CardTitle></CardHeader>
        <CardContent>
          {loadingData ? ( // Should be false quickly for mock data
            <div className="text-center py-10"><PackageSearch className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" /><p className="mt-2">Chargement des lots...</p></div>
          ) : filteredBatches.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type Engrais</TableHead><TableHead>Quantité</TableHead><TableHead>Hangar</TableHead>
                    <TableHead>Stocké le</TableHead><TableHead>Transport Prévu</TableHead>
                    <TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.fertilizerType}</TableCell>
                      <TableCell>{batch.quantity} {batch.unit}</TableCell>
                      <TableCell><Link href={`/lots?hangarId=${batch.hangarId}`} className="hover:underline text-primary">{getHangarName(batch.hangarId)}</Link></TableCell>
                      <TableCell>{format(new Date(batch.stockedDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell>{format(new Date(batch.expectedTransportDate), "dd/MM/yyyy")}</TableCell>
                      <TableCell><Badge variant={batch.status === "SPOILED" ? "destructive" : batch.status === "TRANSPORTED" ? "outline" : "secondary"}>
                        { {STOCKED: "Stocké", PROCESSING: "Traitement", TRANSPORTED: "Transporté", SPOILED: "Détérioré"}[batch.status] }
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(batch)}><Edit className="mr-2 h-4 w-4" /> Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBatch(batch.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Supprimer</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild><Link href={`/interventions/creer?batchId=${batch.id}`}>Créer Intervention</Link></DropdownMenuItem>
                        </DropdownMenuContent></DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
             <div className="text-center py-10">
              <PackageSearch className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">Aucun lot trouvé</h3>
              <p className="mt-1 text-sm text-muted-foreground">{ hangarIdFilter ? `Aucun lot dans ${getHangarName(hangarIdFilter)}.` : "Commencez par ajouter un nouveau lot."}</p>
              <Button className="mt-6" onClick={() => { form.reset({ fertilizerType: "", quantity: 0, unit: "tonnes", maxStorageDays: 30, hangarId: hangarIdFilter || "", status: "STOCKED", stockedDate: new Date(), expectedTransportDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }); setEditingBatch(null); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Lot
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
