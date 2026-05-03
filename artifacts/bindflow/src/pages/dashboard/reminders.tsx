import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Bell, CheckCircle, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isPast, isToday, isTomorrow } from "date-fns";
import type { Reminder } from "@/types/database";

const reminderSchema = z.object({
  title: z.string().min(1, "Title required"),
  notes: z.string().optional(),
  due_date: z.string().min(1, "Due date required"),
  reminder_type: z.string().default("manual"),
});
type ReminderForm = z.infer<typeof reminderSchema>;
type ReminderRow = Reminder & { contacts?: { full_name: string } | null };

export default function RemindersPage() {
  const { organization, user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");

  const form = useForm<ReminderForm>({
    resolver: zodResolver(reminderSchema),
    defaultValues: { title: "", notes: "", due_date: "", reminder_type: "manual" },
  });

  const { data: reminders, isLoading } = useQuery<ReminderRow[]>({
    queryKey: ["reminders", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select("*, contacts(full_name)")
        .eq("organization_id", orgId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const addReminder = useMutation({
    mutationFn: async (data: ReminderForm) => {
      const { error } = await supabase.from("reminders").insert({
        ...data,
        organization_id: orgId,
        created_by: user?.id,
        assigned_to: user?.id,
        status: "pending",
        is_sent: false,
      } as unknown as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders", orgId] });
      toast({ title: "Reminder added" });
      setAddOpen(false);
      form.reset();
    },
  });

  const completeReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reminders").update({ status: "completed" } as unknown as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reminders", orgId] }),
  });

  const filtered = reminders?.filter((r) => statusFilter === "all" || r.status === statusFilter) || [];

  const getDueBadge = (due: string, status: string | null) => {
    if (status === "completed") return { label: "Done", color: "#00E5A0" };
    const d = parseISO(due);
    if (isPast(d) && !isToday(d)) return { label: "Overdue", color: "#F85149" };
    if (isToday(d)) return { label: "Today", color: "#F0B429" };
    if (isTomorrow(d)) return { label: "Tomorrow", color: "#00B4D8" };
    return { label: format(d, "MMM d"), color: "#8B949E" };
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Reminders</h1>
          <p className="text-[#8B949E] text-sm mt-1">{reminders?.filter((r) => r.status === "pending").length || 0} pending</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" size="sm" data-testid="button-add-reminder">
          <Plus className="h-4 w-4 mr-1" />
          Add reminder
        </Button>
      </div>

      <div className="flex gap-2 mb-5">
        {["pending","completed","all"].map((s) => (
          <Button key={s} size="sm" variant={statusFilter === s ? "default" : "outline"}
            onClick={() => setStatusFilter(s)}
            className={statusFilter === s ? "bg-[#00E5A0] text-[#0D1117] font-semibold h-8" : "border-[#30363D] text-[#8B949E] h-8 hover:border-[#00E5A0] hover:text-[#00E5A0]"}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-[#161B22] rounded-xl" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-10 text-center text-[#484F58]">
              No {statusFilter !== "all" ? statusFilter : ""} reminders
            </div>
          )}
          {filtered.map((r) => {
            const badge = getDueBadge(r.due_date, r.status);
            return (
              <div key={r.id} className={`bg-[#161B22] border border-[#30363D] rounded-xl px-4 py-3 flex items-center gap-3 ${r.status === "completed" ? "opacity-60" : ""}`} data-testid={`reminder-${r.id}`}>
                <button
                  onClick={() => r.status === "pending" && completeReminder.mutate(r.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${r.status === "completed" ? "border-[#00E5A0] bg-[#00E5A015]" : "border-[#30363D] hover:border-[#00E5A0]"}`}
                  data-testid={`complete-reminder-${r.id}`}
                >
                  {r.status === "completed" && <CheckCircle className="h-3 w-3 text-[#00E5A0]" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E6EDF3]">{r.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {(r.contacts as { full_name: string } | null)?.full_name && (
                      <span className="text-xs text-[#8B949E]">{(r.contacts as { full_name: string }).full_name}</span>
                    )}
                    {r.notes && <span className="text-xs text-[#484F58] truncate">{r.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-[#484F58]" />
                  <Badge className="text-xs" style={{ background: `${badge.color}15`, color: badge.color, border: "none" }}>
                    {badge.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-[#161B22] border-[#30363D] text-[#E6EDF3]">
          <DialogHeader><DialogTitle className="text-[#E6EDF3]">Add Reminder</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit((d) => addReminder.mutate(d))} className="space-y-3 mt-2">
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Title *</Label>
              <Input {...form.register("title")} placeholder="Follow up on quote..." className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-reminder-title" />
              {form.formState.errors.title && <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.title.message}</p>}
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Due date *</Label>
              <Input {...form.register("due_date")} type="datetime-local" className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] h-10" data-testid="input-reminder-due" />
              {form.formState.errors.due_date && <p className="text-[#F85149] text-xs mt-1">{form.formState.errors.due_date.message}</p>}
            </div>
            <div>
              <Label className="text-sm text-[#E6EDF3] mb-1.5 block">Notes</Label>
              <Textarea {...form.register("notes")} placeholder="Optional notes..." className="bg-[#0D1117] border-[#30363D] text-[#E6EDF3] min-h-[60px]" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)} className="flex-1 border-[#30363D] text-[#E6EDF3] h-10">Cancel</Button>
              <Button type="submit" disabled={addReminder.isPending} className="flex-1 bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10" data-testid="button-save-reminder">Add</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
