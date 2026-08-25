// Next.js App Router API Route Reference Implementation
import { searchGooglePlaces } from '../../../../src/lib/google-places';
import { qualifyLeadWithGemini } from '../../../../src/lib/gemini-qualifier';

export interface NextRequestLike {
  json: () => Promise<any>;
}

export class NextResponse {
  static json(data: any, init?: { status?: number }) {
    return {
      status: init?.status || 200,
      data,
    };
  }
}

export async function POST(req: NextRequestLike) {
  try {
    const body = await req.json();
    const { query, location, radiusKm, lat, lng } = body;

    // 1. Search Google Places API
    const rawPlaces = await searchGooglePlaces({
      query: query || 'Boutique Hotel',
      locationName: location || 'Tulum, Quintana Roo',
      lat,
      lng,
      radiusKm: radiusKm || 25,
    });

    // 2. Run Gemini 2.5 Flash Qualification Engine & Outreach Generation
    const qualifiedLeads = [];
    for (const place of rawPlaces) {
      const diagnostic = await qualifyLeadWithGemini(place);

      const leadRecord = {
        placeId: place.placeId || `place_${Date.now()}_${Math.random()}`,
        name: place.name || 'Luxury Boutique Property',
        category: place.category || 'Boutique Hotel',
        location: place.location || location || 'Target Hub',
        address: place.address,
        rating: place.rating || 4.7,
        reviewCount: place.reviewCount || 60,
        phone: place.phone,
        website: place.website || '',
        mapsUrl: place.mapsUrl,
        latitude: place.latitude,
        longitude: place.longitude,
        priceLevel: place.priceLevel || 4,

        status: 'NEW' as const,
        priority: diagnostic.priority,
        opportunityScore: diagnostic.opportunityScore,
        painPoint: diagnostic.mainPainPoint,
        estimatedLoss: diagnostic.estimatedMonthlyLoss,
        diagnosticNotes: diagnostic.diagnosticNotes,
        techStackDetected: diagnostic.techStackDetected,

        generatedPitch: diagnostic.outreach.whatsApp,
        pitchWhatsApp: diagnostic.outreach.whatsApp,
        pitchEmail: `${diagnostic.outreach.coldEmailSubject}\n\n${diagnostic.outreach.coldEmailBody}`,
        pitchPhone: diagnostic.outreach.phoneScript,
      };

      // In production Prisma:
      // await prisma.lead.upsert({
      //   where: { placeId: leadRecord.placeId },
      //   update: leadRecord,
      //   create: leadRecord,
      // });

      qualifiedLeads.push(leadRecord);
    }

    return NextResponse.json({
      success: true,
      count: qualifiedLeads.length,
      leads: qualifiedLeads,
    });
  } catch (error: any) {
    console.error('Lead search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
