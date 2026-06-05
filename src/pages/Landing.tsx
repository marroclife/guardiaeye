/**
 * NEXO's Eye v1 — Landing Pública (eye.marroc.xyz)
 * 
 * Funil de 4 etapas desenhado pela Prisma:
 *   1. Headline Universal
 *   2. Formulário de Nome
 *   3. Revelação de Status Personalizada (Espelho de Dor)
 *   4. CTA WhatsApp
 * 
 * TODO v2: Persistir leads no Supabase (projeto dedicado)
 *   - Tabela: leads_eye { id, name, city, nicho, arquetipo, status, created_at, whatsapp_sent }
 *   - Hook: useLeadCapture (substituir setState local por supabase.from().insert())
 *   - No submit, gerar token de tracking e mandar via UTM no link wa.me
 *   - Ver: src/integrations/supabase/client.ts (cliente pronto, aguardando .env do projeto dedicado)
 * 
 * ROADMAP DE UNIFICAÇÃO (Nexo/Prisma/Trimegisto):
 *   - v2: Supabase dedicado do NEXO's Eye + auth compartilhado entre sistemas
 *   - v3: Schemas cruzados (NEXO's Eye → MarrocSolutions → TimeTemple) com single sign-on
 *   - v4: API gateway único + dashboard consolidado de todos os sistemas
 */

