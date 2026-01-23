import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Lead, LeadStatus } from '@/types/lead';
import { toast } from 'sonner';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Fetch initial leads
  useEffect(() => {
    fetchLeads();
  }, []);

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
            const newLead = payload.new as Lead;
            setLeads((prev) => [...prev, newLead]);
            toast.success('Novo lead detectado!', {
              description: `${newLead.name} entrou no sistema`,
              className: 'bg-black/90 border-neon-cyan/50 text-white',
            });
          } else if (payload.eventType === 'UPDATE') {
            setLeads((prev) =>
              prev.map((lead) =>
                lead.id === payload.new.id ? (payload.new as Lead) : lead
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

  async function fetchLeads() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to Lead type with proper typing
      const typedLeads = (data || []).map(lead => ({
        ...lead,
        status: lead.status as LeadStatus,
        priority: lead.priority as Lead['priority'],
        archived: lead.archived ?? false,
      }));
      
      setLeads(typedLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }

  async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status: newStatus })
        .eq('id', leadId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
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
        // Save the analysis to the lead
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
    try {
      const { error } = await supabase
        .from('leads')
        .insert([lead]);

      if (error) throw error;
      toast.success('Lead criado com sucesso!');
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao criar lead');
    }
  }

  return {
    leads,
    loading,
    isConnected,
    updateLeadStatus,
    updateLead,
    archiveLead,
    unarchiveLead,
    permanentlyDeleteLead,
    analyzeLeadWithAI,
    createLead,
    refetch: fetchLeads,
  };
}
