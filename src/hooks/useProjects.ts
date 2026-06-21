import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Project, ProjectStatus, ProjectWithLead } from '@/types/project';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

function mapDbToProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id || ''),
    created_at: String(row.created_at || ''),
    updated_at: String(row.updated_at || ''),
    lead_id: String(row.lead_id || ''),
    user_id: row.user_id ? String(row.user_id) : null,
    contract_number: row.contract_number ? String(row.contract_number) : null,
    start_date: row.start_date ? String(row.start_date) : null,
    deadline: row.deadline ? String(row.deadline) : null,
    features: Array.isArray(row.features)
      ? row.features.map((f) => (typeof f === 'string' ? f : String(f)))
      : [],
    status: (row.status as ProjectStatus) || 'briefing',
    notes: row.notes ? String(row.notes) : null,
    position: typeof row.position === 'number' ? row.position : 0,
  };
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectWithLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const fetchSingleProjectWithLead = useCallback(async (
    projectId: string
  ): Promise<ProjectWithLead | null> => {
    const { data, error } = await supabase
      .from('projects')
      .select('*, lead:leads(id, name, company, phone)')
      .eq('id', projectId)
      .single();

    if (error || !data) return null;
    const row = data as Record<string, unknown>;
    return {
      ...mapDbToProject(row),
      lead: row.lead as ProjectWithLead['lead'],
    };
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*, lead:leads(id, name, company, phone)')
        .order('position', { ascending: true });

      if (error) throw error;

      const typedProjects = ((data || []) as Record<string, unknown>[]).map((row) => ({
        ...mapDbToProject(row),
        lead: row.lead as ProjectWithLead['lead'],
      }));
      setProjects(typedProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const fetchSingle = fetchSingleProjectWithLead;
    const channel = supabase
      .channel('projects-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects',
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown> | undefined;
          const oldRow = payload.old as Record<string, unknown> | undefined;

          if (payload.eventType === 'INSERT' && newRow) {
            const newProject = mapDbToProject(newRow);
            fetchSingle(newProject.id).then((full) => {
              if (full) setProjects((prev) => [full, ...prev]);
            });
            toast.success('Novo projeto criado!', {
              description: `Contrato ${newProject.contract_number || 'sem número'} iniciado`,
            });
          } else if (payload.eventType === 'UPDATE' && newRow) {
            const id = String(newRow.id || '');
            fetchSingle(id).then((full) => {
              if (full) {
                setProjects((prev) => prev.map((p) => (p.id === full.id ? full : p)));
              }
            });
          } else if (payload.eventType === 'DELETE' && oldRow) {
            const id = String(oldRow.id || '');
            setProjects((prev) => prev.filter((p) => p.id !== id));
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSingleProjectWithLead]);

  async function updateProjectStatus(projectId: string, newStatus: ProjectStatus, newPosition?: number) {
    try {
      const updateData: { status: ProjectStatus; position?: number } = { status: newStatus };
      if (newPosition !== undefined) {
        updateData.position = newPosition;
      }

      const { error } = await supabase
        .from('projects')
        .update(updateData)
        .eq('id', projectId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erro ao atualizar projeto');
    }
  }

  async function reorderProjects(reorderedProjects: { id: string; position: number }[]) {
    try {
      setProjects((prev) => {
        const updated = [...prev];
        reorderedProjects.forEach(({ id, position }) => {
          const index = updated.findIndex((p) => p.id === id);
          if (index !== -1) {
            updated[index] = { ...updated[index], position };
          }
        });
        return updated;
      });

      const promises = reorderedProjects.map(({ id, position }) =>
        supabase.from('projects').update({ position }).eq('id', id)
      );

      await Promise.all(promises);
    } catch (error) {
      console.error('Error reordering projects:', error);
      toast.error('Erro ao reordenar projetos');
      fetchProjects();
    }
  }

  async function updateProject(projectId: string, updates: Partial<Project>) {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;
      toast.success('Projeto atualizado!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erro ao atualizar projeto');
    }
  }

  async function createProject(
    project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'user_id'>
  ) {
    if (!user) {
      toast.error('Você precisa estar logado para criar projetos');
      return;
    }

    try {
      const { error } = await supabase.from('projects').insert([
        {
          ...project,
          user_id: user.id,
        },
      ]);

      if (error) throw error;
      toast.success('Projeto criado com sucesso!');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Erro ao criar projeto');
    }
  }

  async function deleteProject(projectId: string) {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      toast.success('Projeto removido');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao remover projeto');
    }
  }

  const getClosedLeadsWithoutProject = useCallback(async () => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, company, phone')
        .eq('status', 'fechado')
        .eq('archived', false)
        .eq('user_id', user.id);

      if (error) throw error;

      const leadIds = (data || []).map((l) => l.id);
      if (leadIds.length === 0) return [];

      const { data: existingProjects, error: projectError } = await supabase
        .from('projects')
        .select('lead_id')
        .in('lead_id', leadIds)
        .eq('user_id', user.id);

      if (projectError) throw projectError;

      const projectLeadIds = new Set((existingProjects || []).map((p) => p.lead_id));
      return (data || []).filter((l) => !projectLeadIds.has(l.id));
    } catch (error) {
      console.error('Error fetching closed leads:', error);
      return [];
    }
  }, [user]);

  return {
    projects,
    loading,
    isConnected,
    updateProjectStatus,
    updateProject,
    createProject,
    deleteProject,
    reorderProjects,
    refetch: fetchProjects,
    getClosedLeadsWithoutProject,
  };
}
