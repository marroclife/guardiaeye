import React from 'react';
import { 
  Building2, 
  Sparkles, 
  MapPin, 
  Calculator, 
  Download, 
  RefreshCw, 
  Flame, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { LeadStats } from '../types';

interface NavbarProps {
  stats: LeadStats;
  onOpenROI: () => void;
  onExportCSV: () => void;
  onResetSeeds: () => void;
  isScanning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onOpenROI,
  onExportCSV,
  onResetSeeds,
  isScanning,
}) => {
  return (
    <header className="border-b border-zinc-800/80 bg-[#0A0A0B]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-1 ring-amber-300/30">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white tracking-tight font-serif sm:font-sans">LuxuryLead</span>
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-amber-400/10 text-amber-400 rounded-full border border-amber-400/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Gemini 2.5 Flash
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                High-Ticket Hospitality Prospecting & Direct Booking Engine
              </p>
            </div>
          </div>

          {/* Center Pipeline Stats pill */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-1.5 rounded-full bg-[#121215] border border-zinc-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-zinc-400">Total Leads:</span>
              <span className="font-semibold text-white">{stats.totalLeads}</span>
            </div>
            <div className="h-3 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-zinc-400">Hot Targets:</span>
              <span className="font-semibold text-amber-400">{stats.hotLeads}</span>
            </div>
            <div className="h-3 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-400">Monthly Commission Bleed:</span>
              <span className="font-semibold text-rose-400">
                ${(stats.totalEstimatedLoss / 1000).toFixed(0)}k/mo
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-roi-calc"
              onClick={onOpenROI}
              className="px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Hospitality Direct Booking ROI Calculator"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">ROI Calculator</span>
            </button>

            <button
              id="btn-export-csv"
              onClick={onExportCSV}
              className="px-3 py-1.5 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-300 hover:text-white text-xs font-medium border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Export leads to CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            <button
              id="btn-reset-seeds"
              onClick={onResetSeeds}
              disabled={isScanning}
              className="p-2 rounded-xl bg-[#141418] hover:bg-[#1C1C22] text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              title="Reset to Curated Hub Seeds"
            >
              <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
