import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Crown, Shield, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const ROLE_COLORS: Record<string, string> = { owner: "#00E5A0", admin: "#00B4D8", member: "#8B949E" };
const ROLE_ICONS: Record<string, typeof Crown> = { owner: Crown, admin: Shield, member: User };

export default function TeamSettingsPage() {
  const { organization, user } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: members, isLoading } = useQuery({
    queryKey: ["members", orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("organization_members")
        .select("*, profiles:user_id(full_name, email:id)")
        .eq("organization_id", orgId!);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const inviteMember = useMutation({
    mutationFn: async (email: string) => {
      if ((members?.length || 0) >= (organization?.max_seats || 3)) {
        throw new Error("Seat limit reached. Upgrade to add more team members.");
      }
      const { error } = await supabase.from("organization_members").insert({
        organization_id: orgId,
        invited_email: email,
        role: "member",
        status: "invited",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", orgId] });
      toast({ title: "Invite sent", description: `Invitation sent to ${inviteEmail}` });
      setInviteEmail("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["members", orgId] }); toast({ title: "Member removed" }); },
  });

  const seatCount = members?.length || 0;
  const maxSeats = organization?.max_seats || 3;
  const canInvite = seatCount < maxSeats;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#E6EDF3] mb-2">Team</h1>
      <p className="text-[#8B949E] text-sm mb-8">Manage your workspace members</p>

      {/* Seats indicator */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-[#E6EDF3]">Seats used</div>
          <div className="text-xs text-[#8B949E] mt-0.5">{maxSeats - seatCount} seat{maxSeats - seatCount !== 1 ? "s" : ""} available</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: maxSeats }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full border-2 ${i < seatCount ? "border-[#00E5A0] bg-[#00E5A015]" : "border-[#30363D]"}`} />
            ))}
          </div>
          <span className="text-sm font-semibold text-[#E6EDF3]">{seatCount}/{maxSeats}</span>
        </div>
      </div>

      {/* Invite */}
      {canInvite ? (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 mb-6">
          <div className="text-sm font-medium text-[#E6EDF3] mb-3">Invite team member</div>
          <div className="flex gap-2">
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              type="email"
              placeholder="colleague@agency.com"
              className="flex-1 bg-[#0D1117] border-[#30363D] text-[#E6EDF3] placeholder:text-[#484F58] focus:border-[#00E5A0] h-10"
              data-testid="input-invite-email"
            />
            <Button
              onClick={() => inviteEmail && inviteMember.mutate(inviteEmail)}
              disabled={!inviteEmail || inviteMember.isPending}
              className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold h-10"
              data-testid="button-send-invite"
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-[#F0B42910] border border-[#F0B42930] rounded-xl p-4 mb-6 text-sm text-[#F0B429]">
          All {maxSeats} seats are in use. Upgrade your plan to add more team members.
        </div>
      )}

      {/* Members list */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363D]">
          <span className="text-sm font-semibold text-[#E6EDF3]">Members</span>
        </div>
        <div className="divide-y divide-[#30363D]">
          {isLoading && Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="px-4 py-3 flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-full bg-[#21262D]" />
              <Skeleton className="h-4 w-32 bg-[#21262D]" />
            </div>
          ))}
          {members?.map((m) => {
            const role = m.role || "member";
            const Icon = ROLE_ICONS[role];
            const isCurrentUser = m.user_id === user?.id;
            const isOwner = m.role === "owner";
            return (
              <div key={m.id} className="px-4 py-3 flex items-center gap-3" data-testid={`member-${m.id}`}>
                <div className="w-8 h-8 rounded-full bg-[#21262D] flex items-center justify-center flex-shrink-0">
                  <User className="h-3.5 w-3.5 text-[#8B949E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#E6EDF3]">
                    {(m.profiles as { full_name: string } | null)?.full_name || m.invited_email || "Unknown"}
                    {isCurrentUser && <span className="text-xs text-[#8B949E] ml-2">(you)</span>}
                  </div>
                  {m.invited_email && m.status === "invited" && <div className="text-xs text-[#8B949E]">{m.invited_email}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="text-xs flex items-center gap-1" style={{ background: `${ROLE_COLORS[role]}15`, color: ROLE_COLORS[role], border: "none" }}>
                    <Icon className="h-3 w-3" />
                    {role}
                  </Badge>
                  {m.status === "invited" && <Badge className="text-xs bg-[#F0B42915] text-[#F0B429] border-none">Invited</Badge>}
                  {!isOwner && !isCurrentUser && (
                    <button onClick={() => removeMember.mutate(m.id)} className="w-6 h-6 rounded flex items-center justify-center text-[#484F58] hover:bg-[#F8514915] hover:text-[#F85149] transition-colors" data-testid={`remove-member-${m.id}`}>
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
