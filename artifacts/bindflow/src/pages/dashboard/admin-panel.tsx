import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Inbox, RefreshCw, ChevronDown, ChevronUp, Mail, Phone, Tag, Clock } from "lucide-react";

interface SupportTicket {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  issue_type: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-[#F85149]/15 text-[#F85149] border-[#F85149]/30",
  in_progress: "bg-[#F0B429]/15 text-[#F0B429] border-[#F0B429]/30",
  resolved: "bg-[#00E5A0]/15 text-[#00E5A0] border-[#00E5A0]/30",
  closed: "bg-white/5 text-[#8B949E] border-white/10",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminPanelPage() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: tickets = [], isLoading, refetch } = useQuery<SupportTicket[]>({
    queryKey: ["support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support");
      if (!res.ok) throw new Error("Failed to load tickets");
      return res.json();
    },
    refetchInterval: 60000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/support/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      toast({ title: "Ticket updated" });
    },
    onError: () => {
      toast({ title: "Update failed", variant: "destructive" });
    },
  });

  const filtered = filterStatus === "all" ? tickets : tickets.filter((t) => t.status === filterStatus);

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3] flex items-center gap-3">
            <Inbox className="h-6 w-6 text-[#00E5A0]" />
            Support Tickets
          </h1>
          <p className="text-sm text-[#8B949E] mt-1">{tickets.length} total · {counts.open} open</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:border-[#00E5A0]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "open", "in_progress", "resolved", "closed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterStatus === s
                ? "bg-[#00E5A0] text-[#0D1117] border-[#00E5A0]"
                : "border-[#30363D] text-[#8B949E] hover:border-[#00E5A0]/50 hover:text-[#E6EDF3]"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]} ({counts[s]})
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#00E5A0] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-[#8B949E]">
          <Inbox className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No tickets found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-xl border border-[#30363D] bg-[#161B22] overflow-hidden transition-all hover:border-[#00E5A0]/30"
            >
              <button
                className="w-full text-left px-5 py-4 flex items-start gap-4"
                onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[ticket.status]}`}>
                      {STATUS_LABELS[ticket.status]}
                    </span>
                    <span className="text-xs font-medium text-[#00E5A0] bg-[#00E5A0]/10 px-2 py-0.5 rounded-full">
                      {ticket.issue_type}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-[#8B949E]">
                      <Clock className="h-3 w-3" />
                      {timeAgo(ticket.created_at)}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-[#E6EDF3] truncate">{ticket.subject}</p>
                  <p className="text-sm text-[#8B949E] mt-0.5">{ticket.name} · {ticket.email}</p>
                </div>
                <div className="flex-shrink-0 text-[#8B949E] mt-1">
                  {expanded === ticket.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </button>

              {expanded === ticket.id && (
                <div className="px-5 pb-5 border-t border-[#30363D] pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#8B949E]">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${ticket.email}`} className="hover:text-[#00E5A0] transition-colors">{ticket.email}</a>
                    </div>
                    {ticket.phone && (
                      <div className="flex items-center gap-2 text-sm text-[#8B949E]">
                        <Phone className="h-4 w-4" />
                        {ticket.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-[#8B949E]">
                      <Tag className="h-4 w-4" />
                      {ticket.issue_type}
                    </div>
                  </div>

                  <div className="rounded-lg bg-[#0D1117] border border-[#30363D] p-4 mb-4">
                    <p className="text-sm text-[#8B949E] whitespace-pre-wrap">{ticket.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#8B949E]">Change status:</span>
                    <Select
                      value={ticket.status}
                      onValueChange={(val) => updateStatus.mutate({ id: ticket.id, status: val })}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs bg-[#0D1117] border-[#30363D] text-[#E6EDF3]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161B22] border-[#30363D]">
                        {Object.entries(STATUS_LABELS).map(([val, label]) => (
                          <SelectItem key={val} value={val} className="text-[#E6EDF3] text-xs">{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-xs text-[#8B949E] ml-auto">ID: {ticket.id.slice(0, 8)}…</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
