/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { ProspectingControls } from './components/ProspectingControls';
import { LeadsTable } from './components/LeadsTable';
import { LeadDiagnosticModal } from './components/LeadDiagnosticModal';
import { OutreachGeneratorModal } from './components/OutreachGeneratorModal';
import { ROICalculatorModal } from './components/ROICalculatorModal';
import { Lead, LeadStats, LeadStatus, PriorityLevel } from './types';
import { Sparkles, CheckCircle2, AlertCircle, Upload } from 'lucide-react';

export default function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    hotLeads: 0,
    qualifiedCount: 0,
    contactedCount: 0,
    negotiatingCount: 0,
    closedWonCount: 0,
    totalEstimatedLoss: 0,
    avgRating: 4.8,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [outreachLead, setOutreachLead] = useState<Lead | null>(null);
  const [isROIOpen, setIsROIOpen] = useState(false);
  const [isRequalifying, setIsRequalifying] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load initial data
  const loadLeads = async () => {
    try {
      const [leadsRes, statsRes] = await Promise.all([
        fetch('/api/leads'),
        fetch('/api/leads/stats'),
      ]);

      const leadsData = await leadsRes.json();
      const statsData = await statsRes.json();

      if (leadsData.success && Array.isArray(leadsData.leads)) {
        setLeads(leadsData.leads);
      }
      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  // Handle Prospecting Search & AI Pipeline
  const handleSearch = async (params: {
    query: string;
    location: string;
    radiusKm: number;
    lat?: number;
    lng?: number;
    filterMissingWebsiteOnly: boolean;
  }) => {
    setIsScanning(true);
    try {
      const response = await fetch('/api/leads/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await response.json();
      if (data.success) {
        if (data.allLeads) {
          setLeads(data.allLeads);
        } else if (data.leads) {
          setLeads((prev) => [...data.leads, ...prev]);
        }
        if (data.stats) {
          setStats(data.stats);
        }
        showToast(`Scan complete: ${data.count || 0} luxury prospects qualified with Gemini 2.5 Flash!`);
      } else {
        showToast(`Error: ${data.error || 'Failed to scan leads'}`);
      }
    } catch (err) {
      console.error('Error searching leads:', err);
      showToast('Network error while running prospecting pipeline.');
    } finally {
      setIsScanning(false);
    }
  };

  // Update Status
  const handleUpdateStatus = async (id: string, status: LeadStatus) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
        if (data.stats) setStats(data.stats);
        showToast(`Lead status updated to ${status}`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Update Priority
  const handleUpdatePriority = async (id: string, priority: PriorityLevel) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority }),
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === id ? data.lead : l)));
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error updating priority:', err);
    }
  };

  // Delete Lead
  const handleDeleteLead = async (id: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        if (data.stats) setStats(data.stats);
        showToast('Lead removed from pipeline.');
      }
    } catch (err) {
      console.error('Error deleting lead:', err);
    }
  };

  // Re-qualify with AI
  const handleReQualify = async (lead: Lead) => {
    setIsRequalifying(true);
    try {
      const res = await fetch(`/api/leads/${lead.id}/qualify`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => prev.map((l) => (l.id === lead.id ? data.lead : l)));
        setSelectedLead(data.lead);
        showToast('Gemini 2.5 Flash diagnostic refreshed!');
      }
    } catch (err) {
      console.error('Error requalifying lead:', err);
    } finally {
      setIsRequalifying(false);
    }
  };

  // Reset demo seeds
  const handleResetSeeds = async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/leads/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads || []);
        if (data.stats) setStats(data.stats);
        showToast('Reset pipeline to curated luxury hospitality hubs.');
      }
    } catch (err) {
      console.error('Error resetting seeds:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Selection handlers
  const toggleLeadSelection = (id: string) => {
    setSelectedLeadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (ids: string[]) => {
    setSelectedLeadIds((prev) => {
      const allSelected = ids.length > 0 && ids.every((id) => prev.has(id));
      if (allSelected) {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }
      return new Set([...prev, ...ids]);
    });
  };

  const clearSelection = () => setSelectedLeadIds(new Set());

  // Export selected leads to NEXO's Eye CRM
  const handleExportToNexus = async () => {
    if (selectedLeadIds.size === 0) {
      showToast('Selecione pelo menos um lead para enviar ao Nexus.');
      return;
    }

    setIsExporting(true);
    try {
      const response = await fetch('/api/leads/export-to-nexus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadIds: Array.from(selectedLeadIds) }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(`${data.exported} lead(s) enviado(s) para triagem no Nexus AI.`);
        clearSelection();
      } else {
        showToast(`Erro no envio: ${data.error || 'Falha ao exportar'}`);
      }
    } catch (err) {
      console.error('Error exporting to Nexus:', err);
      showToast('Erro de rede ao enviar leads para o Nexus.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (leads.length === 0) {
      showToast('No leads available to export.');
      return;
    }

    const headers = [
      'Name',
      'Category',
      'Location',
      'Address',
      'Rating',
      'ReviewCount',
      'Phone',
      'Website',
      'Priority',
      'Status',
      'OpportunityScore',
      'PainPoint',
      'EstimatedLoss',
      'TechStack',
      'WhatsAppPitch',
      'EmailPitch',
    ];

    const csvRows = leads.map((lead) => [
      `"${(lead.name || '').replace(/"/g, '""')}"`,
      `"${(lead.category || '').replace(/"/g, '""')}"`,
      `"${(lead.location || '').replace(/"/g, '""')}"`,
      `"${(lead.address || '').replace(/"/g, '""')}"`,
      lead.rating || '',
      lead.reviewCount || '',
      `"${(lead.phone || '').replace(/"/g, '""')}"`,
      `"${(lead.website || '').replace(/"/g, '""')}"`,
      lead.priority,
      lead.status,
      lead.opportunityScore,
      `"${(lead.painPoint || '').replace(/"/g, '""')}"`,
      `"${(lead.estimatedLoss || '').replace(/"/g, '""')}"`,
      `"${(lead.techStackDetected || '').replace(/"/g, '""')}"`,
      `"${(lead.pitchWhatsApp || lead.generatedPitch || '').replace(/"/g, '""')}"`,
      `"${(lead.pitchEmail || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LuxuryLead_Prospects_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded!');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        stats={stats}
        onOpenROI={() => setIsROIOpen(true)}
        onExportCSV={handleExportCSV}
        onResetSeeds={handleResetSeeds}
        isScanning={isScanning}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Summary Bar */}
        <StatsBar stats={stats} />

        {/* Prospecting Search & Discovery Module */}
        <ProspectingControls
          onSearch={handleSearch}
          isScanning={isScanning}
        />

        {/* Qualified Leads Table / Pipeline / Map */}
        <LeadsTable
          leads={leads}
          selectedIds={selectedLeadIds}
          onToggleSelection={toggleLeadSelection}
          onToggleSelectAll={toggleSelectAll}
          onSelectLead={(lead) => setSelectedLead(lead)}
          onOpenOutreach={(lead) => setOutreachLead(lead)}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePriority={handleUpdatePriority}
          onDeleteLead={handleDeleteLead}
        />

        {/* Bulk Export Bar */}
        {selectedLeadIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-5 py-3 rounded-2xl bg-[#16161A] border border-amber-400/30 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
            <span className="text-sm font-semibold text-zinc-200">
              {selectedLeadIds.size} lead(s) selecionado(s)
            </span>
            <button
              type="button"
              onClick={handleExportToNexus}
              disabled={isExporting}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:bg-zinc-700 text-black text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {isExporting ? 'Enviando...' : 'Enviar para Nexus AI'}
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#08080A] py-6 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-300">LuxuryLead AI</span>
            <span>•</span>
            <span className="text-zinc-400">Hospitality Lead Prospecting & Direct Booking Engine</span>
          </div>
          <div className="text-[11px] text-zinc-500">
            Powered by Google Places API (New) & Google GenAI SDK (Gemini 2.5 Flash)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LeadDiagnosticModal
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
        onOpenOutreach={(lead) => setOutreachLead(lead)}
        onReQualify={handleReQualify}
        isRequalifying={isRequalifying}
      />

      <OutreachGeneratorModal
        lead={outreachLead}
        onClose={() => setOutreachLead(null)}
        onUpdateStatus={handleUpdateStatus}
      />

      <ROICalculatorModal
        isOpen={isROIOpen}
        onClose={() => setIsROIOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-[#16161A] border border-zinc-800 text-zinc-200 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
