import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, GitBranch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from "date-fns";

export default function ReferralsPage() {
  const { organization } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [referrerId, setReferrerId] = useState("");
  const [referredId, setReferredId] = useState("");
  const [notes, setNotes] = useState("");

  const { data: contacts } = useQuery({
    queryKey: ["contacts-list", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("contacts").select("id, full_name").eq("organization_id", orgId!).order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: referrals, isLoading } = useQuery({
    queryKey: ["referrals", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*, referrer:referrer_contact_id(full_name), referred:referred_contact_id(full_name)")
        .eq("organization_id", orgId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const addReferral = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("referrals").insert({
        organization_id: orgId,
        referrer_contact_id: referrerId,
        referred_contact_id: referredId,
        notes: notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referrals", orgId] });
      toast({ title: "Referral tracked" });
      setAddOpen(false);
      setReferrerId(""); setReferredId(""); setNotes("");
    },
  });

  // Top referrers
  const referrerCounts: Record<string, { name: string; count: number }> = {};
  referrals?.forEach((r) => {
    const id = r.referrer_contact_id || "";
    const name = (r.referrer as { full_name: string } | null)?.full_name || "Unknown";
    if (!referrerCounts[id]) referrerCounts[id] = { name, count: 0 };
    referrerCounts[id].count++;
  });
  const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Referrals</h1>
          <p className="text-[#8B949E] text-sm mt-1">{referrals?.length || 0} total referrals</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" size="sm" data-testid="button-add-referral">
          <Plus className="h-4 w-4 mr-1" />
          Track referral
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top referrers */}
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl">
          <div className="px-4 py-3 border-b border-[#30363D]">
            <span className="text-sm font-semibold text-[#E6EDF3]">Top Referrers</span>
          </div>
          <div className="p-2">
            {topReferrers.length === 0 && (
              <div className="py-8 text-center text-[#484F58] text-sm">No referrals yet</div>
            )}
            {topReferrers.map(([id, { name, count }], i) => (
              <div key={id} className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-[#21262D] transition-colors">
                <div className="w-7 h-7 rounded-full bg-[#00E5A015] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#00E5A0]">#{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E6EDF3] truncate">{name}</div>
                </div>
                <div className="text-sm font-bold text-[#00E5A0]">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* All referrals */}
        <div className="lg:col-span-2 bg-[#161B22] border border-[#30363D] rounded-xl">
          <div className="px-4 py-3 border-b border-[#30363D]">
            <span className="text-sm font-semibold text-[#E6EDF3]">Recent Referrals</span>
          </div>
          <div className="divide-y divide-[#30363D]">
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-4 py-3"><Skeleton className="h-4 w-full bg-[#21262D]" /></div>
            ))}
            {!isLoading && referrals?.length === 0 && (
              <div className="px-4 py-10 text-center">
                <GitBranch className="h-8 w-8 text-[#484F58] mx-auto mb-2" />
                <p className="text-[#484F58] text-sm">No referrals tracked yet</p>
              </div>
            )}
            {referrals?.map((r) => (
              <div key={r.id} className="px-4 py-3 flex items-center gap-3" data-testid={`referral-${r.id}`}>
                <div className="flex-1 flex items-center gap-2 text-sm">
                  <span className="font-medium text-[#E6EDF3]">{(r.referrer as { full_name: string } | null)?.full_name || "Unknown"}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#00E5A0]" />
                  <span className="text-[#8B949E]">{(r.referred as { full_name: string } | null)?.full_name || "Unknown"}</span>
                </div>
                {r.notes && <span className="text-xs text-[#484F58] hidden md:block truncate max-w-[120px]">{r.notes}</span>}
                <span className="text-xs text-[#484F58] flex-shrink-0">{r.created_at ? format(parseISO(r.created_at), "MMM d") : ""}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">Track Referral</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Referrer (who referred)</Label>
              <Select value={referrerId} onValueChange={setReferrerId}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="select-referrer">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {contacts?.map((c) => <SelectItem key={c.id} value={c.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Referred (who was referred)</Label>
              <Select value={referredId} onValueChange={setReferredId}>
                <SelectTrigger className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="select-referred">
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent className="bg-[#1C2128] border-[#30363D]">
                  {contacts?.filter((c) => c.id !== referrerId).map((c) => <SelectItem key={c.id} value={c.id} className="text-[#E6EDF3] focus:bg-[#21262D]">{c.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional context..." className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] min-h-[60px]" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button onClick={() => addReferral.mutate()} disabled={!referrerId || !referredId || addReferral.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-referral">
                Track Referral
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
