import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { searchGooglePlaces, LUXURY_HUBS } from './src/lib/google-places';
import { qualifyLeadWithGemini } from './src/lib/gemini-qualifier';
import { leadDb } from './src/lib/db';
import { exportLeadsToNexus } from './src/lib/nexus-bridge';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      hasMapsKey: !!(process.env.GOOGLE_MAPS_API_KEY && process.env.GOOGLE_MAPS_API_KEY !== 'MY_GOOGLE_MAPS_API_KEY'),
    });
  });

  // Health check for Nexus bridge
  app.get('/api/nexus/health', async (req, res) => {
    try {
      const hasUrl = !!(process.env.NEXUS_SUPABASE_URL);
      const hasKey = !!(process.env.NEXUS_SUPABASE_SERVICE_KEY);
      res.json({
        success: true,
        connected: hasUrl && hasKey,
        hasUrl,
        hasKey,
        note: hasKey ? 'Configuração de conexão presente.' : 'NEXUS_SUPABASE_SERVICE_KEY não configurada.',
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Export selected leads to NEXO's Eye CRM
  app.post('/api/leads/export-to-nexus', async (req, res) => {
    try {
      const { leadIds } = req.body;

      if (!Array.isArray(leadIds) || leadIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Forneça um array de leadIds para exportar.',
        });
      }

      const leadsToExport = leadIds
        .map((id) => leadDb.getById(id))
        .filter(Boolean);

      if (leadsToExport.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nenhum lead encontrado com os IDs fornecidos.',
        });
      }

      const result = await exportLeadsToNexus(leadsToExport);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.errors.join('; '),
          exported: result.exported,
          skipped: result.skipped,
        });
      }

      res.json({
        success: true,
        exported: result.exported,
        skipped: result.skipped,
        insertedIds: result.insertedIds,
        message: `${result.exported} lead(s) enviado(s) para triagem no Nexus AI.`,
      });
    } catch (err: any) {
      console.error('API /api/leads/export-to-nexus error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Get Hub Presets
  app.get('/api/hubs', (req, res) => {
    res.json({ success: true, hubs: LUXURY_HUBS });
  });

  // Get Stats
  app.get('/api/leads/stats', (req, res) => {
    try {
      const stats = leadDb.getStats();
      res.json({ success: true, stats });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // List all Leads
  app.get('/api/leads', (req, res) => {
    try {
      const leads = leadDb.getAll();
      res.json({ success: true, leads, total: leads.length });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Search & Prospecting Workflow (Places -> Gemini Qualification -> Store)
  app.post('/api/leads/search', async (req, res) => {
    try {
      const { query, location, radiusKm, lat, lng, filterMissingWebsiteOnly } = req.body;

      // 1. Query Google Places API or Curated Hub Pipeline
      const rawPlaces = await searchGooglePlaces({
        query: query || 'Boutique Hotel',
        locationName: location || 'Tulum, Quintana Roo',
        lat,
        lng,
        radiusKm: radiusKm ? Number(radiusKm) : 25,
      });

      // Filter if requested
      let filteredPlaces = rawPlaces;
      if (filterMissingWebsiteOnly) {
        filteredPlaces = rawPlaces.filter(p => !p.website || /booking\.com|airbnb\.com|expedia\.com|instagram\.com/i.test(p.website));
      }

      // 2. Run Gemini 3.7 Flash Qualification Engine on each place
      const newQualifiedLeads = [];
      for (const place of filteredPlaces) {
        const diag = await qualifyLeadWithGemini(place);

        const savedLead = await leadDb.createOrUpdate({
          placeId: place.placeId,
          name: place.name || 'Luxury Boutique Property',
          category: place.category || 'Boutique Hotel',
          location: place.location || location || 'Target Market',
          address: place.address,
          rating: place.rating || 4.8,
          reviewCount: place.reviewCount || 75,
          phone: place.phone,
          website: place.website || '',
          mapsUrl: place.mapsUrl,
          latitude: place.latitude,
          longitude: place.longitude,
          priceLevel: place.priceLevel || 4,

          status: 'NEW',
          priority: diag.priority,
          opportunityScore: diag.opportunityScore,
          painPoint: diag.mainPainPoint,
          estimatedLoss: diag.estimatedMonthlyLoss,
          diagnosticNotes: diag.diagnosticNotes,
          techStackDetected: diag.techStackDetected,

          generatedPitch: diag.outreach.whatsApp,
          pitchWhatsApp: diag.outreach.whatsApp,
          pitchEmail: `${diag.outreach.coldEmailSubject}\n\n${diag.outreach.coldEmailBody}`,
          pitchPhone: diag.outreach.phoneScript,
          pitchLinkedIn: diag.outreach.linkedInPitch,

          customNotes: `Scanned from Google Places search "${query || 'Boutique Hotel'} in ${location}". ${diag.isHotLead ? '🔥 Top priority target.' : ''}`,
          dealValueEst: 18000,
          tags: [diag.isHotLead ? 'HOT_OPPORTUNITY' : 'STANDARD', place.category || 'Boutique Hotel'],
        });

        newQualifiedLeads.push(savedLead);
      }

      res.json({
        success: true,
        count: newQualifiedLeads.length,
        leads: newQualifiedLeads,
        allLeads: leadDb.getAll(),
        stats: leadDb.getStats(),
      });
    } catch (err: any) {
      console.error('API /api/leads/search error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Fetch single Lead
  app.get('/api/leads/:id', (req, res) => {
    const lead = leadDb.getById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    res.json({ success: true, lead });
  });

  // Update Lead
  app.patch('/api/leads/:id', async (req, res) => {
    try {
      const { status, priority, customNotes, dealValueEst, tags } = req.body;
      const id = req.params.id;

      let lead = leadDb.getById(id);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const updated = await leadDb.createOrUpdate({
        id,
        ...(status ? { status } : {}),
        ...(priority ? { priority } : {}),
        ...(customNotes !== undefined ? { customNotes } : {}),
        ...(dealValueEst !== undefined ? { dealValueEst: Number(dealValueEst) } : {}),
        ...(tags ? { tags } : {}),
      });

      res.json({ success: true, lead: updated, stats: leadDb.getStats() });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Re-run AI Qualification for a single lead
  app.post('/api/leads/:id/qualify', async (req, res) => {
    try {
      const lead = leadDb.getById(req.params.id);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const diag = await qualifyLeadWithGemini(lead);

      const updated = await leadDb.createOrUpdate({
        id: lead.id,
        priority: diag.priority,
        opportunityScore: diag.opportunityScore,
        painPoint: diag.mainPainPoint,
        estimatedLoss: diag.estimatedMonthlyLoss,
        diagnosticNotes: diag.diagnosticNotes,
        techStackDetected: diag.techStackDetected,
        generatedPitch: diag.outreach.whatsApp,
        pitchWhatsApp: diag.outreach.whatsApp,
        pitchEmail: `${diag.outreach.coldEmailSubject}\n\n${diag.outreach.coldEmailBody}`,
        pitchPhone: diag.outreach.phoneScript,
        pitchLinkedIn: diag.outreach.linkedInPitch,
      });

      res.json({ success: true, lead: updated, diagnostic: diag });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Generate Custom Pitch with Tone Adjustment
  app.post('/api/leads/:id/pitch', async (req, res) => {
    try {
      const lead = leadDb.getById(req.params.id);
      if (!lead) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
      }

      const { tone = 'consultative', channel = 'whatsapp', customHook = '' } = req.body;
      const diag = await qualifyLeadWithGemini({
        ...lead,
        customNotes: `Requested Tone: ${tone}. Focus Channel: ${channel}. Custom Context: ${customHook}`,
      });

      res.json({
        success: true,
        outreach: diag.outreach,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Delete Lead
  app.delete('/api/leads/:id', (req, res) => {
    const success = leadDb.delete(req.params.id);
    res.json({ success, stats: leadDb.getStats() });
  });

  // Reset to default seed prospects
  app.post('/api/leads/reset', async (req, res) => {
    leadDb.clearAll();
    const tulumLeads = await searchGooglePlaces({ query: 'Boutique Hotel', locationName: 'Tulum, Quintana Roo' });
    for (const place of tulumLeads) {
      const diag = await qualifyLeadWithGemini(place);
      await leadDb.createOrUpdate({
        ...place,
        status: 'NEW',
        priority: diag.priority,
        opportunityScore: diag.opportunityScore,
        painPoint: diag.mainPainPoint,
        estimatedLoss: diag.estimatedMonthlyLoss,
        diagnosticNotes: diag.diagnosticNotes,
        techStackDetected: diag.techStackDetected,
        generatedPitch: diag.outreach.whatsApp,
        pitchWhatsApp: diag.outreach.whatsApp,
        pitchEmail: `${diag.outreach.coldEmailSubject}\n\n${diag.outreach.coldEmailBody}`,
        pitchPhone: diag.outreach.phoneScript,
      });
    }
    res.json({ success: true, leads: leadDb.getAll(), stats: leadDb.getStats() });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LuxuryLead AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
