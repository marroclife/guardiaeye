import { Lead, LeadPriority } from '@/types/lead';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  User,
  Building2,
  Phone,
  Mail,
  Globe,
  Archive,
  Pencil,
  ExternalLink,
  Terminal,
  Briefcase,
  Loader2,
  Sparkles,
  FileText,
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
}: LeadDetailSheetProps) {
  const [activeTab, setActiveTab] = useState('dados');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<string | null>(null);

  if (!lead) return null;

  const priority = priorityConfig[lead.priority || 'medium'];

  const formatWhatsAppUrl = (phone: string | null) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\D/g, '');
    return `https://wa.me/${cleaned}`;
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  const displayAnalysis = currentAnalysis || lead.ai_summary;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg glass-card border-l border-white/10 bg-black/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                {lead.name}
              </SheetTitle>
              {lead.company && (
                <p className="text-sm text-neon-cyan mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {lead.company}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded text-xs font-mono ${priority.className}`}>
              {priority.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-3">
            ID: {lead.id.slice(0, 8)} • Criado em {formatDate(lead.created_at)}
          </p>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/5">
            <TabsTrigger value="dados" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
              Dados
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="acoes" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan">
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
              <div className="pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm">Observações</span>
                </div>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-white/5 p-3 rounded-lg">
                  {lead.obs}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analise" className="mt-6">
            <div className="glass-card p-4 rounded-lg border border-white/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-neon-green">
                  <Terminal className="w-4 h-4" />
                  <span className="font-mono text-xs uppercase tracking-wider">
                    Guardian Analysis
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10 gap-2"
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
                  <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-purple mb-3" />
                    <p className="text-sm">Processando análise com IA...</p>
                    <p className="text-xs mt-1 opacity-60">Isso pode levar alguns segundos</p>
                  </div>
                ) : displayAnalysis ? (
                  <span className="text-foreground/90">{displayAnalysis}</span>
                ) : (
                  <span className="text-muted-foreground opacity-50">
                    {`> Aguardando análise do sistema...\n> Nenhum relatório disponível.\n> Clique em "Gerar Análise" para criar o dossiê.`}
                  </span>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="acoes" className="mt-6 space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-white/10 hover:bg-white/5 hover:border-neon-cyan/50"
              onClick={() => {
                onEdit(lead);
                onOpenChange(false);
              }}
            >
              <Pencil className="w-4 h-4 text-neon-cyan" />
              Editar Lead
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12 border-white/10 hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive"
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
    <div className="flex items-center justify-between py-3 border-b border-white/5">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${highlight ? 'font-mono text-neon-green' : 'text-foreground'}`}>
          {value || '—'}
        </span>
        {action?.href && (
          <a 
            href={action.href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <action.icon className="w-3.5 h-3.5 text-neon-cyan" />
          </a>
        )}
      </div>
    </div>
  );
}
