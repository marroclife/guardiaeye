import { DiagnosticResult, Lead, PriorityLevel } from '../types';

const OLLAMA_API_URL = process.env.OLLAMA_CLOUD_URL || 'https://ollama.com/api/chat';
const OLLAMA_API_KEY = process.env.OLLAMA_CLOUD_API_KEY || process.env.VITE_OLLAMA_CLOUD_API_KEY || '';
const PRIMARY_MODEL = process.env.OLLAMA_MODEL || 'gemma4:31b-cloud';
const FALLBACK_MODEL = process.env.OLLAMA_FALLBACK_MODEL || 'kimi-k2.5:cloud';

export function hasOllamaConfig(): boolean {
  return !!OLLAMA_API_KEY;
}

interface OllamaMessage {
  role: 'system' | 'user';
  content: string;
}

async function callOllama(model: string, messages: OllamaMessage[]): Promise<{ content: string; error?: string }> {
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 2048,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return { content: '', error: `Ollama Cloud HTTP ${response.status}: ${text}` };
    }

    const data = (await response.json()) as { message?: { content?: string }; done_reason?: string };
    const content = data.message?.content || '';

    if (data.done_reason === 'length' && content.length < 80) {
      return { content: '', error: 'Resposta truncada pelo modelo.' };
    }

    return { content };
  } catch (err: any) {
    return { content: '', error: err.message || String(err) };
  }
}

export async function qualifyLeadWithOllama(lead: Partial<Lead>): Promise<DiagnosticResult> {
  const website = lead.website || '';
  const isMissingWebsite = !website || website.trim() === '';
  const isOtaRedirect = /booking\.com|airbnb\.com|expedia\.com|vrbo\.com|hotels\.com|agoda\.com/i.test(website);
  const isSocialOnly = /instagram\.com|facebook\.com|tiktok\.com/i.test(website);
  const isOutdatedCms = /wixsite\.com|wordpress\.com|squarespace\.com|weebly\.com/i.test(website);

  // Se não tiver API key, já cai no rule-based
  if (!hasOllamaConfig()) {
    return generateRuleBasedDiagnostic(lead, isMissingWebsite, isOtaRedirect, isSocialOnly, isOutdatedCms);
  }

  const prompt = `
You are the world's top Hospitality Revenue Architect and Direct Booking Growth Consultant.
Analyze the following luxury hospitality property lead and generate a deep commercial qualification diagnostic and multi-channel cold outreach campaign.

PROPERTY PROFILE:
- Name: ${lead.name || 'Luxury Boutique Property'}
- Category: ${lead.category || 'Boutique Hotel'}
- Location: ${lead.location || 'High-Dollar International Hub'}
- Address: ${lead.address || 'N/A'}
- Google Maps Rating: ${lead.rating || 4.7} / 5.0 (${lead.reviewCount || 85} reviews)
- Phone: ${lead.phone || 'N/A'}
- Current Website / Link: ${lead.website || 'NONE (No website listed on Google Places)'}
- Price Level: Luxury tier (${lead.priceLevel || 4}/4)

QUALIFICATION RULES:
1. PRIORITY LEVEL:
   - "HIGH" if: No website, website is an OTA link (Booking.com/Airbnb/Expedia), website is an Instagram/Facebook link, or outdated slow builder with high rating (4.5+) and 50+ reviews.
   - "MEDIUM" if: Has existing custom website but likely lacks high-converting direct booking engine / speed optimizations.
   - "LOW" if: Large corporate chain hotel with centralized enterprise tech stack.

2. ESTIMATED FINANCIAL LOSS:
   - Calculate realistic monthly OTA commission bleed (typically 15% to 22% of gross booking revenue) based on estimated room count and luxury ADR ($400 - $1,200/night).

3. OUTREACH MESSAGES (English):
   - WhatsApp message: Short, punchy, conversational, referencing their property name, specific pain point (e.g. paying 18% to Booking.com / losing direct bookers on mobile), proposing a bespoke Next.js direct booking prototype demo.
   - Cold Email: High-impact subject line + structured body emphasizing direct booking margin recovery, speed, zero OTA middleman, and bespoke guest experience.
   - Phone script: 30-second consultative hook for the General Manager / Owner.
   - LinkedIn Pitch: Executive DM angle.

Return PURE JSON ONLY, no markdown, no explanation. Use exactly this JSON structure:

{
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "opportunityScore": 0-100,
  "mainPainPoint": "Single most critical revenue leakage point",
  "estimatedMonthlyLoss": "Clear dollar estimate of monthly revenue lost to OTAs / poor conversion",
  "techStackDetected": "Audit of current digital stack or missing infrastructure",
  "diagnosticNotes": "Strategic 2-3 sentence analysis",
  "isHotLead": true | false,
  "adrEstimate": 650,
  "outreach": {
    "whatsApp": "Ready-to-send WhatsApp pitch text",
    "coldEmailSubject": "High open-rate subject line",
    "coldEmailBody": "Complete cold email pitch",
    "phoneScript": "30-second cold call script",
    "linkedInPitch": "Executive LinkedIn message"
  }
}
`;

  const messages: OllamaMessage[] = [
    {
      role: 'system',
      content: 'You are a JSON-only assistant. Always return valid JSON matching the requested schema. No markdown, no prose.',
    },
    { role: 'user', content: prompt },
  ];

  let content = '';
  let lastError = '';

  for (const model of [PRIMARY_MODEL, FALLBACK_MODEL]) {
    const result = await callOllama(model, messages);
    if (result.content && !result.error) {
      content = result.content;
      break;
    }
    lastError = result.error || '';
  }

  if (!content) {
    console.warn('[Ollama Qualifier] Falhou, usando fallback:', lastError);
    return generateRuleBasedDiagnostic(lead, isMissingWebsite, isOtaRedirect, isSocialOnly, isOutdatedCms);
  }

  try {
    // Extrai JSON se o modelo envolver em markdown
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : content;
    const parsed = JSON.parse(jsonString);

    let priority: PriorityLevel = 'HIGH';
    if (parsed.priority === 'MEDIUM' || parsed.priority === 'LOW') {
      priority = parsed.priority;
    }

    return {
      priority,
      opportunityScore: parsed.opportunityScore || 90,
      mainPainPoint: parsed.mainPainPoint || 'High OTA Commission Reliance',
      estimatedMonthlyLoss: parsed.estimatedMonthlyLoss || 'Losing $18,000 - $32,000/mo in OTA commissions',
      techStackDetected: parsed.techStackDetected || (isMissingWebsite ? 'No Website Listed' : 'Legacy Platform'),
      diagnosticNotes: parsed.diagnosticNotes || 'High-demand luxury property with direct booking upside.',
      isHotLead: parsed.isHotLead ?? (priority === 'HIGH'),
      adrEstimate: parsed.adrEstimate || 650,
      outreach: {
        whatsApp: parsed.outreach?.whatsApp || '',
        coldEmailSubject: parsed.outreach?.coldEmailSubject || `Direct booking revenue upgrade for ${lead.name}`,
        coldEmailBody: parsed.outreach?.coldEmailBody || '',
        phoneScript: parsed.outreach?.phoneScript || '',
        linkedInPitch: parsed.outreach?.linkedInPitch || '',
      },
    };
  } catch (err: any) {
    console.warn('[Ollama Qualifier] JSON parse failed, usando fallback:', err.message);
    return generateRuleBasedDiagnostic(lead, isMissingWebsite, isOtaRedirect, isSocialOnly, isOutdatedCms);
  }
}

