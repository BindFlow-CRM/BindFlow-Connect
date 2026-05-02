import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { MessageCircle, Plus, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";

export default function PipelinePage() {
  const { organization } = useAuth();
  const orgId = organization?.id;
  const queryClient = useQueryClient();

  const { data: stages, isLoading: stagesLoading } = useQuery({
    queryKey: ["pipeline-stages", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("pipeline_stages").select("*").eq("organization_id", orgId!).order("position");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ["deals", orgId],
    queryFn: async () => {
      const { data, error } = await supabase.from("deals").select("*, contacts(full_name, phone), pipeline_stages(name, color)").eq("organization_id", orgId!).order("position");
      if (error) throw error;
      return data;
    },
    enabled: !!orgId,
  });

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, newStageId }: { dealId: string; newStageId: string }) => {
      const { error } = await supabase.from("deals").update({ stage_id: newStageId }).eq("id", dealId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["deals", orgId] }),
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { draggableId, destination } = result;
    const newStageId = destination.droppableId;
    moveDeal.mutate({ dealId: draggableId, newStageId });
  };

  const isLoading = stagesLoading || dealsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-32 bg-[#161B22] mb-6" />
        <div className="flex gap-4 overflow-x-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-64">
              <Skeleton className="h-10 w-full bg-[#161B22] mb-3 rounded-lg" />
              <Skeleton className="h-24 w-full bg-[#161B22] mb-2 rounded-lg" />
              <Skeleton className="h-24 w-full bg-[#161B22] rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const dealsByStage = (stageId: string) => deals?.filter((d) => d.stage_id === stageId) || [];

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#E6EDF3]">Pipeline</h1>
          <p className="text-[#8B949E] text-sm mt-1">{deals?.length || 0} deals in your pipeline</p>
        </div>
        <Button className="bg-[#00E5A0] hover:bg-[#00C98A] text-[#0D1117] font-semibold" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add deal
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
          {stages?.map((stage) => {
            const stageDeals = dealsByStage(stage.id);
            const stageValue = stageDeals.reduce((acc, d) => acc + (d.value || 0), 0);
            return (
              <div key={stage.id} className="flex-shrink-0 w-64 flex flex-col">
                {/* Column header */}
                <div className="bg-[#161B22] border border-[#30363D] rounded-t-lg px-3 py-2.5 border-b-2" style={{ borderBottomColor: stage.color }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.name}</span>
                    <Badge className="text-xs h-5 px-1.5" style={{ background: `${stage.color}20`, color: stage.color, border: "none" }}>
                      {stageDeals.length}
                    </Badge>
                  </div>
                  {stageValue > 0 && (
                    <div className="text-xs text-[#8B949E] flex items-center gap-1 mt-1">
                      <DollarSign className="h-3 w-3" />
                      {stageValue.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Cards */}
                <Droppable droppableId={stage.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 min-h-[200px] bg-[#0D1117] border-x border-b border-[#30363D] rounded-b-lg p-2 space-y-2 transition-colors ${snapshot.isDraggingOver ? "bg-[#161B22]" : ""}`}
                    >
                      {stageDeals.map((deal, index) => (
                        <Draggable key={deal.id} draggableId={deal.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-[#1C2128] border border-[#30363D] rounded-lg p-3 border-l-[3px] cursor-grab transition-all ${snapshot.isDragging ? "shadow-lg rotate-[1deg]" : "hover:border-[#30363D80]"}`}
                              style={{ ...provided.draggableProps.style, borderLeftColor: stage.color }}
                              data-testid={`deal-card-${deal.id}`}
                            >
                              <div className="text-sm font-medium text-[#E6EDF3] mb-1 leading-tight">{deal.title}</div>
                              {(deal.contacts as { full_name: string })?.full_name && (
                                <div className="text-xs text-[#8B949E] mb-2">{(deal.contacts as { full_name: string }).full_name}</div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {deal.value && (
                                    <span className="text-xs font-medium text-[#00E5A0]">${deal.value.toLocaleString()}</span>
                                  )}
                                  {deal.expected_close_date && (
                                    <span className="text-xs text-[#484F58]">{format(parseISO(deal.expected_close_date), "MMM d")}</span>
                                  )}
                                </div>
                                {(deal.contacts as { phone?: string })?.phone && (
                                  <a
                                    href={`https://wa.me/1${(deal.contacts as { phone: string }).phone?.replace(/\D/g, "")}?text=Hi! Following up on your insurance quote.`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-6 h-6 rounded flex items-center justify-center text-[#25D366] hover:bg-[#25D36615] transition-colors"
                                    data-testid={`whatsapp-deal-${deal.id}`}
                                  >
                                    <MessageCircle className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {stageDeals.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-20 text-[#484F58] text-xs">No deals</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
