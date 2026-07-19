import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Radio, Lock } from "lucide-react";
import { toast } from "sonner";
import CampaignForm from "./CampaignForm";
import WaitlistModal from "./WaitlistModal";
import { type Campaign, formatParisDate } from "@/lib/signares";

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  scheduled: { label: "Programmée", variant: "outline" },
  live: { label: "En ligne", variant: "default" },
  closed: { label: "Refermée", variant: "secondary" },
};

const CampaignsTab = () => {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [waitlistFilter, setWaitlistFilter] = useState("all");

  const { data: campaigns, refetch } = useQuery<Campaign[]>({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns").select("*").order("opens_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });

  const { data: pieceCounts } = useQuery<Record<string, number>>({
    queryKey: ["admin-drop-piece-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("drop_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const p of data ?? []) if (p.drop_id) counts[p.drop_id] = (counts[p.drop_id] ?? 0) + 1;
      return counts;
    },
  });

  const { data: waitCounts } = useQuery<Record<string, number>>({
    queryKey: ["admin-waitlist-counts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("waitlist").select("campaign_id");
      if (error) throw error;
      const counts: Record<string, number> = {};
      for (const w of data ?? []) if (w.campaign_id) counts[w.campaign_id] = (counts[w.campaign_id] ?? 0) + 1;
      return counts;
    },
  });

  const refetchAll = () => { refetch(); };

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("campaigns").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "live" ? "Signare mise en ligne" : status === "closed" ? "Signare refermée" : "Statut mis à jour");
    refetch();
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Signare supprimée");
    refetch();
  };

  const openWaitlist = (filter: string) => { setWaitlistFilter(filter); setWaitlistOpen(true); };

  if (creating || editing) {
    return (
      <div>
        <h2 className="font-serif text-xl font-semibold mb-4">
          {editing ? `Modifier « ${editing.title} »` : "Nouvelle Signare"}
        </h2>
        <CampaignForm
          campaign={editing ?? undefined}
          onSuccess={() => { setCreating(false); setEditing(null); refetchAll(); }}
          onCancel={() => { setCreating(false); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold">Édition Signares</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => openWaitlist("all")}>
            <Users className="h-4 w-4" />
            Le Cercle
          </Button>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Nouvelle Signare
          </Button>
        </div>
      </div>

      <div className="border border-border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Signare</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Fenêtre (Paris)</TableHead>
              <TableHead>Pièces</TableHead>
              <TableHead>Cercle</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Aucune Signare. Crée la première capsule du mois.
                </TableCell>
              </TableRow>
            )}
            {campaigns?.map((c) => {
              const meta = STATUS_META[c.status] ?? { label: c.status, variant: "outline" as const };
              return (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{c.title}</div>
                    {c.valeur && <div className="text-xs text-primary italic">{c.valeur}</div>}
                  </TableCell>
                  <TableCell><Badge variant={meta.variant}>{meta.label}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatParisDate(c.opens_at)} → {formatParisDate(c.closes_at)}
                  </TableCell>
                  <TableCell>{pieceCounts?.[c.id] ?? 0}</TableCell>
                  <TableCell>
                    <button className="text-primary hover:underline" onClick={() => openWaitlist(c.id)}>
                      {waitCounts?.[c.id] ?? 0}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {c.status === "scheduled" && (
                        <Button variant="ghost" size="sm" onClick={() => setStatus(c.id, "live")} title="Mettre en ligne">
                          <Radio className="h-4 w-4" /> En ligne
                        </Button>
                      )}
                      {c.status === "live" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" title="Refermer">
                              <Lock className="h-4 w-4" /> Refermer
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Refermer « {c.title} » ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Une Signare refermée part au Vestiaire et n'est <strong>plus jamais rachetable</strong>.
                                C'est un acte définitif — le geste rare qui fait la valeur de l'Édition. Confirmer&nbsp;?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction onClick={() => setStatus(c.id, "closed")} className="bg-primary text-primary-foreground hover:bg-primary/90">
                                Refermer à jamais
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setEditing(c)} title="Modifier">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Supprimer">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer « {c.title} » ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Les pièces rattachées seront détachées (drop_id remis à vide) mais pas supprimées.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCampaign(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <WaitlistModal
        campaigns={campaigns ?? []}
        open={waitlistOpen}
        onClose={() => setWaitlistOpen(false)}
        initialFilter={waitlistFilter}
      />
    </div>
  );
};

export default CampaignsTab;
