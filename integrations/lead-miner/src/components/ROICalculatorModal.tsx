import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Percent, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Building
} from 'lucide-react';

interface ROICalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ROICalculatorModal: React.FC<ROICalculatorModalProps> = ({ isOpen, onClose }) => {
  const [keys, setKeys] = useState(16);
  const [adr, setAdr] = useState(650);
  const [occupancy, setOccupancy] = useState(72);
  const [otaShare, setOtaShare] = useState(65);
  const [commissionRate, setCommissionRate] = useState(18);

  if (!isOpen) return null;

  // Financial calculations
  const totalNightsAvailable = keys * 365;
  const occupiedNights = totalNightsAvailable * (occupancy / 100);
  const grossAnnualRevenue = occupiedNights * adr;
  const otaBookedRevenue = grossAnnualRevenue * (otaShare / 100);
  const annualOtaCommission = otaBookedRevenue * (commissionRate / 100);
  const monthlyOtaBleed = annualOtaCommission / 12;

  // Direct Booking Shift calculation (e.g. capturing 40% of OTA bookings directly)
  const recoverableShare = 0.40;
  const annualSavingsRecovered = annualOtaCommission * recoverableShare;
  const estimatedAgencyFee = 25000;
  const paybackMonths = Math.max(0.5, (estimatedAgencyFee / (annualSavingsRecovered / 12))).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#111114] border border-zinc-800/90 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between bg-[#0B0B0D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Hospitality Direct Booking ROI Calculator
              </h3>
              <p className="text-xs text-zinc-400">
                Interactive OTA commission loss & direct revenue recovery model
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders & Output */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Output Highlight Banners */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-rose-950/40 via-[#0E0E12] to-[#0E0E12] border border-rose-500/30">
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                Current Monthly OTA Bleed
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-rose-400 mt-1">
                ${Math.round(monthlyOtaBleed).toLocaleString()}
                <span className="text-xs font-normal text-rose-300">/mo</span>
              </div>
              <p className="text-[11px] text-rose-300/80 mt-1">
                ${Math.round(annualOtaCommission).toLocaleString()} lost per year to Booking.com / OTAs
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-950/40 via-[#0E0E12] to-[#0E0E12] border border-emerald-500/30">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                Annual Direct Revenue Recoverable
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                +${Math.round(annualSavingsRecovered).toLocaleString()}
                <span className="text-xs font-normal text-emerald-300">/yr</span>
              </div>
              <p className="text-[11px] text-emerald-300/80 mt-1">
                Agency custom Next.js system ROI: Payback in ~{paybackMonths} months
              </p>
            </div>
          </div>

          {/* Interactive Property Sliders */}
          <div className="space-y-4 bg-[#0B0B0D] p-4 rounded-xl border border-zinc-800">
            {/* Keys / Suites */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-medium">Number of Rooms / Villas (Keys):</span>
                <span className="font-bold text-amber-400">{keys} Keys</span>
              </div>
              <input
                type="range"
                min="4"
                max="60"
                value={keys}
                onChange={(e) => setKeys(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* ADR */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-medium">Average Daily Rate (ADR):</span>
                <span className="font-bold text-amber-400">${adr} USD / night</span>
              </div>
              <input
                type="range"
                min="250"
                max="2000"
                step="25"
                value={adr}
                onChange={(e) => setAdr(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Occupancy */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-medium">Annual Average Occupancy:</span>
                <span className="font-bold text-amber-400">{occupancy}%</span>
              </div>
              <input
                type="range"
                min="35"
                max="95"
                value={occupancy}
                onChange={(e) => setOccupancy(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* OTA Reliance */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-medium">OTA Bookings Share (Booking.com / Airbnb / Expedia):</span>
                <span className="font-bold text-rose-400">{otaShare}%</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                value={otaShare}
                onChange={(e) => setOtaShare(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>

            {/* OTA Commission % */}
            <div>
              <div className="flex justify-between text-xs text-zinc-300 mb-1.5">
                <span className="font-medium">OTA Commission Fee Rate:</span>
                <span className="font-bold text-rose-400">{commissionRate}%</span>
              </div>
              <input
                type="range"
                min="15"
                max="25"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value))}
                className="w-full accent-rose-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Revenue Breakdown Table */}
          <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Gross Property Room Revenue:</span>
              <span className="font-semibold text-white">${Math.round(grossAnnualRevenue).toLocaleString()} /yr</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Revenue booked through OTAs ({otaShare}%):</span>
              <span className="font-semibold text-rose-300">${Math.round(otaBookedRevenue).toLocaleString()} /yr</span>
            </div>
            <div className="flex justify-between text-zinc-400 pt-2 border-t border-zinc-800">
              <span>Direct Booking Transition ROI (First Year):</span>
              <span className="font-bold text-emerald-400">+${Math.round(annualSavingsRecovered - estimatedAgencyFee).toLocaleString()} Net Gain</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#0B0B0D] flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Use these live metrics directly in your client pitch deck or outreach scripts.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            Apply to Outreach
          </button>
        </div>
      </div>
    </div>
  );
};
