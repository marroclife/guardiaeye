import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.90.0';

interface PaymentInput {
  amount: number;
  due_date?: string;
  description?: string;
  milestone?: string;
}

interface ContractInput {
  lead_id: string;
  contract_number?: string;
  status?: 'pendente_assinatura' | 'ativo' | 'concluido' | 'cancelado';
  total_value: number;
  installments_count?: number;
  start_date?: string;
  notes?: string;
  create_project?: boolean;
  project_features?: string[];
  payments: PaymentInput[];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('apikey') || req.headers.get('x-api-key');
    const expectedKey = Deno.env.get('CONTRACT_API_KEY');

    if (!expectedKey || apiKey !== expectedKey) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as ContractInput;

    if (!body.lead_id || typeof body.total_value !== 'number' || !Array.isArray(body.payments)) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    );

    // Fetch lead to get user_id
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .select('id, user_id, name, company')
      .eq('id', body.lead_id)
      .single();

    if (leadError || !lead) {
      return new Response(JSON.stringify({ error: 'Lead not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = lead.user_id;

    // Create contract
    const { data: contract, error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        lead_id: body.lead_id,
        user_id: userId,
        contract_number: body.contract_number || null,
        status: body.status || 'ativo',
        total_value: body.total_value,
        installments_count: body.installments_count || body.payments.length,
        start_date: body.start_date || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (contractError || !contract) {
      return new Response(JSON.stringify({ error: contractError?.message || 'Failed to create contract' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payments
    const paymentsToInsert = body.payments.map((p, index) => ({
      contract_id: contract.id,
      amount: p.amount,
      due_date: p.due_date || null,
      description: p.description || `Parcela ${index + 1}`,
      milestone: p.milestone || null,
      status: 'pendente',
      position: index,
    }));

    const { error: paymentsError } = await supabaseAdmin.from('payments').insert(paymentsToInsert);

    if (paymentsError) {
      return new Response(JSON.stringify({ error: paymentsError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Optionally create project
    let project = null;
    if (body.create_project) {
      const { data: projectData, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert({
          lead_id: body.lead_id,
          user_id: userId,
          contract_number: body.contract_number || null,
          status: 'briefing',
          features: body.project_features || [],
          position: 0,
        })
        .select()
        .single();

      if (!projectError && projectData) {
        project = projectData;
        await supabaseAdmin
          .from('contracts')
          .update({ project_id: project.id })
          .eq('id', contract.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, contract, project, payments_count: paymentsToInsert.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
