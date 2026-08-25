import React from 'react';
import { Lead } from '../types';
import { MapPin, Flame, ExternalLink, MessageSquare, Sparkles } from 'lucide-react';

interface InteractiveMapProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenOutreach: (lead: Lead) => void;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  leads,
  onSelectLead,
  onOpenOutreach,
}) => {
  return (
    <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" />
            Geographic Opportunity Map & Property Pins
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Spatial distribution of luxury boutique hotels and villa estates across key international corridors.
          </p>
        </div>
        <span className="text-xs text-zinc-300 font-semibold px-3 py-1 rounded-full bg-[#0B0B0D] border border-zinc-800">
          {leads.length} Properties Mapped
        </span>
      </div>

      {/* Styled Grid of Geocoded Property Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leads.map((lead) => {
          const isHighPriority = lead.priority === 'HIGH';
          const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');

          return (
            <div
              key={lead.id}
              onClick={() => onSelectLead(lead)}
              className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 hover:border-amber-400/40 transition-all cursor-pointer group shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                    isHighPriority ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isHighPriority && <Flame className="w-3 h-3 text-amber-400" />}
                    {lead.priority} PRIORITY
                  </span>
                  <span className="text-xs font-bold text-amber-400">{lead.rating}★ ({lead.reviewCount})</span>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                  {lead.name}
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{lead.address || lead.location}</p>

                <div className="mt-3 p-2.5 rounded-lg bg-rose-500/5 border border-rose-500/10 text-rose-300 text-xs">
                  <div className="font-semibold text-rose-400 line-clamp-1">{lead.painPoint}</div>
                  <div className="text-[11px] text-rose-300/80 mt-0.5">{lead.estimatedLoss}</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                {lead.mapsUrl ? (
                  <a
                    href={lead.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-zinc-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : <span />}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenOutreach(lead);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#141418] hover:bg-[#1E1E24] text-zinc-200 text-xs font-medium border border-zinc-800 flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Outreach</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