import { useState, useMemo } from 'react';
import { Eye, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 'name' | 'city' | 'reveal' | 'whatsapp';

interface LeadData {
  name: string;
  city: string;
  nicho: 'restaurante' | 'servico' | 'varejo' | 'outro' | '';
  // O arquétipo de dor é inferido pelo nicho na v1
}

const NICHOS: Array<{ value: LeadData['nicho']; label: string; arquetipo: string }> = [
  { value: 'restaurante', label: 'Restaurante / Alimentação', arquetipo: 'Conveniência Perdida' },
  { value: 'servico', label: 'Prestador de Serviço', arquetipo: 'Autoridade Ferida' },
  { value: 'varejo', label: 'Loja / Varejo', arquetipo: 'Giro Estagnado' },
  { value: 'outro', label: 'Outro', arquetipo: 'Invisibilidade Digital' },
];

// Link WhatsApp do CEO (Marroc) — conforme CONSOLIDACAO_REUNIAO_GUARDIAEYE
const WHATSAPP_NUMBER = '5521983821884';
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

function buildWhatsappMessage(data: LeadData, statusText: string): string {
  const arquetipo = NICHOS.find(n => n.value === data.nicho)?.arquetipo ?? 'Invisibilidade Digital';
  return [
    `Olá Marroc, sou ${data.name} de ${data.city}.`,
    ``,
    `Acabei de passar pelo scan do Guardian Eye e o status foi: *${statusText}*`,
    `Arquetipo detectado: *${arquetipo}*`,
    ``,
    `Quero entender o que dá pra fazer pra reverter.`,
  ].join('\n');
}

const Landing = () => {
  const [step, setStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeadData>({ name: '', city: '', nicho: '' });

  // Determina o "status" personalizado baseado no nicho (espelho de dor)
  const statusPersonalizado = useMemo(() => {
    const n = NICHOS.find(x => x.value === data.nicho);
    if (!n) return null;
    const map: Record<string, string> = {
      'Conveniência Perdida': '🔴  CONVENIÊNCIA PERDIDA — clientes preferem pedir no concorrente porque ele aparece primeiro no Google',
      'Autoridade Ferida': '🔴  AUTORIDADE FERIDA — você tem a experiência, mas o Google não mostra isso quando te procuram',
      'Giro Estagnado': '🔴  GIRO ESTAGNADO — o movimento parou, e a vitrine digital está vazia',
      'Invisibilidade Digital': '🔴  INVISIBILIDADE DIGITAL — você existe, mas o Google não te encontra',
    };
    return { text: map[n.arquetipo], arquetipo: n.arquetipo };
  }, [data.nicho]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.name.trim().length < 2) return;
    setStep('city');
  };

  const handleCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.city.trim().length < 2) return;
    setStep('reveal');
    // TODO v2: persistir lead com status='minerado' no Supabase
  };

  const handleNichoSelect = (nicho: LeadData['nicho']) => {
    setData(prev => ({ ...prev, nicho }));
    // micro-delay pra dar sensação de "scan" processando
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('whatsapp');
      // TODO v2: atualizar lead com nicho + arquetipo + status='aquecido'
    }, 1200);
  };

  const handleWhatsapp = () => {
    if (!statusPersonalizado) return;
    const msg = buildWhatsappMessage(data, statusPersonalizado.text);
    const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    // TODO v2: marcar lead como whatsapp_sent=true e status='quente'
  };

  return (
    <div className="min-h-screen bg-marroc-muscgo relative overflow-x-hidden">
      {/* Faixa sutil de "scan" no topo — toque operador */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-marroc-esmeralda/40 to-transparent" />

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">

        {/* === Etapa 1 + 2: Headline + Formulário === */}
        {(step === 'name' || step === 'city') && (
          <section className="fade-in-marroc">
            <div className="flex items-center gap-3 mb-8">
              <div className="relative operador-glow rounded-full p-2 bg-marroc-esmeralda/10">
                <Eye className="w-6 h-6 text-marroc-esmeralda" />
              </div>
              <span className="text-marroc-dourado font-mono text-xs tracking-widest uppercase">
                NEXO's Eye · v1
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display leading-[1.1] mb-6">
              Sua empresa é referência.
              <br />
              <span className="text-marroc-esmeralda">Mas está invisível</span> pra quem busca no Google agora.
            </h1>

            <p className="text-lg text-marroc-salvia max-w-2xl mb-12 leading-relaxed">
              O <span className="text-marroc-dourado font-semibold">NEXO's Eye</span> é um operador
              de inteligência territorial. Em segundos, ele escaneia sua presença digital
              e revela o que está custando clientes sem você saber.
            </p>

            <div className="glass-marroc p-6 md:p-8 max-w-xl">
              {step === 'name' && (
                <form onSubmit={handleNameSubmit} className="fade-in-marroc">
                  <label className="block text-marroc-dourado text-sm font-medium mb-3 tracking-wide uppercase">
                    Como podemos te chamar?
                  </label>
                  <input
                    type="text"
                    autoFocus
                    className="input-marroc mb-4"
                    placeholder="Seu nome"
                    value={data.name}
                    onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    maxLength={60}
                  />
                  <button
                    type="submit"
                    className="btn-marroc w-full"
                    disabled={data.name.trim().length < 2}
                  >
                    Iniciar scan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {step === 'city' && (
                <form onSubmit={handleCitySubmit} className="fade-in-marroc">
                  <div className="text-marroc-salvia text-sm mb-4">
                    Prazer, <span className="text-marroc-dourado font-semibold">{data.name}</span>.
                    {' '}Onde fica sua empresa?
                  </div>
                  <label className="block text-marroc-dourado text-sm font-medium mb-3 tracking-wide uppercase">
                    Cidade
                  </label>
                  <input
                    type="text"
                    autoFocus
                    className="input-marroc mb-4"
                    placeholder="Ex: Mangaratiba, Rio de Janeiro..."
                    value={data.city}
                    onChange={e => setData(prev => ({ ...prev, city: e.target.value }))}
                    maxLength={60}
                  />
                  <button
                    type="submit"
                    className="btn-marroc w-full"
                    disabled={data.city.trim().length < 2}
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-8 flex items-center gap-2 text-marroc-salvia/60 text-xs">
              <Shield className="w-3 h-3" />
              <span>Seus dados não são compartilhados. Apenas usados pra gerar seu relatório.</span>
            </div>
          </section>
        )}

        {/* === Etapa 2.5: Escolha de nicho (pré-revelação) === */}
        {step === 'reveal' && !loading && (
          <section className="fade-in-marroc">
            <div className="text-marroc-salvia text-sm mb-3">
              Última coisa, <span className="text-marroc-dourado font-semibold">{data.name}</span>.
            </div>
            <h2 className="text-3xl md:text-4xl font-display mb-3">
              Qual destes se parece mais com você em <span className="text-marroc-esmeralda">{data.city}</span>?
            </h2>
            <p className="text-marroc-salvia/80 mb-8">
              Isso calibra o scan pro seu tipo de operação.
            </p>

            <div className="grid gap-3 max-w-xl">
              {NICHOS.map(n => (
                <button
                  key={n.value}
                  onClick={() => handleNichoSelect(n.value)}
                  className="glass-marroc p-5 text-left hover:border-marroc-esmeralda/50 hover:bg-marroc-esmeralda/5 transition-all group"
                >
                  <div className="font-medium text-marroc-texto text-lg mb-1 group-hover:text-marroc-dourado transition-colors">
                    {n.label}
                  </div>
                  <div className="text-marroc-salvia/60 text-sm font-mono">
                    → {n.arquetipo}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* === Loading: "processando scan" === */}
        {step === 'reveal' && loading && (
          <section className="fade-in-marroc text-center py-20">
            <Loader2 className="w-12 h-12 text-marroc-esmeralda animate-spin mx-auto mb-6" />
            <div className="text-marroc-dourado font-mono text-sm tracking-widest uppercase mb-2">
              Operador escaneando
            </div>
            <div className="text-marroc-salvia text-sm">
              Cruzando dados territoriais de {data.city}...
            </div>
          </section>
        )}

        {/* === Etapa 3: Espelho de Dor + CTA WhatsApp === */}
        {step === 'whatsapp' && statusPersonalizado && (
          <section className="fade-in-marroc">
            <div className="flex items-center gap-2 mb-6">
              <span className="badge-quente">
                <span className="w-1.5 h-1.5 rounded-full bg-marroc-esmeralda animate-pulse" />
                Scan concluído
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-display mb-4 leading-tight">
              {data.name}, o NEXO's Eye detectou:
            </h2>

            <div className="glass-marroc operador-glow p-8 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-marroc-esmeralda/50" />
              <div className="text-marroc-esmeralda font-mono text-xs tracking-widest uppercase mb-3">
                Status · {data.city}
              </div>
              <p className="text-xl md:text-2xl text-marroc-texto leading-relaxed font-display">
                {statusPersonalizado.text}
              </p>
              <div className="divider-marroc my-6" />
              <div className="flex items-start gap-3 text-marroc-salvia text-sm">
                <CheckCircle2 className="w-4 h-4 text-marroc-esmeralda mt-0.5 flex-shrink-0" />
                <span>
                  Você está exatamente no padrão que o Eye costuma detectar em negócios sólidos
                  da sua região — o problema não é o seu produto, é a sua vitrine digital.
                </span>
              </div>
            </div>

            <div className="glass-marroc p-6 mb-8 max-w-xl">
              <h3 className="text-marroc-dourado text-lg font-display mb-2">
                Quer reverter isso?
              </h3>
              <p className="text-marroc-salvia text-sm mb-5">
                Fale direto com o operador. Em uma conversa rápida, ele te mostra o caminho
                mais curto pra sua empresa aparecer pra quem está buscando agora.
              </p>
              <button onClick={handleWhatsapp} className="btn-marroc w-full">
                Falar com o Operador no WhatsApp
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-marroc-salvia/50 text-xs flex items-center gap-2">
              <Eye className="w-3 h-3" />
              <span>
                NEXO's Eye é uma operação da{' '}
                <span className="text-marroc-dourado/80">Marroc Solutions</span>.
              </span>
            </div>
          </section>
        )}

      </main>

      {/* Footer mínimo com link discreto pro CRM interno */}
      <footer className="border-t border-marroc-dourado/10 mt-20 py-6">
        <div className="max-w-3xl mx-auto px-6 flex items-center justify-between text-marroc-salvia/40 text-xs">
          <span>© {new Date().getFullYear()} Marroc Solutions</span>
          <Link to="/crm" className="hover:text-marroc-dourado transition-colors">
            Acesso interno
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
