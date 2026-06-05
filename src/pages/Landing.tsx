/**
 * NEXO's Eye v1 — Landing Pública (eye.marroc.xyz)
 * MOBILE-FIRST
 * 
 * Funil de 4 etapas desenhado pela Prisma:
 *   1. Headline Universal
 *   2. Formulário de Nome
 *   3. Revelação de Status Personalizada (Espelho de Dor)
 *   4. CTA WhatsApp
 * 
 * Otimizações mobile:
 *   - Tap targets mínimo 44x44px (Apple HIG)
 *   - Texto legível a 30cm de distância (16px+ em inputs)
 *   - Sem zoom acidental (input font-size 16px)
 *   - Layout responsivo testado em 360px (iPhone SE) até 1920px
 *   - Sem scroll horizontal
 *   - Botão WhatsApp sempre acima da dobra no mobile
 * 
 * TODO v2: Persistir leads no Supabase
 *   - Tabela: leads_eye { id, name, city, nicho, arquetipo, status, created_at, whatsapp_sent }
 *   - Hook: useLeadCapture (substituir setState local por supabase.from().insert())
 *   - No submit, gerar token de tracking e mandar via UTM no link wa.me
 */

import { useState, useMemo } from 'react';
import { Eye, Shield, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 'name' | 'city' | 'reveal' | 'whatsapp';

interface LeadData {
  name: string;
  city: string;
  nicho: 'restaurante' | 'servico' | 'varejo' | 'outro' | '';
}

const NICHOS: Array<{ value: LeadData['nicho']; label: string; arquetipo: string }> = [
  { value: 'restaurante', label: 'Restaurante / Alimentação', arquetipo: 'Conveniência Perdida' },
  { value: 'servico', label: 'Prestador de Serviço', arquetipo: 'Autoridade Ferida' },
  { value: 'varejo', label: 'Loja / Varejo', arquetipo: 'Giro Estagnado' },
  { value: 'outro', label: 'Outro', arquetipo: 'Invisibilidade Digital' },
];

// Link WhatsApp do CEO (Marroc) — conforme CONSOLIDACAO_REUNIAO_NEXOS_EYE
const WHATSAPP_NUMBER = '5521983821884';
const WHATSAPP_BASE = `https://wa.me/${WHATSAPP_NUMBER}`;

function buildWhatsappMessage(data: LeadData, statusText: string): string {
  const arquetipo = NICHOS.find(n => n.value === data.nicho)?.arquetipo ?? 'Invisibilidade Digital';
  return [
    `Olá Marroc, sou ${data.name} de ${data.city}.`,
    ``,
    `Acabei de passar pelo scan do NEXO's Eye e o status foi: *${statusText}*`,
    `Arquetipo detectado: *${arquetipo}*`,
    ``,
    `Quero entender o que dá pra fazer pra reverter.`,
  ].join('\n');
}

const Landing = () => {
  const [step, setStep] = useState<Step>('name');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LeadData>({ name: '', city: '', nicho: '' });

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
  };

  const handleNichoSelect = (nicho: LeadData['nicho']) => {
    setData(prev => ({ ...prev, nicho }));
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('whatsapp');
    }, 1200);
  };

  const handleWhatsapp = () => {
    if (!statusPersonalizado) return;
    const msg = buildWhatsappMessage(data, statusPersonalizado.text);
    const url = `${WHATSAPP_BASE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-marroc-muscgo relative overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-marroc-esmeralda/40 to-transparent" />

      {/* === Header enxuto (mobile) === */}
      <header className="px-4 sm:px-6 py-4 flex items-center justify-between max-w-3xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="relative operador-glow rounded-full p-1.5 bg-marroc-esmeralda/10">
            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-marroc-esmeralda" />
          </div>
          <span className="text-marroc-dourado font-display text-xs sm:text-sm tracking-wider">
            NEXO's Eye
          </span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 sm:pb-20">

        {/* === Etapa 1 + 2: Headline + Formulário === */}
        {(step === 'name' || step === 'city') && (
          <section className="fade-in-marroc">
            <h1 className="text-[1.75rem] leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl font-display sm:leading-[1.1] mb-4 sm:mb-6">
              Sua empresa é referência.
              <br />
              <span className="text-marroc-esmeralda">Mas está invisível</span> pra quem busca no Google agora.
            </h1>

            <p className="text-base sm:text-lg text-marroc-salvia max-w-2xl mb-8 sm:mb-12 leading-relaxed">
              O <span className="text-marroc-dourado font-semibold">NEXO's Eye</span> é um operador
              de inteligência territorial. Em segundos, ele escaneia sua presença digital
              e revela o que está custando clientes sem você saber.
            </p>

            <div className="glass-marroc p-5 sm:p-8 max-w-xl">
              {step === 'name' && (
                <form onSubmit={handleNameSubmit} className="fade-in-marroc">
                  <label className="block text-marroc-dourado text-xs sm:text-sm font-medium mb-3 tracking-wide uppercase">
                    Como podemos te chamar?
                  </label>
                  <input
                    type="text"
                    autoFocus
                    inputMode="text"
                    autoComplete="name"
                    className="input-marroc mb-4 min-h-[48px] text-base"
                    placeholder="Seu nome"
                    value={data.name}
                    onChange={e => setData(prev => ({ ...prev, name: e.target.value }))}
                    maxLength={60}
                  />
                  <button
                    type="submit"
                    className="btn-marroc w-full min-h-[48px] text-base"
                    disabled={data.name.trim().length < 2}
                  >
                    Iniciar scan
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {step === 'city' && (
                <form onSubmit={handleCitySubmit} className="fade-in-marroc">
                  <div className="text-marroc-salvia text-sm mb-4 leading-relaxed">
                    Prazer, <span className="text-marroc-dourado font-semibold">{data.name}</span>.
                    {' '}Onde fica sua empresa?
                  </div>
                  <label className="block text-marroc-dourado text-xs sm:text-sm font-medium mb-3 tracking-wide uppercase">
                    Cidade
                  </label>
                  <input
                    type="text"
                    autoFocus
                    inputMode="text"
                    autoComplete="address-level2"
                    className="input-marroc mb-4 min-h-[48px] text-base"
                    placeholder="Ex: Mangaratiba, Rio de Janeiro..."
                    value={data.city}
                    onChange={e => setData(prev => ({ ...prev, city: e.target.value }))}
                    maxLength={60}
                  />
                  <button
                    type="submit"
                    className="btn-marroc w-full min-h-[48px] text-base"
                    disabled={data.city.trim().length < 2}
                  >
                    Continuar
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 sm:mt-8 flex items-start sm:items-center gap-2 text-marroc-salvia/60 text-xs leading-relaxed">
              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5 sm:mt-0" />
              <span>Seus dados não são compartilhados. Apenas usados pra gerar seu relatório.</span>
            </div>
          </section>
        )}

        {/* === Etapa 2.5: Escolha de nicho === */}
        {step === 'reveal' && !loading && (
          <section className="fade-in-marroc">
            <div className="text-marroc-salvia text-sm mb-3">
              Última coisa, <span className="text-marroc-dourado font-semibold">{data.name}</span>.
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display mb-3 leading-tight">
              Qual destes se parece mais com você em <span className="text-marroc-esmeralda">{data.city}</span>?
            </h2>
            <p className="text-sm sm:text-base text-marroc-salvia/80 mb-6 sm:mb-8">
              Isso calibra o scan pro seu tipo de operação.
            </p>

            <div className="grid gap-3 max-w-xl">
              {NICHOS.map(n => (
                <button
                  key={n.value}
                  onClick={() => handleNichoSelect(n.value)}
                  className="glass-marroc p-4 sm:p-5 text-left hover:border-marroc-esmeralda/50 hover:bg-marroc-esmeralda/5 active:scale-[0.98] transition-all group min-h-[64px]"
                >
                  <div className="font-medium text-marroc-texto text-base sm:text-lg mb-1 group-hover:text-marroc-dourado transition-colors leading-snug">
                    {n.label}
                  </div>
                  <div className="text-marroc-salvia/60 text-xs sm:text-sm font-light">
                    → {n.arquetipo}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* === Loading === */}
        {step === 'reveal' && loading && (
          <section className="fade-in-marroc text-center py-12 sm:py-20">
            <Loader2 className="w-12 h-12 text-marroc-esmeralda animate-spin mx-auto mb-6" />
            <div className="text-marroc-dourado font-display text-sm tracking-widest uppercase mb-2">
              Operador escaneando
            </div>
            <div className="text-marroc-salvia text-sm px-4">
              Cruzando dados territoriais de {data.city}...
            </div>
          </section>
        )}

        {/* === Etapa 3: Espelho de Dor + CTA WhatsApp === */}
        {step === 'whatsapp' && statusPersonalizado && (
          <section className="fade-in-marroc">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <span className="badge-quente">
                <span className="w-1.5 h-1.5 rounded-full bg-marroc-esmeralda animate-pulse" />
                Scan concluído
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display mb-4 leading-tight">
              {data.name}, o NEXO's Eye detectou:
            </h2>

            <div className="glass-marroc operador-glow p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-marroc-esmeralda/50" />
              <div className="text-marroc-esmeralda font-display text-xs tracking-widest uppercase mb-3">
                Status · {data.city}
              </div>
              <p className="text-lg sm:text-xl md:text-2xl text-marroc-texto leading-relaxed font-display">
                {statusPersonalizado.text}
              </p>
              <div className="divider-marroc my-5 sm:my-6" />
              <div className="flex items-start gap-3 text-marroc-salvia text-sm leading-relaxed">
                <CheckCircle2 className="w-4 h-4 text-marroc-esmeralda mt-0.5 flex-shrink-0" />
                <span>
                  Você está exatamente no padrão que o Eye costuma detectar em negócios sólidos
                  da sua região — o problema não é o seu produto, é a sua vitrine digital.
                </span>
              </div>
            </div>

            {/* CTA Sticky no mobile pra ficar sempre visível */}
            <div className="glass-marroc p-5 sm:p-6 mb-6 sm:mb-8 max-w-xl">
              <h3 className="text-marroc-dourado text-base sm:text-lg font-display mb-2">
                Quer reverter isso?
              </h3>
              <p className="text-marroc-salvia text-sm mb-4 sm:mb-5 leading-relaxed">
                Fale direto com o operador. Em uma conversa rápida, ele te mostra o caminho
                mais curto pra sua empresa aparecer pra quem está buscando agora.
              </p>
              <button 
                onClick={handleWhatsapp} 
                className="btn-marroc w-full min-h-[52px] text-base font-semibold"
              >
                <span className="hidden sm:inline">Falar com o Operador no WhatsApp</span>
                <span className="sm:hidden">Falar no WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="text-marroc-salvia/50 text-xs flex items-center gap-2 leading-relaxed">
              <Eye className="w-3 h-3 flex-shrink-0" />
              <span>
                NEXO's Eye é uma operação da{' '}
                <span className="text-marroc-dourado/80">Marroc Solutions</span>.
              </span>
            </div>
          </section>
        )}

      </main>

      <footer className="border-t border-marroc-dourado/10 mt-12 sm:mt-20 py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between text-marroc-salvia/40 text-xs">
          <span>© {new Date().getFullYear()} Marroc Solutions</span>
          <Link to="/crm" className="hover:text-marroc-dourado transition-colors py-2">
            Acesso interno
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
