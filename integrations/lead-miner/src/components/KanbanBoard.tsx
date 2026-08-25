import React from 'react';
import { 
  Lead, 
  LeadStatus, 
  PriorityLevel 
} from '../types';
import { 
  Flame, 
  MessageSquare, 
  Sparkles, 
  Phone, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';

interface KanbanBoardProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
}

const COLUMNS: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'NEW', label: 'New Leads', color: 'border-zinc-700 text-zinc-300' },
  { status: 'QUALIFIED', label: 'AI Qualified', color: 'border-blue-500/50 text-blue-400' },
  { status: 'CONTACTED', label: 'Contacted', color: 'border-amber-500/50 text-amber-400' },
  { status: 'NEGOTIATING', label: 'Pitch / Negotiation', color: 'border-purple-500/50 text-purple-400' },
  { status: 'CLOSED', label: 'Closed / Won', color: 'border-emerald-500/50 text-emerald-400' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onSelectLead,
  onOpenOutreach,
  onUpdateStatus,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-6 overflow-x-auto">
      {COLUMNS.map((col) => {
        const columnLeads = leads.filter((l) => l.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col bg-[#111114] rounded-2xl border border-zinc-800/80 p-3.5 min-w-[260px] min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800/80 px-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>
                  {col.label}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#18181D] text-[11px] font-semibold text-zinc-300">
                  {columnLeads.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnLeads.length === 0 ? (
                <div className="h-32 border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center text-xs text-zinc-500">
                  No prospects in {col.label}
                </div>
              ) : (
                columnLeads.map((lead) => {
                  const isHighPriority = lead.priority === 'HIGH';
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <div
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="p-3.5 rounded-xl bg-[#0B0B0D] border border-zinc-800/80 hover:border-amber-400/40 transition-all cursor-pointer group shadow-sm relative overflow-hidden"
                    >
                      {/* Priority Tag & Opportunity score */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1">
                          {isHighPriority && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            isHighPriority ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20' : 'bg-zinc-800 text-zinc-400'
                          }`}>
                            {lead.priority}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400">
                          {lead.opportunityScore} pts
                        </span>
                      </div>

                      {/* Property Name & Category */}
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                        {lead.name}
                      </h4>
                      <p className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 line-clamp-1">
                        <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                        {lead.location}
                      </p>

                      {/* Rating & Pain Point */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-amber-400 font-semibold">{lead.rating}★ ({lead.reviewCount})</span>
                          <span className="text-rose-400 font-medium text-[10px] truncate max-w-[120px]">
                            {lead.estimatedLoss?.split('(')[0] || '18% OTA loss'}
                          </span>
                        </div>
                      </div>

                      {/* Quick Action Footer */}
                      <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between gap-1">
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(lead.pitchWhatsApp || lead.generatedPitch || '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                              e.stopPropagation();
                              onUpdateStatus(lead.id, 'CONTACTED');
                            }}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium flex items-center gap-1"
                            title="Quick WhatsApp Direct"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenOutreach(lead);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#141418] hover:bg-[#1E1E24] text-zinc-300 text-[11px] font-medium border border-zinc-800 flex items-center gap-1 ml-auto"
                        >
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          <span>Pitch</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
