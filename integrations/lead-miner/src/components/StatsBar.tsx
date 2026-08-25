import React from 'react';
import { 
  Building, 
  Flame, 
  TrendingUp, 
  CheckCircle, 
  MessageSquare, 
  DollarSign, 
  Award,
  ShieldAlert
} from 'lucide-react';
import { LeadStats } from '../types';

interface StatsBarProps {
  stats: LeadStats;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Total Scanned */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Total Prospects</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Building className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stats.totalLeads}</span>
          <span className="text-xs text-emerald-400 font-medium">Active in DB</span>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">Boutique hotels & luxury villas</p>
      </div>

      {/* Hot Targets (High Opportunity) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/25 via-[#111114] to-[#111114] border border-amber-500/30 relative overflow-hidden group hover:border-amber-500/50 transition-all shadow-lg shadow-amber-950/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-300">Hot Leads (High ROI)</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight">{stats.hotLeads}</span>
          <span className="text-xs px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 border border-amber-400/20 font-semibold">
            {stats.totalLeads > 0 ? `${Math.round((stats.hotLeads / stats.totalLeads) * 100)}%` : '0%'}
          </span>
        </div>
        <p className="text-[11px] text-amber-300/70 mt-1">OTA-dependent / Missing website</p>
      </div>

      {/* Monthly Commission Bleed */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-rose-950/25 via-[#111114] to-[#111114] border border-rose-500/30 relative overflow-hidden group hover:border-rose-500/50 transition-all shadow-lg shadow-rose-950/10">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-rose-300">Total OTA Commission Bleed</span>
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-rose-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-rose-400 tracking-tight">
            ${(stats.totalEstimatedLoss / 1000).toFixed(0)}k<span className="text-xs font-normal text-rose-400/80">/mo</span>
          </span>
          <span className="text-xs text-rose-300/90 font-medium">18-22% Fee</span>
        </div>
        <p className="text-[11px] text-rose-300/70 mt-1">Monthly addressable pitch value</p>
      </div>

      {/* Pipeline Status */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111114] border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700 transition-all shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-zinc-400">Outreach Pipeline</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-3">
          <div>
            <span className="text-xl sm:text-2xl font-bold text-white">{stats.contactedCount + stats.negotiatingCount}</span>
            <span className="text-[11px] text-zinc-400 ml-1">In Outreach</span>
          </div>
          <div className="h-4 w-px bg-zinc-800"></div>
          <div>
            <span className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.closedWonCount}</span>
            <span className="text-[11px] text-zinc-400 ml-1">Won</span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-500 mt-1">Avg Google Rating: {stats.avgRating} ★</p>
      </div>
    </div>
  );
};
