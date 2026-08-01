import { Lead, LeadPriority, LEAD_SOURCES, getDaysSinceContact } from '@/types/lead';
import { LeadEvent, LEAD_EVENT_TYPES, formatEventTime, isEventToday, isEventPast } from '@/types/leadEvent';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  Archive,
  Pencil,
  ExternalLink,
  Briefcase,
  Loader2,
  Sparkles,
  FileText,
  Clock,
  Tag,
  RefreshCw,
  FolderPlus,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: (leadId: string) => void;
  onUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onEdit: (lead: Lead) => void;
  onAnalyze: (lead: Lead) => Promise<string | null>;
  onUpdateLastContact?: (leadId: string) => void;
  onCreateProject?: (lead: Lead) => void;
  onAddEvent?: (lead: Lead) => void;
  onToggleEventComplete?: (eventId: string, completed: boolean) => void;
  onDeleteEvent?: (eventId: string) => void;
  leadEvents?: LeadEvent[];
  hasProject?: boolean;
}

const priorityConfig: Record<LeadPriority, { label: string; className: string }> = {
  low: { label: 'Frio', className: 'temp-tag-cold' },
  medium: { label: 'Morno', className: 'temp-tag-warm' },
  high: { label: 'Quente', className: 'temp-tag-hot' },
};

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
  onArchive,
  onEdit,
  onAnalyze,
  onUpdateLastContact,
  onCreateProject,
  onAddEvent,
  onToggleEventComplete,
  onDeleteEvent,
  leadEvents = [],
  hasProject,
}: LeadDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('dados');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  const leadEventsList = leadEvents
    .filter((e) => e.lead_id === lead?.id)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  if (!lead) return null;

  const priority = priorityConfig[lead.priority || 'medium'];
  const source = LEAD_SOURCES.find(s => s.id === lead.source);
  const daysSince = getDaysSinceContact(lead);

  const formatWhatsAppUrl = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  };

  const formatShortDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }).format(new Date(date));
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setCurrentAnalysis(null);
    try {
      const analysis = await onAnalyze(lead);
      if (analysis) {
        setCurrentAnalysis(analysis);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleMarkContact = () => {
    if (onUpdateLastContact) {
      onUpdateLastContact(lead.id);
    }
  };

  const displayAnalysis = currentAnalysis || lead.ai_summary;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg glass-card border-l border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-marroc-dourado/15">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-marroc-texto flex items-center gap-2">
                {lead.name}
              </SheetTitle>
              {lead.company && (
                <p className="text-sm text-marroc-esmeralda mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {lead.company}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded text-xs font-mono ${priority.className}`}>
              {priority.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-marroc-salvia/70">
            <span className="font-mono">ID: {lead.id.slice(0, 8)}</span>
            {source && (
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {source.icon} {source.label}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {daysSince}d atrás
            </span>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4 bg-marroc-dourado/5">
            <TabsTrigger value="dados" className="data-[state=active]:bg-marroc-esmeralda/20 data-[state=active]:text-marroc-esmeralda">
              Dados
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-marroc-esmeralda/20 data-[state=active]:text-marroc-esmeralda">
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="eventos" className="data-[state=active]:bg-marroc-esmeralda/20 data-[state=active]:text-marroc-esmeralda">
              Eventos
            </TabsTrigger>
            <TabsTrigger value="acoes" className="data-[state=active]:bg-marroc-esmeralda/20 data-[state=active]:text-marroc-esmeralda">
              Ações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="mt-6 space-y-4">
            <InfoRow icon={User} label="Nome" value={lead.name} />
            <InfoRow icon={Briefcase} label="Cargo" value={lead.role} />
            <InfoRow 
              icon={Phone} 
              label="WhatsApp" 
              value={lead.phone}
              action={lead.phone ? {
                icon: ExternalLink,
                href: formatWhatsAppUrl(lead.phone),
              } : undefined}
            />
            <InfoRow icon={Mail} label="Email" value={lead.email} />
            <InfoRow 
              icon={Globe} 
              label="Website" 
              value={lead.website}
              action={lead.website ? {
                icon: ExternalLink,
                href: lead.website.startsWith('http') ? lead.website : `https://${lead.website}`,
              } : undefined}
            />
            <InfoRow icon={Tag} label="Origem" value={source ? `${source.icon} ${source.label}` : null} />
            <InfoRow icon={Clock} label="Último Contato" value={formatShortDate(lead.last_contact_at)} />
            {lead.value && (
              <InfoRow 
                icon={Building2} 
                label="Valor Estimado" 
                value={new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(lead.value)}
                highlight
              />
            )}
            {lead.obs && (
              <div className="pt-3 border-t border-marroc-dourado/15">
                <div className="flex items-center gap-2 mb-2 text-marroc-salvia/70">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Observações</span>
                </div>
                <p className="text-sm text-marroc-texto/80 whitespace-pre-wrap bg-marroc-dourado/5 p-3 rounded-lg">
                  {lead.obs}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analise" className="mt-6">
            <div className="glass-card p-4 rounded-lg border border-marroc-dourado/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-marroc-esmeralda">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-display text-sm tracking-wide">
                    Análise do Operador
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="border-marroc-dourado/50 text-marroc-dourado hover:bg-marroc-dourado/10 gap-2"
                >
                  {analyzing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  {analyzing ? 'Analisando...' : displayAnalysis ? 'Reanalisar' : 'Gerar Análise'}
                </Button>
              </div>
              
              <div className="terminal-text min-h-[200px] whitespace-pre-wrap text-sm">
                {analyzing ? (
                  <div className="flex flex-col items-center justify-center h-[200px] text-marroc-salvia/70">
                    <Loader2 className="w-8 h-8 animate-spin text-marroc-dourado mb-3" />
                    <p className="text-sm">Processando análise com IA...</p>
                    <p className="text-xs mt-1 opacity-60">Isso pode levar alguns segundos</p>
                  </div>
                ) : displayAnalysis ? (
                  <span className="text-marroc-texto/90">{displayAnalysis}</span>
                ) : (
                  <span className="text-marroc-salvia/70 opacity-50">
                    {`> Aguardando análise do sistema...\n> Nenhum relatório disponível.\n> Clique em "Gerar Análise" para criar o dossiê.`}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="eventos" className="mt-6 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-marroc-dourado">
                <Calendar className="w-4 h-4" />
                <span className="font-display text-sm tracking-wide">Agenda do Lead</span>
              </div>
              {onAddEvent && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-marroc-dourado/15 text-marroc-esmeralda hover:bg-marroc-esmeralda/10"
                  onClick={() => onAddEvent(lead)}
                >
                  + Novo
                </Button>
              )}
            </div>

            {leadEventsList.length === 0 ? (
              <div className="text-center py-8 text-marroc-salvia/50">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum evento agendado</p>
                {onAddEvent && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-marroc-dourado/15"
                    onClick={() => onAddEvent(lead)}
                  >
                    Agendar primeiro evento
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {leadEventsList.map((event) => {
                  const type = LEAD_EVENT_TYPES.find((t) => t.id === event.type) || LEAD_EVENT_TYPES[4];
                  const isPast = isEventPast(event.scheduled_at, event.completed);
                  const isToday = isEventToday(event.scheduled_at);

                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border border-marroc-dourado/15 bg-marroc-dourado/5 ${
                        event.completed ? 'opacity-50' : ''
                      } ${isPast ? 'border-l-2 border-l-red-400/60' : ''} ${isToday ? 'border-l-2 border-l-marroc-esmeralda' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        {onToggleEventComplete && (
                          <Checkbox
                            checked={event.completed}
                            onCheckedChange={(checked) => onToggleEventComplete(event.id, checked as boolean)}
                            className="mt-0.5 border-marroc-esmeralda/50 data-[state=checked]:bg-marroc-esmeralda"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-medium truncate ${event.completed ? 'line-through' : 'text-marroc-texto'}`}>
                              {event.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${type.color}`}>
                              {type.icon} {type.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-marroc-salvia/70">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatEventTime(event.scheduled_at)}
                            </span>
                            {event.duration_minutes && <span>{event.duration_minutes}min</span>}
                            {isToday && <span className="text-marroc-esmeralda">Hoje</span>}
                            {isPast && !event.completed && <span className="text-red-300">Atrasado</span>}
                          </div>
                          {event.notes && (
                            <p className="text-xs text-marroc-salvia/60 mt-2 line-clamp-2">{event.notes}</p>
                          )}
                        </div>
                        {onDeleteEvent && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-marroc-salvia/50 hover:text-red-300 hover:bg-red-500/10 flex-shrink-0"
                            onClick={() => onDeleteEvent(event.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="acoes" className="mt-6 space-y-3">
            {lead.status === 'fechado' && !hasProject && onCreateProject && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-marroc-esmeralda/10 hover:border-marroc-esmeralda/50"
                onClick={() => {
                  onCreateProject(lead);
                  onOpenChange(false);
                }}
              >
                <FolderPlus className="w-4 h-4 text-marroc-esmeralda" />
                Criar Projeto
              </Button>
            )}
            {onAddEvent && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-marroc-esmeralda/10 hover:border-marroc-esmeralda/50"
                onClick={() => onAddEvent(lead)}
              >
                <Calendar className="w-4 h-4 text-marroc-esmeralda" />
                Agendar Evento
              </Button>
            )}
            {onUpdateLastContact && (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-marroc-dourado/5 hover:border-neon-green/50"
                onClick={handleMarkContact}
              >
                <RefreshCw className="w-4 h-4 text-marroc-salvia" />
                Marcar Contato Realizado
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-marroc-dourado/5 hover:border-marroc-esmeralda/50"
              onClick={() => {
                onEdit(lead);
                onOpenChange(false);
              }}
            >
              <Pencil className="w-4 h-4 text-marroc-esmeralda" />
              Editar Lead
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-marroc-dourado/15 hover:bg-red-500/10 hover:border-destructive/50 hover:text-red-300"
              onClick={() => {
                onArchive(lead.id);
                onOpenChange(false);
              }}
            >
              <Archive className="w-4 h-4" />
              Arquivar Lead
            </Button>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  action?: {
    icon: React.ComponentType<{ className?: string }>;
    href: string | null;
  };
  highlight?: boolean;
}

function InfoRow({ icon: Icon, label, value, action, highlight }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-marroc-dourado/15">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-marroc-salvia/70" />
        <span className="text-sm text-marroc-salvia/70">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${highlight ? 'font-display text-marroc-dourado' : 'text-marroc-texto'}`}>
          {value || '—'}
        </span>
        {action?.href && (
          <a 
            href={action.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-marroc-dourado/10 transition-colors"
          >
            <action.icon className="w-3.5 h-3.5 text-marroc-esmeralda" />
          </a>
        )}
      </div>
    </div>
  );
}
