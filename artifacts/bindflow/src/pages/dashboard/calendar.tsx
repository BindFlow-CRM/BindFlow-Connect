import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO, addMonths, subMonths, getDay } from "date-fns";

export default function CalendarPage() {
  const { organization } = useAuth();
  const orgId = organization?.id;
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: policies } = useQuery({
    queryKey: ["policies-calendar", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("policies").select("*, contacts(full_name, phone)").eq("organization_id", orgId!).not("renewal_date", "is", null);
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: reminders } = useQuery({
    queryKey: ["reminders-calendar", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("reminders").select("*, contacts(full_name)").eq("organization_id", orgId!).eq("status", "pending");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start
  const startDay = getDay(monthStart);
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const getEventsForDay = (day: Date) => {
    const renewals = policies?.filter((p) => p.renewal_date && isSameDay(parseISO(p.renewal_date), day)) || [];
    const rems = reminders?.filter((r) => isSameDay(parseISO(r.due_date), day)) || [];
    return { renewals, reminders: rems };
  };

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : null;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#E6EDF3]">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="h-8 w-8 border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#E6EDF3]">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-[#E6EDF3] w-32 text-center">{format(currentMonth, "MMMM yyyy")}</span>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="h-8 w-8 border-[#30363D] text-[#8B949E] hover:border-[#00E5A0] hover:text-[#E6EDF3]">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F85149]" /><span className="text-[#8B949E]">Renewal</span></div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F0B429]" /><span className="text-[#8B949E]">Reminder</span></div>
      </div>

      <div className="bg-[#161B22] border border-[#30363D] rounded-xl overflow-hidden mb-6">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-[#30363D]">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="px-2 py-2 text-xs font-medium text-[#484F58] text-center">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {paddedDays.map((day, i) => {
            if (!day) return <div key={`pad-${i}`} className="min-h-[80px] border-r border-b border-[#21262D] last:border-r-0" />;
            const events = getEventsForDay(day);
            const hasEvents = events.renewals.length > 0 || events.reminders.length > 0;
            const isSelected = selectedDay && isSameDay(day, selectedDay);
            return (
              <div
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`min-h-[80px] border-r border-b border-[#21262D] p-1.5 cursor-pointer transition-colors ${!isSameMonth(day, currentMonth) ? "opacity-30" : ""} ${isToday(day) ? "bg-[#00E5A015]" : isSelected ? "bg-[#21262D]" : "hover:bg-[#21262D]"}`}
                data-testid={`cal-day-${format(day, "yyyy-MM-dd")}`}
              >
                <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday(day) ? "bg-[#00E5A0] text-[#0D1117]" : "text-[#8B949E]"}`}>
                  {format(day, "d")}
                </div>
                <div className="space-y-0.5">
                  {events.renewals.slice(0, 2).map((p) => (
                    <div key={p.id} className="text-[10px] bg-[#F8514915] text-[#F85149] rounded px-1 py-0.5 truncate">{(p.contacts as { full_name: string })?.full_name}</div>
                  ))}
                  {events.reminders.slice(0, 2).map((r) => (
                    <div key={r.id} className="text-[10px] bg-[#F0B42915] text-[#F0B429] rounded px-1 py-0.5 truncate">{r.title}</div>
                  ))}
                  {(events.renewals.length + events.reminders.length) > 2 && (
                    <div className="text-[10px] text-[#484F58]">+{events.renewals.length + events.reminders.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected day events */}
      {selectedDay && selectedEvents && (
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4">
          <div className="font-semibold text-[#E6EDF3] text-sm mb-3">{format(selectedDay, "MMMM d, yyyy")}</div>
          {selectedEvents.renewals.length === 0 && selectedEvents.reminders.length === 0 && (
            <p className="text-[#484F58] text-sm">No events on this day</p>
          )}
          <div className="space-y-2">
            {selectedEvents.renewals.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-l-2 border-[#F85149] pl-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E6EDF3]">{(p.contacts as { full_name: string })?.full_name} — Renewal</div>
                  <div className="text-xs text-[#8B949E]">{p.line_of_insurance} · {p.insurance_company} · ${p.annual_premium?.toLocaleString()}/yr</div>
                </div>
                {(p.contacts as { phone?: string })?.phone && (
                  <a href={`https://wa.me/1${(p.contacts as { phone: string }).phone?.replace(/\D/g,"")}?text=Hi! Following up on your policy renewal.`} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:text-[#25D366] transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
            {selectedEvents.reminders.map((r) => (
              <div key={r.id} className="flex items-center gap-3 py-2 border-l-2 border-[#F0B429] pl-3">
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#E6EDF3]">{r.title}</div>
                  {r.notes && <div className="text-xs text-[#8B949E]">{r.notes}</div>}
                </div>
                <Badge className="text-xs bg-[#F0B42915] text-[#F0B429] border-none">Reminder</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
