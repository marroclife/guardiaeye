import { Lead } from '@/types/lead';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Archive, RotateCcw, Trash2, Building2 } from 'lucide-react';
import { useState } from 'react';

interface ArchivedLeadsSheetProps {
  archivedLeads: Lead[];
  onUnarchive: (leadId: string) => void;
  onPermanentDelete: (leadId: string) => void;
}

export function ArchivedLeadsSheet({ 
  archivedLeads, 
  onUnarchive, 
  onPermanentDelete 
}: ArchivedLeadsSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-marroc-dourado/15 hover:bg-marroc-dourado/5 gap-2"
        >
          <Archive className="w-4 h-4" />
          Arquivados
          {archivedLeads.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded bg-marroc-dourado/10">
              {archivedLeads.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md glass-card border-l border-marroc-dourado/15 bg-marroc-muscgo/95 backdrop-blur-xl overflow-y-auto">
        <SheetHeader className="pb-4 border-b border-marroc-dourado/15">
          <SheetTitle className="text-lg font-semibold text-marroc-texto flex items-center gap-2">
            <Archive className="w-5 h-5 text-marroc-salvia/70" />
            Leads Arquivados
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {archivedLeads.length === 0 ? (
            <div className="text-center py-12 text-marroc-salvia/70">
              <Archive className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum lead arquivado</p>
            </div>
          ) : (
            archivedLeads.map((lead) => (
              <div
                key={lead.id}
                className="glass-card p-4 rounded-lg border border-marroc-dourado/15 hover:border-marroc-dourado/15 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-marroc-texto truncate">{lead.name}</h4>
                    {lead.company && (
                      <p className="text-sm text-marroc-esmeralda flex items-center gap-1 mt-1">
                        <Building2 className="w-3 h-3" />
                        {lead.company}
                      </p>
                    )}
                    <p className="text-xs text-marroc-salvia/70 mt-2">
                      Arquivado em {formatDate(lead.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onUnarchive(lead.id)}
                    className="flex-1 border-neon-green/30 text-marroc-salvia hover:bg-marroc-salvia/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                    Restaurar
                  </Button>
                  
                  {confirmDelete === lead.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          onPermanentDelete(lead.id);
                          setConfirmDelete(null);
                        }}
                        className="text-xs"
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs border-marroc-dourado/15"
                      >
                        Não
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDelete(lead.id)}
                      className="border-destructive/30 text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
