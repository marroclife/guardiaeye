import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Compass, 
  Globe2, 
  Filter, 
  Check, 
  ChevronDown,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { HubPreset } from '../types';
import { LUXURY_HUBS } from '../lib/google-places';

interface ProspectingControlsProps {
  onSearch: (params: {
    query: string;
    location: string;
    radiusKm: number;
    lat?: number;
    lng?: number;
    filterMissingWebsiteOnly: boolean;
  }) => void;
  isScanning: boolean;
}

export const ProspectingControls: React.FC<ProspectingControlsProps> = ({
  onSearch,
  isScanning,
}) => {
  const [selectedHub, setSelectedHub] = useState<HubPreset>(LUXURY_HUBS[0]);
  const [query, setQuery] = useState(LUXURY_HUBS[0].defaultQuery);
  const [customLocation, setCustomLocation] = useState(LUXURY_HUBS[0].name);
  const [radiusKm, setRadiusKm] = useState(25);
  const [filterMissingWebsiteOnly, setFilterMissingWebsiteOnly] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleHubSelect = (hub: HubPreset) => {
    setSelectedHub(hub);
    setQuery(hub.defaultQuery);
    setCustomLocation(hub.name);
  };

  const handleExecuteSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      query,
      location: customLocation,
      radiusKm,
      lat: selectedHub.coords.lat,
      lng: selectedHub.coords.lng,
      filterMissingWebsiteOnly,
    });
  };

  return (
    <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-4 sm:p-6 mb-6 shadow-xl relative overflow-hidden">
      {/* Background Accent glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              Luxury Market Prospecting Engine
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/20">
              Google Places API + AI
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Scan high-ADR luxury hubs, auto-detect OTA commission bleed, and generate custom direct booking pitches.
          </p>
        </div>

        {/* Selected Hub Summary Pill */}
        <div className="flex items-center gap-2 self-start lg:self-center px-3 py-1.5 rounded-xl bg-[#0D0D10] border border-zinc-800 text-xs text-zinc-300">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white">{selectedHub.name}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400/90 font-medium">Avg ADR: ~${selectedHub.avgADR}/nt</span>
        </div>
      </div>

      {/* Hub Presets Carousel */}
      <div className="mb-5">
        <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
          High-Dollar Tourism Hub Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {LUXURY_HUBS.map((hub) => {
            const isSelected = selectedHub.id === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleHubSelect(hub)}
                className={`p-2.5 rounded-xl text-left transition-all border text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400/10 border-amber-400/50 text-white shadow-md shadow-amber-400/5 ring-1 ring-amber-400/30'
                    : 'bg-[#0B0B0D] border-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold truncate">{hub.name.split(',')[0]}</div>
                <div className="text-[10px] text-zinc-500 truncate">{hub.country}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Formulation Form */}
      <form onSubmit={handleExecuteSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Query input */}
          <div className="md:col-span-6">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Prospecting Target / Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-prospect-query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Boutique Hotel, Luxury Villa Estate, Eco Resort"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Location input */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5">
              Destination / Coordinates
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-prospect-location"
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="e.g., Tulum, Quintana Roo"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Scan Action Button */}
          <div className="md:col-span-2 flex items-end">
            <button
              id="btn-scan-prospects"
              type="submit"
              disabled={isScanning}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-black" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Run Scan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Filter Badges & Quick Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMissingWebsiteOnly(!filterMissingWebsiteOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                filterMissingWebsiteOnly
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  : 'bg-[#0B0B0D] border-zinc-800 text-zinc-400 hover:text-zinc-300'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${filterMissingWebsiteOnly ? 'text-rose-400' : 'text-zinc-500'}`} />
              <span>Prioritize Missing Website / OTA Only</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="px-3 py-1.5 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-zinc-400 hover:text-zinc-300 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-500" />
              <span>Radius: {radiusKm} km</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </button>
          </div>

          <div className="text-[11px] text-zinc-500">
            Powered by Google Places API (New) & Gemini 2.5 Flash
          </div>
        </div>

        {/* Advanced Slider drawer */}
        {showAdvanced && (
          <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Search Radius</span>
                <span className="font-semibold text-white">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
            <div className="flex items-center text-xs text-zinc-400">
              High-ticket luxury clusters are dense; a 25km radius captures premier coastal and mountain luxury zones.
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
