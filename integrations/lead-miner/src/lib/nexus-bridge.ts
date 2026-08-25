import { createClient } from '@supabase/supabase-js';
import { Lead } from '../types';

/**
 * Nexus AI Bridge
 * Responsável por injetar leads qualificados do LEAD-Minner
 * diretamente na tabela public.leads do NEXO's Eye CRM.
 */

const supabaseUrl = process.env.NEXUS_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.NEXUS_SUPABASE_SERVICE_KEY || '';

export interface NexusExportResult {
  success: boolean;
  exported: number;
  skipped: number;
  errors: string[];
  insertedIds?: string[];
}

export function getNexusClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Nexus Supabase credentials missing. Set NEXUS_SUPABASE_URL and NEXUS_SUPABASE_SERVICE_KEY in .env'
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
}

function mapLeadToNexus(lead: Lead) {
  // Mapeia os campos ricos do LEAD-Minner para o schema atual do Nexus.
  const painDescription = lead.painPoint
    ? `🎯 Dor principal: ${lead.painPoint}`
    : '';
  const lossDescription = lead.estimatedLoss
    ? `💸 Perda estimada: ${lead.estimatedLoss}/mês`
    : '';
  const stackDescription = lead.techStackDetected
    ? `🛠️ Stack detectado: ${lead.techStackDetected}`
    : '';
  const aiSummary = [
    painDescription,
    lossDescription,
    stackDescription,
    lead.diagnosticNotes || '',
    '',
    '📍 Origem: LEAD-Minner (módulo de prospecção de luxo)',
    `🏷️ Tags: ${(lead.tags || []).join(', ')}`,
  ]
    .filter(Boolean)
    .join('\n');

  const obs = [
    `Categoria: ${lead.category}`,
    `Localização: ${lead.location}`,
    `Endereço: ${lead.address || 'N/A'}`,
    `Google Maps: ${lead.mapsUrl || 'N/A'}`,
    `Score de Oportunidade: ${lead.opportunityScore}/100`,
    `Pitch WhatsApp:\n${lead.pitchWhatsApp || lead.generatedPitch || 'N/A'}`,
    lead.pitchEmail ? `Pitch Email:\n${lead.pitchEmail}` : '',
    lead.pitchPhone ? `Script de Ligação:\n${lead.pitchPhone}` : '',
    `Observações internas: ${lead.customNotes || ''}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  return {
    name: lead.name,
    company: lead.name,
    role: lead.category,
    phone: lead.phone || null,
    email: null,
    website: lead.website || null,
    status: 'triagem',
    priority: lead.priority === 'HIGH' ? 'high' : lead.priority === 'MEDIUM' ? 'medium' : 'low',
    ai_summary: aiSummary,
    value: lead.dealValueEst || null,
    source: 'manual', // Schema do Nexus restringe source; identificação real fica em obs.
    obs: obs,
  };
}

export async function exportLeadsToNexus(leads: Lead[]): Promise<NexusExportResult> {
  const result: NexusExportResult = {
    success: false,
    exported: 0,
    skipped: 0,
    errors: [],
    insertedIds: [],
  };

  if (!leads || leads.length === 0) {
    result.errors.push('Nenhum lead fornecido para exportação.');
    return result;
  }

  try {
    const supabase = getNexusClient();

    // 1. Verificar duplicatas pelo nome + localização para evitar poluir o CRM.
    const { data: existingLeads, error: fetchError } = await supabase
      .from('leads')
      .select('id, name, company');

    if (fetchError) {
      throw new Error(`Falha ao consultar leads existentes: ${fetchError.message}`);
    }

    const existingSet = new Set(
      (existingLeads || []).map((l: any) => `${(l.name || l.company || '').toLowerCase().trim()}`)
    );

    const leadsToInsert = [];
    for (const lead of leads) {
      const leadName = (lead.name || '').toLowerCase().trim();
      if (existingSet.has(leadName)) {
        result.skipped++;
        continue;
      }
      leadsToInsert.push(mapLeadToNexus(lead));
    }

    if (leadsToInsert.length === 0) {
      result.success = true;
      return result;
    }

    // 2. Inserir os leads selecionados no Nexus.
    const { data, error } = await supabase.from('leads').insert(leadsToInsert).select('id');

    if (error) {
      throw new Error(`Falha ao inserir leads no Nexus: ${error.message}`);
    }

    result.success = true;
    result.exported = data?.length || leadsToInsert.length;
    result.insertedIds = (data || []).map((d: any) => d.id);
  } catch (err: any) {
    result.errors.push(err.message || String(err));
    console.error('[NexusBridge] Export error:', err);
  }

  return result;
}
