export type LeadStatus = 'NEW' | 'QUALIFIED' | 'CONTACTED' | 'NEGOTIATING' | 'CLOSED' | 'REJECTED';
export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Lead {
  id: string;
  placeId: string;
  name: string;
  category: string;
  location: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  phone?: string;
  website?: string;
  mapsUrl?: string;
  latitude?: number;
  longitude?: number;
  priceLevel?: number; // 1 (budget) to 4 (ultra-luxury)
  
  // AI Diagnostics
  status: LeadStatus;
  priority: PriorityLevel;
  opportunityScore: number; // 0 to 100
  painPoint?: string;
  estimatedLoss?: string;
  diagnosticNotes?: string;
  techStackDetected?: string;
  
  // Outreach scripts
  generatedPitch?: string;
  pitchEmail?: string;
  pitchWhatsApp?: string;
  pitchPhone?: string;
  pitchLinkedIn?: string;
  
  // Internal notes & values
  customNotes?: string;
  dealValueEst?: number;
  tags?: string[];
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceSearchFilters {
  query: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  radiusKm: number;
  minRating?: number;
  minReviews?: number;
  filterMissingWebsiteOnly?: boolean;
}

export interface HubPreset {
  id: string;
  name: string;
  country: string;
  region: string;
  coords: { lat: number; lng: number };
  defaultQuery: string;
  avgADR: number; // in USD
  description: string;
}

export interface DiagnosticResult {
  priority: PriorityLevel;
  opportunityScore: number;
  mainPainPoint: string;
  estimatedMonthlyLoss: string;
  techStackDetected: string;
  diagnosticNotes: string;
  isHotLead: boolean;
  adrEstimate: number;
  outreach: {
    whatsApp: string;
    coldEmailSubject: string;
    coldEmailBody: string;
    phoneScript: string;
    linkedInPitch: string;
  };
}

export interface LeadStats {
  totalLeads: number;
  hotLeads: number;
  qualifiedCount: number;
  contactedCount: number;
  negotiatingCount: number;
  closedWonCount: number;
  totalEstimatedLoss: number; // monthly in USD
  avgRating: number;
}
