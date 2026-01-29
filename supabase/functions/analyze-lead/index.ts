import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user's token
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Token verification failed:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('Authenticated user:', userId);

    const { lead } = await req.json();
    
    if (!lead) {
      return new Response(
        JSON.stringify({ error: 'Lead data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user owns this lead (if lead has an id)
    if (lead.id) {
      const { data: existingLead, error: leadError } = await supabase
        .from('leads')
        .select('user_id')
        .eq('id', lead.id)
        .single();

      if (leadError || !existingLead) {
        console.error('Lead not found:', leadError);
        return new Response(
          JSON.stringify({ error: 'Lead not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (existingLead.user_id !== userId) {
        console.error('User does not own this lead');
        return new Response(
          JSON.stringify({ error: 'Unauthorized - You do not own this lead' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `Você é o Guardian, um analista de vendas especializado em qualificação de leads B2B.
Sua função é analisar os dados do lead e gerar um dossiê executivo com insights acionáveis.

Formato do relatório:
═══════════════════════════════════════
📊 ANÁLISE DE POTENCIAL
[Avalie o potencial do lead de 1-10 e justifique]

🎯 PERFIL COMPORTAMENTAL
[Baseado no cargo e empresa, descreva o perfil de decisão]

⚡ GATILHOS DE VENDA
[Liste 3 possíveis gatilhos para abordagem]

💡 RECOMENDAÇÃO DE ABORDAGEM
[Sugira a melhor estratégia de contato]

⚠️ PONTOS DE ATENÇÃO
[Identifique riscos ou objeções potenciais]
═══════════════════════════════════════

Seja objetivo, direto e focado em insights acionáveis para vendas.`;

    const leadInfo = `
Nome: ${lead.name || 'Não informado'}
Empresa: ${lead.company || 'Não informado'}
Cargo: ${lead.role || 'Não informado'}
Email: ${lead.email || 'Não informado'}
Telefone: ${lead.phone || 'Não informado'}
Website: ${lead.website || 'Não informado'}
Valor Estimado: ${lead.value ? `R$ ${lead.value}` : 'Não informado'}
Prioridade Atual: ${lead.priority || 'medium'}
Status no Pipeline: ${lead.status || 'triagem'}
`;

    console.log('Analyzing lead:', lead.name, 'for user:', userId);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analise o seguinte lead:\n${leadInfo}` }
        ],
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos esgotados. Adicione créditos ao workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Erro ao processar análise de IA' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || 'Análise não disponível';

    console.log('Analysis completed for:', lead.name);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-lead:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
