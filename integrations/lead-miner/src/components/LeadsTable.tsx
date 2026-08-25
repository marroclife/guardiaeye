import React, { useState } from 'react';
import { 
  Lead, 
  LeadStatus, 
  PriorityLevel 
} from '../types';
import { 
  Search, 
  Filter, 
  Flame, 
  Sparkles, 
  MessageSquare, 
  Mail, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Globe, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  AlertCircle,
  Table as TableIcon,
  Kanban as KanbanIcon,
  Map as MapIcon,
  CheckCircle2,
  TrendingDown
} from 'lucide-react';
import { KanbanBoard } from './KanbanBoard';
import { InteractiveMap } from './InteractiveMap';

interface LeadsTableProps {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onSelectLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: LeadStatus) => void;
  onUpdatePriority: (id: string, priority: PriorityLevel) => void;
  onDeleteLead: (id: string) => void;
}

export const LeadsTable: React.FC<LeadsTableProps> = ({
  leads,
  selectedIds,
  onToggleSelection,
  onToggleSelectAll,
  onSelectLead,
  onOpenOutreach,
  onUpdateStatus,
  onUpdatePriority,
  onDeleteLead,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'kanban' | 'map'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filtering logic
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.location && lead.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.painPoint && lead.painPoint.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.category && lead.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || lead.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const allFilteredIds = filteredLeads.map((l) => l.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));

  const handleQuickCopyWhatsApp = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    const script = lead.pitchWhatsApp || lead.generatedPitch || '';
    navigator.clipboard.writeText(script);
    setCopiedId(lead.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Table Top Controls & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-800/80">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter prospects by name, market, pain point..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Filters & View Modes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="HIGH">🔥 High Priority (Hot)</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
          >
            <option value="ALL">All Pipeline Statuses</option>
            <option value="NEW">New Leads</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CONTACTED">Contacted</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="CLOSED">Closed / Won</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center p-1 rounded-xl bg-[#0B0B0D] border border-zinc-800">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>

            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Pipeline Kanban"
            >
              <KanbanIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pipeline</span>
            </button>

            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Opportunity Map"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering by View Mode */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          leads={filteredLeads}
          onSelectLead={onSelectLead}
          onOpenOutreach={onOpenOutreach}
          onUpdateStatus={onUpdateStatus}
        />
      ) : viewMode === 'map' ? (
        <InteractiveMap
          leads={filteredLeads}
          onSelectLead={onSelectLead}
          onOpenOutreach={onOpenOutreach}
        />
      ) : (
        /* Detailed Table View */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={() => onToggleSelectAll(allFilteredIds)}
                    className="accent-amber-400 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Property & Destination</th>
                <th className="py-3 px-3">Web Channel & Tech Audit</th>
                <th className="py-3 px-3">Google Rating</th>
                <th className="py-3 px-3">AI Diagnostic & Monthly Bleed</th>
                <th className="py-3 px-3">Opportunity / Priority</th>
                <th className="py-3 px-3">Pipeline Status</th>
                <th className="py-3 px-3 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No prospects match your search criteria. Try adjusting the query or destination.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const isHighPriority = lead.priority === 'HIGH';
                  const isMissingWebsite = !lead.website || lead.website.trim() === '';
                  const isOtaRedirect = /booking\.com|airbnb\.com|expedia\.com|vrbo\.com/i.test(lead.website || '');
                  const isSocial = /instagram\.com|facebook\.com/i.test(lead.website || '');
                  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => onSelectLead(lead)}
                      className="hover:bg-[#16161C] transition-colors cursor-pointer group"
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(lead.id)}
                          onChange={() => onToggleSelection(lead.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-amber-400 w-4 h-4 cursor-pointer"
                        />
                      </td>

                      {/* Property & Destination */}
                      <td className="py-3.5 px-3 max-w-[220px]">
                        <div className="font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {lead.name}
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                          <span className="truncate">{lead.location}</span>
                        </div>
                        {lead.phone && (
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {lead.phone}
                          </div>
                        )}
                      </td>

                      {/* Web Presence & Tech Audit */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        {isMissingWebsite ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            <AlertCircle className="w-3 h-3" /> No Website Listed
                          </span>
                        ) : isOtaRedirect ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            <ExternalLink className="w-3 h-3" /> OTA Listing (18% Fee)
                          </span>
                        ) : isSocial ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                            Instagram / DM Only
                          </span>
                        ) : (
                          <a
                            href={lead.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-zinc-300 hover:text-amber-400 font-mono text-[11px] truncate flex items-center gap-1 hover:underline max-w-[170px]"
                          >
                            <Globe className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                            <span className="truncate">{lead.website?.replace(/^https?:\/\//, '')}</span>
                          </a>
                        )}

                        <div className="text-[10px] text-zinc-400 mt-1 truncate">
                          {lead.techStackDetected || 'Standard Stack'}
                        </div>
                      </td>

                      {/* Google Rating */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-amber-400 text-sm">{lead.rating || 4.8}★</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">
                          {lead.reviewCount || 60} Google reviews
                        </span>
                      </td>

                      {/* AI Diagnostic & Monthly Bleed */}
                      <td className="py-3.5 px-3 max-w-[240px]">
                        <div className="font-semibold text-zinc-200 truncate">
                          {lead.painPoint || 'High OTA Commission Reliance'}
                        </div>
                        <div className="text-[11px] text-rose-400 font-medium mt-0.5 flex items-center gap-1">
                          <TrendingDown className="w-3 h-3" />
                          <span className="truncate">{lead.estimatedLoss || '~$18,000/mo in fees'}</span>
                        </div>
                      </td>

                      {/* Opportunity / Priority */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                            isHighPriority
                              ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}>
                            {isHighPriority && <Flame className="w-3 h-3 text-amber-400" />}
                            {lead.priority}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-400">
                            {lead.opportunityScore} pts
                          </span>
                        </div>
                      </td>

                      {/* Pipeline Status dropdown */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => onUpdateStatus(lead.id, e.target.value as LeadStatus)}
                          className="px-2.5 py-1 rounded-lg bg-[#0B0B0D] border border-zinc-800 text-xs font-semibold text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
                        >
                          <option value="NEW">New</option>
                          <option value="QUALIFIED">Qualified</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="NEGOTIATING">Negotiating</option>
                          <option value="CLOSED">Closed (Won)</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Quick WhatsApp */}
                          {lead.phone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(lead.pitchWhatsApp || lead.generatedPitch || '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onUpdateStatus(lead.id, 'CONTACTED')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                              title="1-Click WhatsApp Direct Chat"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Quick Copy Script */}
                          <button
                            type="button"
                            onClick={(e) => handleQuickCopyWhatsApp(e, lead)}
                            className="p-1.5 rounded-lg bg-[#0B0B0D] hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                            title="Quick Copy WhatsApp Pitch Script"
                          >
                            {copiedId === lead.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Open Outreach Modal */}
                          <button
                            type="button"
                            onClick={() => onOpenOutreach(lead)}
                            className="px-2.5 py-1 rounded-lg bg-[#0B0B0D] hover:bg-amber-400/10 hover:border-amber-400/30 text-amber-400 border border-zinc-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                            title="Generate Custom AI Pitch"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Pitch</span>
                          </button>

                          {/* Delete Lead */}
                          <button
                            type="button"
                            onClick={() => onDeleteLead(lead.id)}
                            className="p-1.5 rounded-lg bg-[#0B0B0D] hover:bg-rose-500/10 hover:border-rose-500/30 text-zinc-500 hover:text-rose-400 border border-zinc-800 transition-all cursor-pointer"
                            title="Remove lead from pipeline"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
