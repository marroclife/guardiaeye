import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeadEvent, LeadEventType } from '@/types/leadEvent';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

function mapDbToLeadEvent(row: Record<string, unknown>): LeadEvent {
  return {
    id: String(row.id || ''),
    lead_id: String(row.lead_id || ''),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    title: String(row.title || ''),
    type: (row.type as LeadEventType) || 'outro',
    scheduled_at: String(row.scheduled_at || ''),
    duration_minutes: typeof row.duration_minutes === 'number' ? row.duration_minutes : null,
    notes: row.notes ? String(row.notes) : null,
    completed: row.completed ?? false,
    completed_at: row.completed_at ? String(row.completed_at) : null,
  };
}

export function useLeadEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<LeadEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lead_events')
        .select('*')
        .order('scheduled_at', { ascending: true });

      if (error) throw error;

      const typedEvents = ((data || []) as Record<string, unknown>[]).map(mapDbToLeadEvent);
      setEvents(typedEvents);
    } catch (error) {
      console.error('Error fetching lead events:', error);
      toast.error('Erro ao carregar eventos de leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, fetchEvents]);

  useEffect(() => {
    const channel = supabase
      .channel('lead-events-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_events',
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown> | undefined;
          const oldRow = payload.old as Record<string, unknown> | undefined;

          if (payload.eventType === 'INSERT' && newRow) {
            const newEvent = mapDbToLeadEvent(newRow);
            setEvents((prev) => [...prev, newEvent].sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()));
            toast.success('Novo evento agendado!', {
              description: newEvent.title,
            });
          } else if (payload.eventType === 'UPDATE' && newRow) {
            const updatedEvent = mapDbToLeadEvent(newRow);
            setEvents((prev) =>
              prev
                .map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
                .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
            );
          } else if (payload.eventType === 'DELETE' && oldRow) {
            const id = String(oldRow.id || '');
            setEvents((prev) => prev.filter((event) => event.id !== id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function createEvent(event: Omit<LeadEvent, 'id' | 'created_at' | 'updated_at'>) {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('lead_events')
        .insert([{
          ...event,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Evento agendado!');
      return data ? mapDbToLeadEvent(data as Record<string, unknown>) : null;
    } catch (error) {
      console.error('Error creating lead event:', error);
      toast.error('Erro ao agendar evento');
      return null;
    }
  }

  async function updateEvent(eventId: string, updates: Partial<LeadEvent>) {
    try {
      const { error } = await supabase
        .from('lead_events')
        .update(updates)
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Evento atualizado');
    } catch (error) {
      console.error('Error updating lead event:', error);
      toast.error('Erro ao atualizar evento');
    }
  }

  async function deleteEvent(eventId: string) {
    try {
      const { error } = await supabase
        .from('lead_events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      toast.success('Evento removido');
    } catch (error) {
      console.error('Error deleting lead event:', error);
      toast.error('Erro ao remover evento');
    }
  }

  async function toggleEventCompleted(eventId: string, completed: boolean) {
    try {
      const { error } = await supabase
        .from('lead_events')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', eventId);

      if (error) throw error;
    } catch (error) {
      console.error('Error toggling event completion:', error);
      toast.error('Erro ao atualizar evento');
    }
  }

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    toggleEventCompleted,
    refetch: fetchEvents,
  };
}
