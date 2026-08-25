import { Lead, LeadStats, LeadStatus, PriorityLevel } from '../types';
import { getCuratedHubProspects } from './google-places';
import { qualifyLeadWithGemini } from './gemini-qualifier';

/**
 * In-memory & Persistent Lead Store
 */
class LeadRepository {
  private leads: Map<string, Lead> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initDefaultLeads();
  }

  private async initDefaultLeads() {
    if (this.initialized) return;
    
    // Seed with curated leads from key high-dollar tourism hubs
    const tulumLeads = getCuratedHubProspects('Boutique Hotel Tulum', 'Tulum, Quintana Roo');
    const crLeads = getCuratedHubProspects('Luxury Villa Guanacaste', 'Guanacaste, Costa Rica');
    const flLeads = getCuratedHubProspects('Boutique Hotel Miami', 'Miami Beach & Florida Keys, Florida');

    const allSeeds = [...tulumLeads, ...crLeads, ...flLeads];

    for (const seed of allSeeds) {
      if (!seed.placeId) continue;
      
      const diag = await qualifyLeadWithGemini(seed);

      const lead: Lead = {
        id: `lead_${seed.placeId}`,
        placeId: seed.placeId,
        name: seed.name || 'Luxury Boutique Property',
        category: seed.category || 'Boutique Hotel',
        location: seed.location || 'Riviera Maya',
        address: seed.address,
        rating: seed.rating || 4.8,
        reviewCount: seed.reviewCount || 90,
        phone: seed.phone || '+1 (555) 234-8900',
        website: seed.website || '',
        mapsUrl: seed.mapsUrl,
        latitude: seed.latitude,
        longitude: seed.longitude,
        priceLevel: seed.priceLevel || 4,
        
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
        
        customNotes: `Scanned from luxury hospitality market hub. ${diag.isHotLead ? '🔥 Top priority target.' : ''}`,
        dealValueEst: 18000,
        tags: [diag.isHotLead ? 'HOT_OPPORTUNITY' : 'STANDARD', seed.category || 'Boutique Hotel'],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.leads.set(lead.id, lead);
    }

    this.initialized = true;
  }

  public getAll(): Lead[] {
    return Array.from(this.leads.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getById(id: string): Lead | undefined {
    return this.leads.get(id);
  }

  public findByPlaceId(placeId: string): Lead | undefined {
    for (const lead of this.leads.values()) {
      if (lead.placeId === placeId) return lead;
    }
    return undefined;
  }

  public async createOrUpdate(leadData: Partial<Lead>): Promise<Lead> {
    const existing = leadData.placeId ? this.findByPlaceId(leadData.placeId) : (leadData.id ? this.leads.get(leadData.id) : undefined);
    
    if (existing) {
      const updated: Lead = {
        ...existing,
        ...leadData,
        updatedAt: new Date().toISOString(),
      };
      this.leads.set(updated.id, updated);
      return updated;
    }

    const id = leadData.id || `lead_${leadData.placeId || Math.random().toString(36).substring(2, 10)}`;
    const now = new Date().toISOString();

    const newLead: Lead = {
      id,
      placeId: leadData.placeId || id,
      name: leadData.name || 'Luxury Boutique Property',
      category: leadData.category || 'Boutique Hotel',
      location: leadData.location || 'Target Hub',
      address: leadData.address,
      rating: leadData.rating || 4.7,
      reviewCount: leadData.reviewCount || 50,
      phone: leadData.phone || '',
      website: leadData.website || '',
      mapsUrl: leadData.mapsUrl || '',
      latitude: leadData.latitude,
      longitude: leadData.longitude,
      priceLevel: leadData.priceLevel || 4,
      
      status: leadData.status || 'NEW',
      priority: leadData.priority || 'HIGH',
      opportunityScore: leadData.opportunityScore || 85,
      painPoint: leadData.painPoint,
      estimatedLoss: leadData.estimatedLoss,
      diagnosticNotes: leadData.diagnosticNotes,
      techStackDetected: leadData.techStackDetected,
      
      generatedPitch: leadData.generatedPitch,
      pitchWhatsApp: leadData.pitchWhatsApp,
      pitchEmail: leadData.pitchEmail,
      pitchPhone: leadData.pitchPhone,
      pitchLinkedIn: leadData.pitchLinkedIn,
      
      customNotes: leadData.customNotes || '',
      dealValueEst: leadData.dealValueEst || 15000,
      tags: leadData.tags || [],
      lastContactedAt: leadData.lastContactedAt,
      createdAt: leadData.createdAt || now,
      updatedAt: now,
    };

    this.leads.set(newLead.id, newLead);
    return newLead;
  }

  public updateStatus(id: string, status: LeadStatus): Lead | null {
    const lead = this.leads.get(id);
    if (!lead) return null;

    lead.status = status;
    lead.updatedAt = new Date().toISOString();
    if (status === 'CONTACTED' && !lead.lastContactedAt) {
      lead.lastContactedAt = new Date().toISOString();
    }
    this.leads.set(id, lead);
    return lead;
  }

  public updatePriority(id: string, priority: PriorityLevel): Lead | null {
    const lead = this.leads.get(id);
    if (!lead) return null;

    lead.priority = priority;
    lead.updatedAt = new Date().toISOString();
    this.leads.set(id, lead);
    return lead;
  }

  public updateNotes(id: string, notes: string): Lead | null {
    const lead = this.leads.get(id);
    if (!lead) return null;

    lead.customNotes = notes;
    lead.updatedAt = new Date().toISOString();
    this.leads.set(id, lead);
    return lead;
  }

  public delete(id: string): boolean {
    return this.leads.delete(id);
  }

  public clearAll(): void {
    this.leads.clear();
  }

  public getStats(): LeadStats {
    const all = this.getAll();
    let hotCount = 0;
    let qualifiedCount = 0;
    let contactedCount = 0;
    let negotiatingCount = 0;
    let closedWonCount = 0;
    let totalLoss = 0;
    let ratingSum = 0;

    for (const lead of all) {
      if (lead.priority === 'HIGH') hotCount++;
      if (lead.status === 'QUALIFIED') qualifiedCount++;
      if (lead.status === 'CONTACTED') contactedCount++;
      if (lead.status === 'NEGOTIATING') negotiatingCount++;
      if (lead.status === 'CLOSED') closedWonCount++;

      // Parse approximate loss for stats
      if (lead.estimatedLoss) {
        const matches = lead.estimatedLoss.match(/\$([0-9,]+)/g);
        if (matches && matches.length > 0) {
          const num = parseInt(matches[0].replace(/[^0-9]/g, ''), 10);
          if (!isNaN(num)) totalLoss += num;
        } else {
          totalLoss += 20000;
        }
      } else {
        totalLoss += 18000;
      }

      ratingSum += (lead.rating || 4.5);
    }

    return {
      totalLeads: all.length,
      hotLeads: hotCount,
      qualifiedCount,
      contactedCount,
      negotiatingCount,
      closedWonCount,
      totalEstimatedLoss: totalLoss,
      avgRating: all.length > 0 ? parseFloat((ratingSum / all.length).toFixed(1)) : 4.8,
    };
  }
}

export const leadDb = new LeadRepository();