function generateRuleBasedDiagnostic(
  lead: Partial<Lead>,
  isMissingWebsite: boolean,
  isOtaRedirect: boolean,
  isSocialOnly: boolean,
  isOutdatedCms: boolean
): DiagnosticResult {
  const name = lead.name || 'Luxury Property';
  const rating = lead.rating || 4.8;
  const reviews = lead.reviewCount || 85;
  const location = lead.location || 'Target Market';

  let priority: PriorityLevel = 'HIGH';
  let opportunityScore = 95;
  let mainPainPoint = 'High OTA Commission Reliance (18-22% Commission Leakage)';
  let techStackDetected = 'Direct Booking Engine Missing (OTA Dependent)';
  let estimatedLoss = 'Losing ~$18,500 – $38,000/mo to OTA commissions';
  let adrEstimate = 650;

  if (isMissingWebsite) {
    mainPainPoint = 'Zero Direct Web Presence (100% Third-Party Dependent)';
    techStackDetected = 'No Website Configured on Google Places';
    estimatedLoss = 'Losing ~$24,000 – $45,000/mo (Total lack of direct booking channel)';
    opportunityScore = 98;
  } else if (isOtaRedirect) {
    const otaName = lead.website?.includes('airbnb') ? 'Airbnb' : lead.website?.includes('expedia') ? 'Expedia' : 'Booking.com';
    mainPainPoint = `Direct Traffic funneled into ${otaName} (Losing 15–20% Margin)`;
    techStackDetected = `Redirects directly to ${otaName} URL`;
    estimatedLoss = `Losing ~$22,000 – $40,000/mo on ${otaName} booking commissions`;
    opportunityScore = 96;
  } else if (isSocialOnly) {
    mainPainPoint = 'Social Profile Link Only (Frictional DM Booking Flow)';
    techStackDetected = 'Instagram / Social URL without Instant Direct Checkout';
    estimatedLoss = 'Losing ~$15,000 – $30,000/mo from abandoned mobile bookers';
    opportunityScore = 94;
  } else if (isOutdatedCms) {
    mainPainPoint = 'Legacy Website with Poor Mobile UX & Slow Page Load';
    techStackDetected = 'Slow Legacy CMS (Wix/WordPress/Squarespace template)';
    estimatedLoss = 'Losing ~$12,000 – $25,000/mo due to high mobile bounce rate';
    opportunityScore = 88;
  } else {
    priority = rating >= 4.5 && reviews >= 50 ? 'HIGH' : 'MEDIUM';
    mainPainPoint = 'Unoptimized Direct Booking Flow & Sub-optimal Page Speed';
    techStackDetected = 'Standard Web Stack (Lacks bespoke High-Speed Next.js conversion engine)';
    estimatedLoss = 'Losing ~$10,000 – $20,000/mo in direct conversions to OTAs';
    opportunityScore = priority === 'HIGH' ? 86 : 72;
  }

  const websiteLabel = isMissingWebsite
    ? 'no direct website'
    : isOtaRedirect
    ? 'an OTA listing'
    : 'a non-optimized booking link';

  const whatsApp = `Hi there! Reaching out from HighTicket Hospitality Architect.

Noticed ${name} in ${location} has an outstanding ${rating}★ reputation (${reviews}+ reviews) 🙌.

However, noticed your Google profile points guests to ${websiteLabel}. For a property of your caliber, you're likely surrendering $15k-$35k/month in 18-20% OTA commissions to Booking.com/Airbnb.

We build ultra-fast, bespoke Next.js direct booking platforms with zero commissions and Apple Pay instant checkouts.

Would you be open to a 3-minute interactive preview of what a direct booking engine for ${name} looks like?`;

  const coldEmailSubject = `Direct booking margin recovery for ${name} (${rating}★ in ${location})`;

  const coldEmailBody = `Hi ${name} Management Team,

I recently analyzed the top-tier luxury hospitality operators across ${location} and ${name} immediately stood out with your stellar ${rating}★ rating across ${reviews} guest reviews.

While your guest satisfaction is exceptional, our diagnostic engine flagged a significant revenue leak:

⚠️ Issue: ${mainPainPoint}
📊 Estimated Leakage: ${estimatedLoss}
⚡ Current Stack: ${techStackDetected}

When guests find you on Google or Instagram and are forced to book via OTAs, you lose 15% to 22% of your Gross Operating Profit per reservation.

What We Do:
We engineer ultra-high-speed Next.js direct booking engines specifically tailored for luxury boutique hotels and villa estates:
1. 0% OTA Commissions: Direct Stripe/Apple Pay checkout retaining 100% of guest revenue.
2. 3x Faster Page Loads: Sub-second load times that cut mobile bounce rates by 40%+.
3. Automated Upsell Funnel: Direct bookings with VIP concierge, private dining, and bespoke experiences.

I put together a brief direct booking architecture mockup for ${name}.

Do you have 10 minutes this Thursday or Friday for a quick walk-through?

Best regards,

Hospitality Direct Booking Specialist
Direct: +1 (555) 019-2831`;

  const phoneScript = `“Hi, is this the General Manager or Owner of ${name}?
My name is [Your Name] — I'm calling because we noticed your property has an incredible ${rating}-star rating in ${location}, but you're losing upwards of $20,000 a month in OTA commission fees because guests can't book directly with sub-second checkout.
We built an interactive Next.js direct booking mockup specifically for ${name} that cuts OTA reliance. Can I send a 60-second video over WhatsApp or email to take a look?”`;

  const linkedInPitch = `Hi! Impressed by the stellar guest reviews for ${name} in ${location}.
We specialize in transitioning high-end boutique properties from 18% OTA commission dependence to high-converting, custom Next.js direct booking architectures.
Would love to share a quick 2-page revenue recovery breakdown tailored for your property. Open to connecting?`;

  return {
    priority,
    opportunityScore,
    mainPainPoint,
    estimatedMonthlyLoss: estimatedLoss,
    techStackDetected,
    diagnosticNotes: `High-demand luxury property with ${rating}★ rating and ${reviews} reviews. ${mainPainPoint}. Immediate candidate for direct booking revenue capture.`,
    isHotLead: priority === 'HIGH',
    adrEstimate,
    outreach: {
      whatsApp,
      coldEmailSubject,
      coldEmailBody,
      phoneScript,
      linkedInPitch,
    },
  };
}
