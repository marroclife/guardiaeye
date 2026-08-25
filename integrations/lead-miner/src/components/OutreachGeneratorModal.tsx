import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Mail, 
  Phone, 
  Linkedin, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Send,
  Flame,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Lead } from '../types';

interface OutreachGeneratorModalProps {
  lead: Lead | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: any) => void;
}

export const OutreachGeneratorModal: React.FC<OutreachGeneratorModalProps> = ({
  lead,
  onClose,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'email' | 'phone' | 'linkedin'>('whatsapp');
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('consultative');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customWhatsApp, setCustomWhatsApp] = useState('');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');

  // Sync initial content from lead
  React.useEffect(() => {
    if (lead) {
      setCustomWhatsApp(lead.pitchWhatsApp || lead.generatedPitch || '');
      
      if (lead.pitchEmail) {
        const parts = lead.pitchEmail.split('\n\n');
        setCustomEmailSubject(parts[0] || `Direct booking margin recovery for ${lead.name}`);
        setCustomEmailBody(parts.slice(1).join('\n\n') || lead.pitchEmail);
      } else {
        setCustomEmailSubject(`Direct booking revenue upgrade for ${lead.name}`);
        setCustomEmailBody(`Hi ${lead.name} Management,\n\nWe noticed your property has a stellar ${lead.rating}★ rating, but you are losing 18-22% in OTA commissions.`);
      }
    }
  }, [lead]);

  if (!lead) return null;

  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const whatsAppUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customWhatsApp)}`
    : `https://wa.me/?text=${encodeURIComponent(customWhatsApp)}`;

  const emailMailto = `mailto:?subject=${encodeURIComponent(customEmailSubject)}&body=${encodeURIComponent(customEmailBody)}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendAndMarkContacted = () => {
    onUpdateStatus(lead.id, 'CONTACTED');
  };

  const handleRegeneratePitch = async () => {
    setIsRegenerating(true);
    try {
      const response = await fetch(`/api/leads/${lead.id}/pitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tone, channel: activeTab }),
      });
      const data = await response.json();
      if (data.success && data.outreach) {
        setCustomWhatsApp(data.outreach.whatsApp);
        setCustomEmailSubject(data.outreach.coldEmailSubject);
        setCustomEmailBody(data.outreach.coldEmailBody);
      }
    } catch (err) {
      console.error('Error re-generating pitch:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-[#111114] border border-zinc-800/90 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-zinc-800/80 flex items-start justify-between bg-[#0B0B0D]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Gemini 3.7 Flash Outreach Engine
              </span>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-400">{lead.location}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Outreach Campaign: {lead.name}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone & Channel Selector Bar */}
        <div className="px-5 py-3 border-b border-zinc-800/80 bg-[#0B0B0D] flex flex-wrap items-center justify-between gap-3">
          {/* Channels */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#141418] border border-zinc-800">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'whatsapp'
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              WhatsApp / SMS
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Cold Email
            </button>

            <button
              onClick={() => setActiveTab('phone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'phone'
                  ? 'bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              30s Phone Pitch
            </button>

            <button
              onClick={() => setActiveTab('linkedin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'linkedin'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Linkedin className="w-3.5 h-3.5" />
              LinkedIn DM
            </button>
          </div>

          {/* Tone Selector & Re-generate */}
          <div className="flex items-center gap-2">
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-[#141418] border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:border-amber-400 cursor-pointer"
            >
              <option value="consultative">Tone: Consultative ROI</option>
              <option value="direct_financial">Tone: Direct Commission Bleed</option>
              <option value="technical">Tone: Next.js Performance & Speed</option>
              <option value="vip_luxury">Tone: Luxury Guest Experience</option>
            </select>

            <button
              onClick={handleRegeneratePitch}
              disabled={isRegenerating}
              className="p-1.5 rounded-lg bg-[#141418] hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-all cursor-pointer disabled:opacity-50"
              title="Regenerate copy with AI"
            >
              <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {/* WhatsApp View */}
          {activeTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Target Phone: <strong className="text-white">{lead.phone || 'Phone not listed'}</strong></span>
                <span className="text-emerald-400 font-medium">Ready for instant WhatsApp 1-click send</span>
              </div>

              <div className="relative">
                <textarea
                  rows={8}
                  value={customWhatsApp}
                  onChange={(e) => setCustomWhatsApp(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs sm:text-sm text-zinc-200 font-sans focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-y"
                  placeholder="WhatsApp message script..."
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between">
                <span>💡 Tip: WhatsApp outreach converts at 42%+ for hospitality GMs & Villa Managers in Latin America and Europe.</span>
              </div>
            </div>
          )}

          {/* Cold Email View */}
          {activeTab === 'email' && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Subject Line</label>
                <input
                  type="text"
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs sm:text-sm text-white font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 block mb-1 font-semibold">Email Body</label>
                <textarea
                  rows={10}
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  className="w-full p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-xs sm:text-sm text-zinc-200 font-sans focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y"
                />
              </div>
            </div>
          )}

          {/* 30s Phone Script */}
          {activeTab === 'phone' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Phone: <strong className="text-white">{lead.phone || 'N/A'}</strong></span>
                <span className="text-amber-400">Cold Call / Front Desk Gatekeeper Hook</span>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                {lead.pitchPhone || `“Hi, is this the General Manager or Owner of ${lead.name}? My name is [Your Name] — we analyzed luxury properties in ${lead.location} and noticed you're losing ~$20k/mo to OTA commissions. We built a custom Next.js booking engine demo for you.”`}
              </div>
            </div>
          )}

          {/* LinkedIn DM */}
          {activeTab === 'linkedin' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400">
                Executive DM for General Manager / Managing Director on LinkedIn:
              </div>

              <div className="p-4 rounded-xl bg-[#0B0B0D] border border-zinc-800 text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap">
                {lead.pitchLinkedIn || `Hi! Impressed by the ${lead.rating}★ reputation for ${lead.name} in ${lead.location}. We help luxury operators capture 100% direct bookings without paying 18% OTA commissions. Open to a 2-page revenue recovery report?`}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-800/80 bg-[#0B0B0D] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text = activeTab === 'whatsapp' ? customWhatsApp : activeTab === 'email' ? `${customEmailSubject}\n\n${customEmailBody}` : activeTab === 'phone' ? (lead.pitchPhone || '') : (lead.pitchLinkedIn || '');
                handleCopy(text);
              }}
              className="px-4 py-2 rounded-xl bg-[#141418] hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'whatsapp' && (
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleSendAndMarkContacted}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Open in WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
              </a>
            )}

            {activeTab === 'email' && (
              <a
                href={emailMailto}
                onClick={handleSendAndMarkContacted}
                className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>Open in Email App</span>
              </a>
            )}

            <button
              onClick={() => {
                onUpdateStatus(lead.id, 'CONTACTED');
                onClose();
              }}
              className="px-3 py-2 rounded-xl bg-[#141418] hover:bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-800 transition-all cursor-pointer"
            >
              Mark as Contacted
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
