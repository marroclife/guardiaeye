import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus, LeadSource, STALE_LEAD_DAYS } from '@/types/lead';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial leads when user is available
  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  // Setup realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('leads-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newLead = mapDbToLead(payload.new);
            setLeads((prev) => [newLead, ...prev]);
            toast.success('Novo lead detectado!', {
              description: `${newLead.name} entrou no sistema`,
              className: 'bg-black/90 border-neon-cyan/50 text-white',
            });
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((lead) =>
                lead.id === payload.new.id ? mapDbToLead(payload.new) : lead
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setLeads((prev) =>
              prev.filter((lead) => lead.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Map database row to Lead type
  function mapDbToLead(row: any): Lead {
    return {
      ...row,
      status: row.status as LeadStatus,
      priority: (row.priority || 'medium') as Lead['priority'],
      source: (row.source || 'manual') as LeadSource,
      archived: row.archived ?? false,
      last_contact_at: row.last_contact_at || row.updated_at || row.created_at,
      position: row.position ?? 0,
    };
  }

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('position', { ascending: true });

      if (error) throw error;
      
      const typedLeads = (data || []).map(mapDbToLead);
      setLeads(typedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: LeadStatus, newPosition?: number) {
    try {
      const updateData: { status: LeadStatus; position?: number } = { status: newStatus };
      if (newPosition !== undefined) {
        updateData.position = newPosition;
      }
      
      const { error } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
    }
  }

  async function reorderLeads(reorderedLeads: { id: string; position: number }[]) {
    try {
      // Optimistic update
      setLeads(prev => {
        const updated = [...prev];
        reorderedLeads.forEach(({ id, position }) => {
          const index = updated.findIndex(l => l.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], position };
          }
        });
        return updated;
      });

      // Batch update positions
      const promises = reorderedLeads.map(({ id, position }) =>
        supabase.from('leads').update({ position }).eq('id', id)
      );
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Error reordering leads:', error);
      toast.error('Erro ao reordenar leads');
      fetchLeads(); // Revert on error
    }
  }

  async function updateLead(leadId: string, updates: Partial<Lead>) {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Lead atualizado!');
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
    }
  }

  async function updateLastContact(leadId: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ last_contact_at: new Date().toISOString() })
        .eq('id', leadId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last contact:', error);
    }
  }

  async function archiveLead(leadId: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ archived: true })
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Lead arquivado');
    } catch (error) {
      console.error('Error archiving lead:', error);
      toast.error('Erro ao arquivar lead');
    }
  }

  async function unarchiveLead(leadId: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ archived: false })
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Lead restaurado!');
    } catch (error) {
      console.error('Error unarchiving lead:', error);
      toast.error('Erro ao restaurar lead');
    }
  }

  async function permanentlyDeleteLead(leadId: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', leadId);

      if (error) throw error;
      toast.success('Lead excluído permanentemente');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao excluir lead');
    }
  }

  async function analyzeLeadWithAI(lead: Lead): Promise<string | null> {
    try {
      const response = await supabase.functions.invoke('analyze-lead', {
        body: { lead },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const analysis = response.data?.analysis;
      
      if (analysis) {
        await supabase
          .from('leads')
          .update({ ai_summary: analysis })
          .eq('id', lead.id);
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast.error('Erro ao analisar lead com IA');
      return null;
    }
  }

  async function createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    if (!user) {
      toast.error('Você precisa estar logado para criar leads');
      return;
    }
    
    try {
      const { error } = await supabase
        .from('leads')
        .insert([{
          ...lead,
          user_id: user.id,
          last_contact_at: new Date().toISOString(),
        }]);

      if (error) throw error;
      toast.success('Lead criado com sucesso!');
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao criar lead');
    }
  }

  // Process stale leads - move to "sem_resposta" if inactive for X days
  const processStaleLeads = useCallback(async () => {
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - STALE_LEAD_DAYS);
    
    const staleLeads = leads.filter(lead => {
      const lastContact = new Date(lead.last_contact_at);
      const isStale = lastContact < staleDate;
      const eligibleStatuses: LeadStatus[] = ['triagem', 'em_contato'];
      return isStale && eligibleStatuses.includes(lead.status) && !lead.archived;
    });

    if (staleLeads.length === 0) return 0;

    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: 'sem_resposta' as LeadStatus })
        .in('id', staleLeads.map(l => l.id));

      if (error) throw error;
      
      toast.info(`${staleLeads.length} lead(s) movido(s) para "Sem Resposta"`, {
        description: 'Leads inativos há mais de 3 dias',
      });
      
      return staleLeads.length;
    } catch (error) {
      console.error('Error processing stale leads:', error);
      return 0;
    }
  }, [leads]);

  return {
    leads,
    loading,
    isConnected,
    updateLeadStatus,
    updateLead,
    updateLastContact,
    archiveLead,
    unarchiveLead,
    permanentlyDeleteLead,
    analyzeLeadWithAI,
    createLead,
    processStaleLeads,
    reorderLeads,
    refetch: fetchLeads,
  };
}
