import { useState } from 'react';
import { 
  Search, 
  Database, 
  Webhook, 
  Shield, 
  Zap, 
  MessageSquare,
  Settings,
  Users,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  Terminal
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

interface HelpCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  code?: string;
  warning?: string;
  tip?: string;
}

const helpCategories: HelpCategory[] = [
  {
    id: 'database',
    title: 'Banco de Dados',
    icon: Database,
    iconColor: 'text-marroc-esmeralda',
    articles: [
      {
        id: 'db-structure',
        title: 'Estrutura do Banco de Dados',
        content: `O Guardian's Eye utiliza o Lovable Cloud como backend. A tabela principal é a **leads** com os seguintes campos:

• **id** (UUID): Identificador único do lead
• **created_at** (timestamp): Data de criação
• **updated_at** (timestamp): Última atualização
• **name** (text): Nome do contato
• **company** (text): Empresa
• **role** (text): Cargo do contato
• **phone** (text): Telefone/WhatsApp
• **email** (text): Email de contato
• **website** (text): Site da empresa
• **status** (text): Coluna do Kanban (triagem, qualificado, proposta, fechado)
• **ai_summary** (text): Resumo gerado pela IA
• **value** (numeric): Valor estimado do negócio
• **priority** (text): Prioridade (low, medium, high)`,
        tip: 'A tabela possui Real-time habilitado, então qualquer alteração externa será refletida instantaneamente no Kanban.'
      },
      {
        id: 'db-backup',
        title: 'Backup e Exportação de Dados',
        content: `Para exportar seus dados, acesse o painel do Lovable Cloud:

1. Clique na aba **Cloud** no editor do Lovable
2. Navegue até **Database → Tables**
3. Selecione a tabela **leads**
4. Clique no botão de **exportar** para baixar os dados em CSV

Para backups automáticos, você pode criar uma automação no n8n que periodicamente consulta a tabela e salva em um Google Sheets ou outro destino.`,
        warning: 'Sempre faça backup antes de realizar alterações em massa no banco de dados.'
      },
      {
        id: 'db-migration',
        title: 'Migrando de Outro Sistema',
        content: `Para migrar dados de outro CRM para o Guardian's Eye:

**Preparação dos Dados:**
1. Exporte os dados do seu sistema atual em CSV
2. Certifique-se que as colunas estejam mapeadas corretamente
3. Converta o status para: triagem, qualificado, proposta, ou fechado
4. Converta a prioridade para: low, medium, ou high

**Importação:**
Use o n8n para criar um fluxo de importação ou insira diretamente via API do Supabase.`,
        code: `// Exemplo de inserção via API
const { data, error } = await supabase
  .from('leads')
  .insert([
    { 
      name: 'João Silva',
      company: 'Tech Corp',
      status: 'triagem',
      priority: 'high'
    }
  ]);`
      }
    ]
  },
  {
    id: 'webhook',
    title: 'Integração n8n / Webhooks',
    icon: Webhook,
    iconColor: 'text-marroc-dourado',
    articles: [
      {
        id: 'n8n-setup',
        title: 'Configurando o Webhook n8n',
        content: `O n8n permite automatizar a captura de leads de diversas fontes. Siga os passos:

**No n8n:**
1. Crie um novo workflow
2. Adicione um nó **Webhook** como trigger
3. Configure como POST e copie a URL gerada
4. Adicione um nó **Supabase** para inserir na tabela leads

**Mapeamento de campos:**
Configure o nó Supabase para mapear os dados recebidos para os campos corretos da tabela.`,
        code: `// Estrutura esperada do Webhook
{
  "name": "Nome do Lead",
  "company": "Empresa",
  "phone": "+55 11 99999-9999",
  "email": "email@empresa.com",
  "status": "triagem",
  "priority": "medium"
}`,
        tip: 'Use o modo de teste do n8n para verificar se os dados estão chegando corretamente antes de ativar o workflow.'
      },
      {
        id: 'n8n-whatsapp',
        title: 'Integração com WhatsApp (Evolution API)',
        content: `Para capturar leads automaticamente do WhatsApp:

**Pré-requisitos:**
• Evolution API configurada e conectada ao WhatsApp
• n8n rodando e acessível

**Fluxo de Automação:**
1. **Trigger:** Webhook recebendo mensagens da Evolution API
2. **Filtro:** Identificar se é uma nova conversa
3. **Extração:** Usar IA para extrair nome e empresa da mensagem
4. **Inserção:** Criar lead no Guardian's Eye com status "triagem"
5. **Resposta:** Enviar mensagem automática de boas-vindas`,
        warning: 'Certifique-se de estar em conformidade com a LGPD ao coletar dados de clientes.'
      },
      {
        id: 'n8n-ai',
        title: 'Análise de Leads com IA',
        content: `Configure a IA para analisar e qualificar leads automaticamente:

**Workflow sugerido:**
1. **Trigger:** Quando um novo lead é inserido (via Supabase trigger)
2. **Coleta:** Buscar informações do site da empresa
3. **Análise:** Enviar dados para OpenAI/Claude para análise
4. **Atualização:** Salvar resumo no campo ai_summary
5. **Notificação:** Alertar equipe sobre leads quentes

O resumo aparecerá na seção "Análise do Guardião" do dossiê do lead.`,
        code: `// Prompt sugerido para a IA
"Analise este lead e forneça:
1. Porte da empresa (pequeno/médio/grande)
2. Potencial de negócio (1-10)
3. Principais pontos de atenção
4. Sugestão de abordagem

Dados do lead: {leadData}"`
      }
    ]
  },
  {
    id: 'pipeline',
    title: 'Gerenciando o Pipeline',
    icon: Users,
    iconColor: 'text-marroc-salvia',
    articles: [
      {
        id: 'kanban-usage',
        title: 'Usando o Quadro Kanban',
        content: `O Kanban é o coração do Guardian's Eye. Entenda cada coluna:

**📥 Triagem Neural**
Leads novos que chegaram via WhatsApp ou formulário. Precisam de primeiro contato.

**💎 Qualificados**
Leads que demonstraram interesse real e têm fit com seus serviços.

**📜 Em Proposta**
Negociações ativas. Propostas enviadas aguardando resposta.

**🚀 Protocolo Ativado**
Negócios fechados! Leads convertidos em clientes.

**Movendo Cards:**
Arraste e solte para mover entre colunas. A mudança é salva automaticamente.`,
        tip: 'Use as cores de temperatura (Frio/Morno/Quente) baseadas na prioridade para identificar rapidamente quais leads precisam de mais atenção.'
      },
      {
        id: 'lead-details',
        title: 'Dossiê do Lead',
        content: `Clique em qualquer card para abrir o dossiê completo:

**Aba Dados:**
• Informações de contato completas
• Botão direto para abrir WhatsApp
• Link para o site da empresa

**Aba Análise do Guardião:**
• Resumo gerado pela IA (quando configurado)
• Insights sobre o potencial do lead
• Histórico de interações (futuro)

**Ações Disponíveis:**
• **Editar:** Alterar informações do lead
• **Arquivar:** Mover para arquivo morto
• **Agendar:** Criar lembrete de follow-up`
      },
      {
        id: 'priorities',
        title: 'Sistema de Prioridades',
        content: `O Guardian's Eye usa um sistema de temperatura baseado em cores:

🔵 **Frio (Low):** Lead inicial, precisa de nurturing
🟡 **Morno (Medium):** Demonstrou interesse, acompanhar de perto  
🔴 **Quente (High):** Alta probabilidade de fechamento, prioridade máxima

**Boas práticas:**
• Revise leads frios semanalmente
• Contate leads mornos a cada 2-3 dias
• Leads quentes: contato diário até fechamento`,
        tip: 'Configure alertas no n8n para notificar quando leads quentes ficarem sem interação por mais de 24h.'
      }
    ]
  },
  {
    id: 'settings',
    title: 'Configurações',
    icon: Settings,
    iconColor: 'text-marroc-salvia/70',
    articles: [
      {
        id: 'notifications',
        title: 'Configurando Notificações',
        content: `As notificações mantêm você informado sobre atividades importantes:

**Tipos de Notificação:**
• **Novos Leads:** Alerta quando um lead entra no sistema
• **Movimentação:** Notifica mudanças de status no pipeline
• **Sons:** Feedback sonoro para notificações

**Para habilitar notificações push:**
1. Permita notificações no navegador
2. Ative as opções desejadas em Configurações
3. Configure webhooks no n8n para alertas externos (Slack, Email, etc.)`,
        tip: 'Recomendamos manter ativadas as notificações de novos leads para resposta rápida.'
      },
      {
        id: 'appearance',
        title: 'Personalizando a Aparência',
        content: `Ajuste a interface ao seu gosto:

**Animações:**
Desative para melhor performance em computadores mais lentos.

**Grid de Fundo:**
O padrão cyberpunk pode ser desativado para uma aparência mais limpa.

**Tema:**
Atualmente o Guardian's Eye opera apenas no tema escuro, otimizado para longas sessões de trabalho.`
      },
      {
        id: 'integrations',
        title: 'Status das Integrações',
        content: `Monitore suas conexões na página de configurações:

**Lovable Cloud:**
Indica conexão com o banco de dados. Deve sempre estar ONLINE.

**Webhook n8n:**
Mostra status da integração com automações. PENDENTE significa que ainda não foi configurado.

**Troubleshooting:**
• Se Lovable Cloud estiver offline, verifique sua conexão
• Se o Realtime não funcionar, verifique o System Status no topo
• Para problemas com n8n, verifique os logs do workflow`
      }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Solução de Problemas',
    icon: AlertTriangle,
    iconColor: 'text-yellow-400',
    articles: [
      {
        id: 'realtime-issues',
        title: 'Realtime não está funcionando',
        content: `Se as atualizações em tempo real pararem:

**Verificações:**
1. O indicador "System Online" está verde?
2. Há erros no console do navegador?
3. A conexão de internet está estável?

**Soluções:**
• Recarregue a página (F5)
• Limpe o cache do navegador
• Verifique se o Lovable Cloud está ativo

**Se persistir:**
O sistema possui reconexão automática. Aguarde alguns segundos para a reconexão.`,
        warning: 'Se o problema persistir por mais de 5 minutos, pode haver uma instabilidade no servidor.'
      },
      {
        id: 'drag-drop',
        title: 'Arrastar cards não funciona',
        content: `Se o drag & drop do Kanban não responder:

**Possíveis causas:**
• JavaScript desabilitado no navegador
• Extensão bloqueando scripts
• Bug temporário na interface

**Soluções:**
1. Desabilite extensões de ad-block temporariamente
2. Teste em uma janela anônima
3. Limpe cache e cookies do site
4. Tente outro navegador (Chrome recomendado)`
      },
      {
        id: 'data-sync',
        title: 'Dados não sincronizam',
        content: `Quando alterações não são salvas:

**Diagnóstico:**
• Verifique se há toasts de erro aparecendo
• Observe o indicador System Online
• Abra o console (F12) e procure erros

**Causas comuns:**
• Perda de conexão momentânea
• Conflito de dados (edição simultânea)
• Limite de requisições atingido

**Recuperação:**
Os dados são salvos localmente antes de enviar. Recarregue a página após restaurar a conexão.`,
        tip: 'O sistema exibe toasts de sucesso/erro para cada operação. Fique atento a eles.'
      }
    ]
  }
];

export function HelpView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('database');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success('Código copiado!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="boot-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-marroc-esmeralda to-marroc-dourado flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-marroc-texto">Central de Ajuda</h2>
            <p className="text-sm text-marroc-salvia/70 font-mono">GUARDIAN'S EYE DOCUMENTATION v1.0</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative boot-fade-in" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-marroc-salvia/70" />
        <Input
          placeholder="Buscar na documentação..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-marroc-muscgo/40 border-marroc-dourado/15 focus:border-marroc-esmeralda/50"
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 boot-fade-in" style={{ animationDelay: '200ms' }}>
        {helpCategories.slice(0, 4).map((category) => (
          <button
            key={category.id}
            onClick={() => setExpandedCategory(category.id)}
            className={`
              p-4 rounded-lg glass-card border transition-all duration-200
              ${expandedCategory === category.id 
                ? 'border-marroc-esmeralda/30 bg-marroc-esmeralda/5' 
                : 'border-marroc-dourado/15 hover:border-marroc-dourado/25 hover:bg-marroc-dourado/5'
              }
            `}
          >
            <category.icon className={`w-5 h-5 ${category.iconColor} mb-2`} />
            <p className="text-sm font-medium text-marroc-texto">{category.title}</p>
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {filteredCategories.map((category, catIndex) => (
          <div 
            key={category.id} 
            className="glass-card rounded-lg border border-marroc-dourado/15 overflow-hidden boot-fade-in"
            style={{ animationDelay: `${300 + catIndex * 100}ms` }}
          >
            <button
              onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-marroc-dourado/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <category.icon className={`w-5 h-5 ${category.iconColor}`} />
                <h3 className="text-lg font-semibold text-marroc-texto">{category.title}</h3>
                <span className="text-xs text-marroc-salvia/70 font-mono">
                  {category.articles.length} artigos
                </span>
              </div>
              {expandedCategory === category.id ? (
                <ChevronDown className="w-5 h-5 text-marroc-salvia/70" />
              ) : (
                <ChevronRight className="w-5 h-5 text-marroc-salvia/70" />
              )}
            </button>

            {expandedCategory === category.id && (
              <div className="border-t border-marroc-dourado/15">
                <Accordion type="single" collapsible className="w-full">
                  {category.articles.map((article) => (
                    <AccordionItem key={article.id} value={article.id} className="border-marroc-dourado/15">
                      <AccordionTrigger className="px-4 py-3 hover:bg-marroc-dourado/5 text-left">
                        <span className="text-marroc-texto">{article.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="space-y-4">
                          {/* Main Content */}
                          <div className="text-sm text-marroc-salvia/70 whitespace-pre-line leading-relaxed">
                            {article.content}
                          </div>

                          {/* Warning Box */}
                          {article.warning && (
                            <div className="flex gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-yellow-200">{article.warning}</p>
                            </div>
                          )}

                          {/* Tip Box */}
                          {article.tip && (
                            <div className="flex gap-3 p-3 rounded-lg bg-marroc-esmeralda/10 border border-marroc-esmeralda/20">
                              <Lightbulb className="w-5 h-5 text-marroc-esmeralda flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-marroc-esmeralda/90">{article.tip}</p>
                            </div>
                          )}

                          {/* Code Block */}
                          {article.code && (
                            <div className="relative">
                              <div className="flex items-center justify-between px-3 py-2 bg-marroc-muscgo/60 rounded-t-lg border border-marroc-dourado/15 border-b-0">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-4 h-4 text-marroc-salvia" />
                                  <span className="text-xs font-mono text-marroc-salvia/70">Código</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(article.code!, article.id)}
                                  className="flex items-center gap-1 text-xs text-marroc-salvia/70 hover:text-marroc-texto transition-colors"
                                >
                                  {copiedCode === article.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-marroc-salvia" />
                                      <span className="text-marroc-salvia">Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                              <pre className="p-4 bg-marroc-muscgo/80 rounded-b-lg border border-marroc-dourado/15 border-t-0 overflow-x-auto">
                                <code className="text-xs font-mono text-marroc-salvia whitespace-pre">
                                  {article.code}
                                </code>
                              </pre>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Help */}
      <div className="glass-card p-6 rounded-lg border border-marroc-dourado/15 boot-fade-in" style={{ animationDelay: '700ms' }}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-marroc-dourado/20 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-6 h-6 text-marroc-dourado" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-marroc-texto mb-1">Precisa de mais ajuda?</h3>
            <p className="text-sm text-marroc-salvia/70 mb-3">
              Entre em contato com o suporte técnico ou acesse a documentação completa do Lovable.
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="https://docs.lovable.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-marroc-dourado/5 border border-marroc-dourado/15 text-marroc-texto hover:bg-marroc-dourado/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Documentação Lovable
              </a>
              <a
                href="https://docs.n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-marroc-dourado/5 border border-marroc-dourado/15 text-marroc-texto hover:bg-marroc-dourado/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Documentação n8n
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
