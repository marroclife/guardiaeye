import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Flame, 
  DollarSign, 
  ExternalLink, 
  Phone, 
  MapPin, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  TrendingDown, 
  Send,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';
import { Lead } from '../types';

interface LeadDiagnosticModalProps {
  lead: Lead | null;
  onClose: () => void;
  onOpenOutreach: (lead: Lead) => void;
  onReQualify: (lead: Lead) => void;
  isRequalifying: boolean;
}

export const LeadDiagnosticModal: React.FC<LeadDiagnosticModalProps> = ({
  lead,
  onClose,
  onOpenOutreach,
  onReQualify,
  isRequalifying,
}) => {
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const isHighPriority = lead.priority === 'HIGH';
  const isMissingWebsite = !lead.website || lead.website.trim() === '';
  const isOtaRedirect = /booking\.com|airbnb\.com|expedia\.com|vrbo\.com|hotels\.com/i.test(lead.website || '');
  const isSocial = /instagram\.com|facebook\.com/i.test(lead.website || '');

  const handleCopyNotes = () => {
    const text = `PROPERTY AUDIT: ${lead.name}\nLocation: ${lead.location}\nRating: ${lead.rating}★ (${lead.reviewCount} reviews)\nPain Point: ${lead.painPoint}\nEstimated Loss: ${lead.estimatedLoss}\nTech Stack: ${lead.techStackDetected}\nNotes: ${lead.diagnosticNotes}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#111114] border border-zinc-800/90 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between bg-[#0B0B0D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                isHighPriority ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-blue-400'
              }`}>
                {isHighPriority && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                {lead.priority} PRIORITY OPPORTUNITY
              </span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs font-semibold text-emerald-400">Score: {lead.opportunityScore}/100</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">{lead.name}</h3>
            <p className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-zinc-500" />
              {lead.address || lead.location}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Key Metrics Strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#0B0B0D] border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block">Google Rating</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-amber-400">{lead.rating || 4.8}★</span>
                <span className="text-xs text-zinc-500">({lead.reviewCount || 60})</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0B0D] border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block">Category</span>
              <span className="text-sm font-semibold text-white mt-0.5 block truncate">{lead.category}</span>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0B0D] border border-zinc-800/80">
              <span className="text-[11px] text-zinc-400 block">Current Web Channel</span>
              <span className="text-xs font-semibold mt-0.5 block truncate text-rose-400">
                {isMissingWebsite ? 'No Website' : isOtaRedirect ? 'OTA Redirect' : isSocial ? 'Instagram Only' : 'Custom Web'}
              </span>
            </div>
          </div>

          {/* Core AI Diagnostic Loss Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/30 via-[#0E0E12] to-[#0E0E12] border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
              <TrendingDown className="w-4 h-4" />
              Identified Revenue Bleed & Main Pain Point
            </div>
            <div className="text-base font-semibold text-white mb-1.5">
              {lead.painPoint || 'High OTA Commission Reliance'}
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center justify-between">
              <span>Estimated Commission Bleed:</span>
              <span className="font-bold text-sm text-rose-200">{lead.estimatedLoss || '~$18,000 - $35,000/month'}</span>
            </div>
          </div>

          {/* Tech Stack Audit */}
          <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800">
            <div className="flex items-center gap-2 text-zinc-400 font-semibold text-xs uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Current Architecture & Digital Stack
            </div>
            <p className="text-xs text-zinc-300">
              {lead.techStackDetected || 'No direct Next.js checkout platform detected.'}
            </p>

            {lead.website && (
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400">Website URL:</span>
                <a
                  href={lead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:underline flex items-center gap-1 font-mono truncate max-w-xs"
                >
                  {lead.website}
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>

          {/* Diagnostic Notes */}
          {lead.diagnosticNotes && (
            <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Gemini 2.5 Flash Strategic Assessment
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed">{lead.diagnosticNotes}</p>
            </div>
          )}

          {/* Internal Custom Notes */}
          {lead.customNotes && (
            <div className="text-xs text-zinc-400 bg-[#0B0B0D] p-3 rounded-lg border border-zinc-800">
              <span className="font-semibold text-zinc-300">Internal Prospect Note:</span> {lead.customNotes}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#0B0B0D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNotes}
              className="px-3 py-2 rounded-xl bg-[#141418] hover:bg-[#1E1E24] text-zinc-300 text-xs font-medium border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Audit Copied!' : 'Copy Audit'}</span>
            </button>

            <button
              onClick={() => onReQualify(lead)}
              disabled={isRequalifying}
              className="px-3 py-2 rounded-xl bg-[#141418] hover:bg-[#1E1E24] text-zinc-300 text-xs font-medium border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 text-amber-400 ${isRequalifying ? 'animate-spin' : ''}`} />
              <span>Re-run AI Diagnosis</span>
            </button>
          </div>

          <button
            id="btn-open-outreach-modal"
            onClick={() => {
              onClose();
              onOpenOutreach(lead);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            <span>Generate Outreach Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
