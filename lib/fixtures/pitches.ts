import type { StartupWithTags } from "@/types/database";

/**
 * "About the Product" copy (PRD §4.1 / DESIGN.md §4.2) — markdown rendered by
 * lib/markdown.ts. Split into Pitch / Problem / Beta requirements so the
 * showcase page has a consistent structure.
 */

const PITCHES: Record<string, string> = {
  sajhapay: `## The pitch
SajhaPay gives Nepali freelancers and micro-businesses **one link to collect money every month** — no spreadsheets, no chasing clients on WhatsApp. Invoices go out, eSewa and Khalti bring the money back, and your bank khata reconciles itself.

## The problem
Recurring revenue is painful here. Most freelancers bill foreign clients in USD and local shops in NPR, then reconcile two wallets, one bank account and a paper khata by hand. A single missed renewal can mean a month of zero cash flow.

## Beta requirements
- Android 8+ or any modern browser
- An eSewa **or** Khalti account (test mode is fine)
- 5 minutes to run one full subscription cycle: create → pay → reconcile

> Screenshot the redirect screen if it stalls — that is the fastest way for us to fix it.`,

  chhito: `## The pitch
Chhito is same-day delivery routing built for the **galli network** of Kathmandu Valley. Small fleets get optimised routes, riders get one app, and shops get a COD ledger that balances at end of day.

## The problem
Delivery startups here lose money on two things: routes that ignore our narrow, one-way, jam-prone streets, and cash-on-delivery money that is reconciled on paper at midnight.

## Beta requirements
- Android phone with GPS (rider app)
- NTC or Ncell data plan — we want real 3G/4G behaviour
- At least 5 stops on one route, then report what the app got wrong`,

  agridristi: `## The pitch
Point your phone at a sick paddy leaf and get an **instant diagnosis in Nepali** — with a treatment plan you can act on today.

## The problem
Terai farmers often wait days for a Krishi extension officer to visit. By then, a fungal infection has spread across the field. Generic apps assume English, constant internet and a flagship phone.

## Beta requirements
- Low-end Android (2GB RAM or less is ideal)
- Works **offline** — please test with mobile data switched off
- At least one real crop photo, then rate the Nepali text size and wording`,

  lekhani: `## The pitch
Lekhani is a bilingual writing copilot that keeps your meaning intact when you move between **Nepali and English**.

## The problem
Existing AI writing tools flatten Nepali into awkward literal translations. Newsrooms, agencies and NGOs here translate constantly and then spend hours fixing tone and Devanagari typography.

## Beta requirements
- Any browser; a Google account to save drafts
- Take one real paragraph you wrote and move it English → Nepali → English
- Tell us every place the tone felt wrong`,

  "p2p-nepal": `## The pitch
P2P Nepal connects households and shops with the **kolektas in their ward** and pays out instantly over Fonepay.

## The problem
Recyclable plastic is collected informally but never measured or accounted for. Without transparent weight and pricing, collectors stay underpaid and wards stay dirty.

## Beta requirements
- Android phone with a working camera (QR weigh-in)
- One bag of plastic to log end-to-end
- Report crashes on entry-level phones especially`,

  "himalaya-analytics": `## The pitch
Himalaya Analytics turns the POS or billing printer a kirana store **already owns** into daily retail intelligence.

## The problem
Small retailers here run on gut feel — they over-order before Dashain, under-order daily staples, and lose track of khata credit. Enterprise analytics is priced far out of reach.

## Beta requirements
- A connected POS or billing printer (tell us the model)
- 2 weeks of your own sales data for a useful backtest
- Flag any SKU name we misread from the receipts`,

  "nyaya-ai": `## The pitch
NyayaAI is a Nepali-first research assistant for advocates — statutes, precedent and applications drafted with the correct **Nepal Government** formatting.

## The problem
Case law is scattered across PDFs and printed volumes, mostly in English, while most litigation in district courts runs in Nepali. Junior advocates spend nights on work that should take minutes.

## Beta requirements
- An advocate or law student willing to review 10 generated summaries
- Feedback on citation accuracy above all else
- Do not use it for live filings during the beta`,

  shabdakit: `## The pitch
ShabdaKit is a Devanagari-first i18n toolkit: type-safe keys, correct plural rules and font-loading presets for bilingual products.

## The problem
Generic i18n libraries treat Devanagari as an edge case. Teams hand-roll font subsets, line-breaking fixes and transliteration tables in every new project.

## Beta requirements
- A Next.js or Astro app you can add a package to
- One real Nepali UI screen to translate
- Report bundle-size changes in your build output`,

  sunwai: `## The pitch
Sunwai is a Nepali speech-to-text API for BPOs and call centres — live transcription, automatic quality scoring and compliance-ready exports.

## The problem
Kathmandu's call centres record thousands of hours of Nepali and Nepanglish calls with no practical way to search them, review agent quality or prove compliance.

## Beta requirements
- 10+ minutes of consenting call audio in Nepali or Nepanglish
- Accuracy feedback per speaker
- Tell us your CRM so we can shape the export format`,

  kothakotha: `## The pitch
KothaKotha lists **verified** rooms and flats with a map that actually loads on a 2G connection, plus eSewa token payments to hold a room for 48 hours.

## The problem
Renters wade through broker spam and fake photos, while landlords lose weeks to no-shows. Existing portals are too heavy for the phones most renters carry.

## Beta requirements
- Test on a capped data plan and report page weight feelings
- 3 room listings to browse and report photo accuracy
- Try one eSewa token payment (refunded after the beta)`,
};

export function getStartupPitch(startup: StartupWithTags): string {
  const fixture = PITCHES[startup.slug];
  if (fixture) return fixture;

  return `## The pitch
${startup.description}

## Beta requirements
- Any modern Android or iOS device
- Enough bandwidth to finish onboarding
- Tell us the first thing that confused you`;
}
