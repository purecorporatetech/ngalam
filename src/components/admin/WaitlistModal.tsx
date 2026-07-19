import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { type Campaign, formatParisDate } from "@/lib/signares";

type WaitlistRow = Tables<"waitlist">;

interface WaitlistModalProps {
  campaigns: Campaign[];
  open: boolean;
  onClose: () => void;
  // Filtre initial : id de campagne, "general", ou "all".
  initialFilter?: string;
}

const WaitlistModal = ({ campaigns, open, onClose, initialFilter = "all" }: WaitlistModalProps) => {
  const [filter, setFilter] = useState(initialFilter);

  // À chaque ouverture, aligne le filtre sur celui demandé (ligne ou bouton global).
  useEffect(() => {
    if (open) setFilter(initialFilter);
  }, [open, initialFilter]);

  const { data: rows, isLoading } = useQuery<WaitlistRow[]>({
    queryKey: ["waitlist-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WaitlistRow[];
    },
    enabled: open,
  });

  const campaignTitle = (id: string | null) =>
    id === null ? "Liste générale" : campaigns.find((c) => c.id === id)?.title ?? "—";

  const filtered = useMemo(() => {
    if (!rows) return [];
    if (filter === "all") return rows;
    if (filter === "general") return rows.filter((r) => r.campaign_id === null);
    return rows.filter((r) => r.campaign_id === filter);
  }, [rows, filter]);

  const exportCsv = () => {
    const header = ["email", "campagne", "date"];
    const lines = filtered.map((r) => [
      r.email,
      campaignTitle(r.campaign_id),
      formatParisDate(r.created_at),
    ]);
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [header, ...lines].map((row) => row.map(escape).join(",")).join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${filter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Le Cercle — inscrits</DialogTitle>
          <DialogDescription>Liste d'attente des Signares (lecture seule).</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3 mb-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les inscriptions</SelectItem>
              <SelectItem value="general">Liste générale</SelectItem>
              {campaigns.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Exporter CSV
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Chargement…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center italic">
            Personne n'a encore rejoint le Cercle ici.
          </p>
        ) : (
          <div className="border border-border rounded-sm divide-y divide-border">
            {filtered.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-foreground truncate">{r.email}</span>
                <span className="flex items-center gap-4 shrink-0">
                  <span className="text-muted-foreground text-xs">{campaignTitle(r.campaign_id)}</span>
                  <span className="text-muted-foreground text-xs">{formatParisDate(r.created_at)}</span>
                </span>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-2">{filtered.length} inscrit(s)</p>
      </DialogContent>
    </Dialog>
  );
};

export default WaitlistModal;
