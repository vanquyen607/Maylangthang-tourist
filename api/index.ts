import 'dotenv/config';
import express from 'express';

// ---------------------------------------------------------------------------
// Mây Lang Thang chat API — local rule-based engine (no external AI calls).
//
// The web frontend posts { messages, lang, catalog } and renders
// { reply, recommendedTourIds, bookingSubmission }. This engine answers from
// the catalog the client sends: tour search (destination / price / duration),
// destination info, contact info, and a conversational booking flow that
// collects name + Vietnamese phone across turns (stateless: everything is
// re-derived from the message history on each request).
// ---------------------------------------------------------------------------

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface CatalogTourSummary {
  id: string;
  title: string;
  destination: string;
  zone: string;
  category: string;
  duration: string;
  price: number;
  groupSize: string;
  departureInfo: string;
  highlights: string[];
  packages: { id: string; label: string; summary: string; priceDelta: number }[];
}

interface CatalogDestinationSummary {
  id: string;
  name: string;
  region: string;
  zone: string;
  bestSeason: string;
  tagline: string;
}

interface CatalogExperienceSummary {
  id: string;
  title: string;
  location: string;
  duration: string;
}

interface CatalogPayload {
  tours?: CatalogTourSummary[];
  destinations?: CatalogDestinationSummary[];
  experiences?: CatalogExperienceSummary[];
  contact?: {
    hotline?: string;
    phone?: string;
    email?: string;
    workingHours?: string;
    address?: string;
    hanoiOffice?: string;
  };
}

interface BookingSubmissionPayload {
  fullName: string;
  phone: string;
  tourId: string;
  tourTitle: string;
  packageId: string;
  packageLabel: string;
  note: string;
}

interface ChatResult {
  reply: string;
  recommendedTourIds: string[];
  bookingSubmission: BookingSubmissionPayload | null;
}

const VALID_PHONE_REGEX = /^(0|\+84)[0-9]{8,10}$/;
type Lang = 'vi' | 'en';

// --- text helpers -----------------------------------------------------------

function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();
}

function fmtPrice(n: number): string {
  return `${Math.round(n).toLocaleString('en-US')}₫`;
}

function tourHaystack(t: CatalogTourSummary): string {
  return norm(`${t.title} ${t.destination} ${t.zone} ${t.category}`);
}

function parseNumber(raw: string): number {
  // "3,5" / "3.5" -> 3.5 ; "3.500.000" -> 3500000
  const cleaned = raw.replace(/\s/g, '');
  if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) return Number(cleaned.replace(/\./g, ''));
  return Number(cleaned.replace(',', '.'));
}

interface SearchFilters {
  maxPrice?: number;
  minPrice?: number;
  days?: number;
  cheapest: boolean;
}

function parseFilters(text: string): SearchFilters {
  const t = ` ${norm(text)} `;
  const f: SearchFilters = { cheapest: false };

  const range = t.match(/(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|million|mil)\s*(?:-|–|den|to|~)\s*(\d+(?:[.,]\d+)?)\s*(?:trieu|tr|million|mil)/);
  if (range) {
    f.minPrice = parseNumber(range[1]) * 1_000_000;
    f.maxPrice = parseNumber(range[2]) * 1_000_000;
  } else {
    const under = t.match(/(?:duoi|under|below|max|tam|khoang|chi co)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|k|nghin|million|mil)/);
    const plain = t.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|million|mil)\b/);
    const kOnly = t.match(/(\d+(?:[.,]\d+)?)\s*(k|nghin)\b/);
    if (under) {
      const mult = under[2] === 'k' || under[2] === 'nghin' ? 1_000 : 1_000_000;
      f.maxPrice = parseNumber(under[1]) * mult;
    } else if (plain) {
      f.maxPrice = parseNumber(plain[1]) * 1_000_000;
    } else if (kOnly && /(gia|price|tour)/.test(t)) {
      f.maxPrice = parseNumber(kOnly[1]) * 1_000;
    }
  }

  const dur = t.match(/(\d+)\s*(?:ngay|n)\s*(?:(\d+)\s*(?:dem|d))?/) || t.match(/(\d+)n(\d+)d/);
  if (dur && /(ngay|dem|n\d|tour|di)/.test(t)) {
    const d = Number(dur[1]);
    if (d >= 1 && d <= 30) f.days = d;
  }
  if (/cuoi tuan/.test(t) && !f.days) f.days = 2;
  if (/re nhat|cheapest|gia re/.test(t)) f.cheapest = true;
  return f;
}

function tourDays(t: CatalogTourSummary): number | null {
  const m = norm(t.duration).match(/(\d+)\s*ngay/);
  return m ? Number(m[1]) : null;
}

function applyFilters(tours: CatalogTourSummary[], f: SearchFilters): CatalogTourSummary[] {
  return tours.filter((t) => {
    if (f.maxPrice !== undefined && t.price > f.maxPrice) return false;
    if (f.minPrice !== undefined && t.price < f.minPrice) return false;
    if (f.days !== undefined) {
      const d = tourDays(t);
      if (d !== null && d !== f.days) return false;
    }
    return true;
  });
}

const SCORE_STOPWORDS = new Set([
  'minh', 'muon', 'tour', 'nay', 'nao', 'khong', 'cho', 'ban', 'giup', 'xem',
  'hoi', 'cac', 'nhung', 'mot', 'duoc', 'theo', 'voi', 'cua', 'la', 'di',
  've', 'den', 'tu', 'co', 'gi', 'dau', 'sao', 'can', 'xin', 'nhe', 'nha',
  'dat', 'book', 'this', 'that', 'want', 'please', 'show', 'find', 'looking',
  'look', 'trip', 'trips', 'travel', 'journey', 'journeys',
]);

// Country aliases (normalized) → canonical country key, which is the
// normalized part of a destination's region before "·" (e.g. region
// "Nhật Bản · Kansai" → "nhat ban"). A query naming a country — Vietnamese
// or English — resolves to that country's tours even when the destination
// itself is a city (Kyoto, Seoul, Paris…). Bare "nhat" is deliberately NOT
// an alias: it also appears in "ho nhat nguyet" (the Taiwan tour).
const COUNTRY_ALIASES: Record<string, string> = {
  'nhat ban': 'nhat ban', japan: 'nhat ban',
  'han quoc': 'han quoc', korea: 'han quoc',
  'trung quoc': 'trung quoc', china: 'trung quoc',
  'thai lan': 'thai lan', thailand: 'thai lan',
  campuchia: 'campuchia', cambodia: 'campuchia',
  indonesia: 'indonesia',
  'mong co': 'mong co', mongolia: 'mong co',
  phap: 'phap', france: 'phap', 'chau au': 'phap', europe: 'phap',
  nepal: 'nepal',
  bhutan: 'bhutan',
  singapore: 'singapore',
  'dai loan': 'dai loan', taiwan: 'dai loan',
};

function countryOfDestination(d: CatalogDestinationSummary): string {
  return norm((d.region || '').split('·')[0].trim());
}

function aliasInText(t: string, alias: string): boolean {
  const esc = alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+');
  return new RegExp(`(^|[^a-z0-9])${esc}([^a-z0-9]|$)`).test(t);
}

/** Canonical country named in the text (alias or exact region country). */
function detectCountry(
  text: string,
  destinations: CatalogDestinationSummary[]
): string | null {
  const t = norm(text);
  let best: string | null = null;
  let bestLen = 0;
  const consider = (alias: string, canonical: string) => {
    if (alias.length >= 3 && alias.length > bestLen && aliasInText(t, alias)) {
      best = canonical;
      bestLen = alias.length;
    }
  };
  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) consider(alias, canonical);
  for (const d of destinations) {
    const c = countryOfDestination(d);
    if (c) consider(c, c);
  }
  return best;
}

function scoreTours(
  tours: CatalogTourSummary[],
  text: string,
  countryByDest?: Map<string, string>
): CatalogTourSummary[] {
  const t = norm(text);
  const canonical = detectCountry(text, []);
  const words = t.split(' ').filter((w) => w.length >= 4 && !SCORE_STOPWORDS.has(w));
  // Consecutive word pairs from the query, e.g. "nhat ban". A phrase hit is
  // strong evidence: "nhat" alone also matches "ho nhat nguyet" (Taiwan),
  // but only the Japan tour contains the phrase "nhat ban".
  const tokens = t.split(' ').filter(Boolean);
  const phrases: string[] = [];
  for (let i = 0; i + 1 < tokens.length; i++) phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
  const scored = tours.map((tour) => {
    const hay = tourHaystack(tour);
    let score = 0;
    if (t.includes(norm(tour.destination))) score += 6;
    // Query names a country → that country's tours score as strongly as a
    // named destination (e.g. "tour pháp" finds Paris, whose destination
    // field is the city, not the country).
    if (canonical && countryByDest && countryByDest.get(norm(tour.destination)) === canonical) score += 6;
    if (tour.zone && t.includes(norm(tour.zone))) score += 2;
    if (tour.category && t.includes(norm(tour.category))) score += 2;
    if (phrases.some((p) => hay.includes(p))) score += 6;
    for (const w of words) if (hay.includes(w)) score += 1;
    return { tour, score };
  });
  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  // When a tour matched strongly (destination / phrase, score >= 6), drop
  // tours that only picked up a single stray word (score <= 1) — e.g. the
  // Taiwan tour scoring 1 from "nhat" in "ho nhat nguyet" on a Japan query.
  const best = ranked.length > 0 ? ranked[0].score : 0;
  const kept = best >= 6 ? ranked.filter((s) => s.score > 1) : ranked;
  return kept.map((s) => s.tour);
}

/** Strong, unambiguous tour reference: full title or destination named. */
function strongTourMatch(
  tours: CatalogTourSummary[],
  text: string
): CatalogTourSummary | null {
  const t = norm(text);
  for (const tour of tours) {
    if (tour.title && t.includes(norm(tour.title))) return tour;
  }
  for (const tour of tours) {
    if (tour.destination && t.includes(norm(tour.destination))) return tour;
  }
  return null;
}

function matchDestination(
  destinations: CatalogDestinationSummary[],
  text: string
): CatalogDestinationSummary | null {
  const t = norm(text);
  // A named country resolves straight to that country's destination
  // (e.g. "Nhật Bản" → Kyoto, "châu Âu" → Paris).
  const canonical = detectCountry(text, destinations);
  if (canonical) {
    const byCountry = destinations.find((d) => countryOfDestination(d) === canonical);
    if (byCountry) return byCountry;
  }
  let best: CatalogDestinationSummary | null = null;
  let bestLen = 0;
  for (const d of destinations) {
    // Region is "Country · Area" (e.g. "Nhật Bản · Kansai"): the part before
    // "·" is the country, so a query naming the country matches the city
    // destination (Kyoto) even though the tour's destination is the city.
    const country = (d.region || '').split('·')[0].trim();
    for (const cand of [d.name, d.region, country]) {
      const n = norm(cand || '');
      if (n.length >= 3 && t.includes(n) && n.length > bestLen) {
        best = d;
        bestLen = n.length;
      }
    }
  }
  return best;
}

function extractPhone(texts: string[]): string | null {
  for (let i = texts.length - 1; i >= 0; i--) {
    const candidates = texts[i].match(/(?:\+84|0)(?:[\s.\-]?\d){8,12}/g) || [];
    for (const c of candidates) {
      const cleaned = c.replace(/[\s.\-]/g, '');
      if (VALID_PHONE_REGEX.test(cleaned)) return cleaned;
      // A longer run may contain the number plus an extra digit run; try trims.
      for (const cand of [cleaned.slice(0, 11), cleaned.slice(0, 10)]) {
        if (VALID_PHONE_REGEX.test(cand)) return cand;
      }
    }
  }
  return null;
}

const NAME_STOPWORDS = new Set([
  'tour', 'xin', 'chao', 'hello', 'dat', 'muon', 'can', 'hoi',
  'gia', 'nguoi', 'dien', 'thoai', 'so', 'phone', 'the', 'and', 'cho',
]);
const NAME_FILLERS = new Set(['la', 'ten', 'minh', 'toi', 'my', 'name', 'is', 'i', 'am']);

function cleanName(raw: string): string | null {
  let words = raw
    .replace(/[^\p{L}\s'-]/gu, ' ')
    .split(/\s+/)
    .filter((w) => /\p{L}/u.test(w));
  while (words.length > 0 && NAME_FILLERS.has(norm(words[0]))) words = words.slice(1);
  words = words.slice(0, 4);
  if (words.length === 0) return null;
  if (words.some((w) => NAME_STOPWORDS.has(norm(w)))) return null;
  const name = words.join(' ');
  return name.trim().length >= 2 ? name.trim() : null;
}

function extractName(userTexts: string[], lastModelText: string): string | null {
  for (let i = userTexts.length - 1; i >= 0; i--) {
    const m = userTexts[i].match(
      /(?:tên mình là|tên tôi là|tôi tên|mình tên|họ tên|my name is|name is|tên)\s*[:\-]?\s*([^\d,.;:]+)/i
    );
    if (m) {
      const n = cleanName(m[1]);
      if (n) return n;
    }
    // "Nguyễn Văn An, 0912345678" — a bare name sent together with the phone.
    const withoutPhone = userTexts[i].replace(/(?:\+84|0)(?:[\s.\-]?\d){8,12}/g, ' ');
    if (withoutPhone !== userTexts[i]) {
      const words = withoutPhone
        .replace(/[^\p{L}\s]/gu, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (words.length >= 2 && words.length <= 5 && !/\d/.test(withoutPhone)) {
        const n = cleanName(withoutPhone);
        if (n) return n;
      }
    }
  }
  // If the assistant just asked for a name and the reply is a short plain
  // phrase, treat the whole reply as the name.
  const askedName = /(ho ten|ten cua ban|your name|xin ten)/.test(norm(lastModelText));
  const last = (userTexts[userTexts.length - 1] || '').replace(
    /(?:\+84|0)(?:[\s.\-]?\d){8,12}/g,
    ' '
  );
  if (askedName && last.trim()) {
    const words = last
      .replace(/[^\p{L}\s]/gu, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (words.length >= 2 && words.length <= 5 && !/\d/.test(last)) {
      return cleanName(last);
    }
  }
  return null;
}

function extractNoteBits(userTexts: string[]): string {
  const bits: string[] = [];
  for (const text of userTexts) {
    const t = norm(text);
    const date = text.match(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/);
    if (date) bits.push(`Ngày đi dự kiến: ${date[0]}`);
    const guests = text.match(/(\d+)\s*(người lớn|trẻ em|người|khách|nguoi lon|tre em|nguoi|khach)/i);
    if (guests) bits.push(`Số khách: ${guests[1]} ${guests[2]}`);
    const month = t.match(/thang\s*(\d{1,2})/);
    if (month) bits.push(`Thời gian dự kiến: tháng ${month[1]}`);
  }
  return [...new Set(bits)].join('; ').slice(0, 1000);
}

/** Tours shown most recently, recovered from **bold** titles in bot replies. */
function lastShownTours(
  history: ChatHistoryItem[],
  tours: CatalogTourSummary[]
): CatalogTourSummary[] {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role !== 'model') continue;
    const bolds = [...history[i].text.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1]);
    const found: CatalogTourSummary[] = [];
    for (const b of bolds) {
      const nb = norm(b);
      const tour = tours.find(
        (t) => nb === norm(t.title) || nb.includes(norm(t.title)) || norm(t.title).includes(nb)
      );
      if (tour && !found.includes(tour)) found.push(tour);
    }
    if (found.length > 0) return found;
  }
  return [];
}

function pickPackage(
  tour: CatalogTourSummary | null,
  text: string
): { id: string; label: string } {
  const t = norm(text);
  let wanted = 'local-standard';
  if (/(boutique|cao cap|sang trong|resort)/.test(t)) wanted = 'boutique-retreat';
  if (/(nhom rieng|private|rieng tu|doan rieng)/.test(t)) wanted = 'private-group';
  const pkgs = tour?.packages || [];
  const found = pkgs.find((p) => p.id === wanted) || pkgs[0];
  if (found) return { id: found.id, label: found.label };
  return {
    id: wanted,
    label:
      wanted === 'boutique-retreat'
        ? 'Gói Boutique'
        : wanted === 'private-group'
          ? 'Nhóm riêng tư'
          : 'Gói Bản Địa',
  };
}

// --- reply builders ---------------------------------------------------------

function tourLine(t: CatalogTourSummary): string {
  return `**${t.title}** — ${t.duration} · ${fmtPrice(t.price)}`;
}

function listReply(
  lang: Lang,
  intro: string,
  tours: CatalogTourSummary[],
  outro?: string
): ChatResult {
  const lines = tours.slice(0, 3).map((t, i) => `${i + 1}. ${tourLine(t)}`);
  const reply = [intro, ...lines, outro || (lang === 'en'
    ? 'Tell me a tour number (or its name) if you want details or to book it.'
    : 'Bạn ưng tour nào thì nhắn số thứ tự (hoặc tên tour), mình tư vấn chi tiết và giữ chỗ giúp bạn nhé.')]
    .filter(Boolean)
    .join('\n');
  return {
    reply,
    recommendedTourIds: tours.slice(0, 3).map((t) => t.id),
    bookingSubmission: null,
  };
}

function tourDetail(t: CatalogTourSummary, lang: Lang): ChatResult {
  const hl = (t.highlights || []).slice(0, 4);
  const pkgLines = (t.packages || []).map(
    (p) => `- ${p.label}: ${p.priceDelta > 0 ? `+${fmtPrice(p.priceDelta)}` : fmtPrice(0).replace('0₫', 'đã gồm trong giá')}${p.summary ? ` — ${p.summary}` : ''}`
  );
  const vi = [
    `**${t.title}**`,
    `📍 ${t.destination} · ${t.duration} · ${t.groupSize}`,
    `💰 Giá từ **${fmtPrice(t.price)}**/khách · ${t.departureInfo}`,
    hl.length ? `✨ Nổi bật: ${hl.join('; ')}` : '',
    pkgLines.length ? `Các gói:\n${pkgLines.join('\n')}` : '',
    'Bạn muốn mình giữ chỗ tour này không? Chỉ cần cho mình **họ tên** và **số điện thoại**, mình ghi nhận ngay.',
  ];
  const en = [
    `**${t.title}**`,
    `📍 ${t.destination} · ${t.duration} · ${t.groupSize}`,
    `💰 From **${fmtPrice(t.price)}**/guest · ${t.departureInfo}`,
    hl.length ? `✨ Highlights: ${hl.join('; ')}` : '',
    pkgLines.length ? `Packages:\n${pkgLines.join('\n')}` : '',
    'Shall I hold a spot on this tour? Just send me your **full name** and **phone number**.',
  ];
  return {
    reply: (lang === 'en' ? en : vi).filter(Boolean).join('\n'),
    recommendedTourIds: [t.id],
    bookingSubmission: null,
  };
}

// --- main engine --------------------------------------------------------------

function handleChat(history: ChatHistoryItem[], lang: Lang, catalog: CatalogPayload): ChatResult {
  const tours = Array.isArray(catalog.tours) ? catalog.tours : [];
  const destinations = Array.isArray(catalog.destinations) ? catalog.destinations : [];
  const experiences = Array.isArray(catalog.experiences) ? catalog.experiences : [];
  const contact = catalog.contact || {};

  const userTexts = history.filter((m) => m.role === 'user').map((m) => m.text);
  const lastUser = userTexts[userTexts.length - 1] || '';
  const lastModel = [...history].reverse().find((m) => m.role === 'model')?.text || '';
  const t = norm(lastUser);
  const allUserNorm = norm(userTexts.join(' '));

  const featured = tours.slice(0, 3);
  const shownBefore = lastShownTours(history, tours);

  // ---------- booking flow ----------
  const phone = extractPhone(userTexts);
  const name = extractName(userTexts, lastModel);
  const lastModelNorm = norm(lastModel);
  // Only a reply that asked for BOTH name and phone counts as a booking
  // prompt — capability/greeting texts also mention "giữ chỗ" and must not
  // flip the next search question into booking mode.
  const askedBookingInfo =
    /(ho ten|full name)/.test(lastModelNorm) && /(so dien thoai|phone number)/.test(lastModelNorm);
  const wantsCustom = /(thiet ke rieng|lich trinh rieng|tour rieng theo|tailored|custom)/.test(t) ||
    /(thiet ke rieng|lich trinh rieng|tailored|custom)/.test(allUserNorm);
  const bookingWords = /(dat tour|dat cho|giu cho|muon dat|chot tour|dang ky|book|reserve|dat ngay|dat nhe|xac nhan)/.test(t);
  const gaveInfo = Boolean(phone || name) && (askedBookingInfo || bookingWords);
  const inBooking = bookingWords || gaveInfo;

  // Which tour is the booking about? Explicit title/destination in the
  // current message wins; otherwise the tour(s) most recently shown.
  let bookingTour: CatalogTourSummary | null = null;
  if (!wantsCustom && inBooking) {
    const explicit = strongTourMatch(tours, lastUser);
    if (explicit) {
      bookingTour = explicit;
    } else if (shownBefore.length > 0) {
      let idx = 0;
      if (/thu hai|so 2|\b2\b/.test(t)) idx = 1;
      if (/thu ba|so 3|\b3\b/.test(t)) idx = 2;
      bookingTour = shownBefore[Math.min(idx, shownBefore.length - 1)];
    } else {
      bookingTour = strongTourMatch(tours, userTexts.join(' '));
    }
  }

  if (inBooking && (bookingTour || wantsCustom || phone || name)) {
    const pkg = pickPackage(bookingTour, userTexts.join(' '));
    const tourTitle = bookingTour
      ? bookingTour.title
      : lang === 'en'
        ? 'Tailored Private Itinerary'
        : 'Thiết kế lịch trình riêng';

    if (bookingTour || wantsCustom) {
      const missing: string[] = [];
      if (!name) missing.push(lang === 'en' ? '**full name**' : '**họ tên**');
      if (!phone) missing.push(lang === 'en' ? '**phone number**' : '**số điện thoại**');
      if (missing.length > 0) {
        const reply = lang === 'en'
          ? `Great choice — **${tourTitle}** (${pkg.label}). To hold your spot I just need your ${missing.join(' and ')}. You can send both in one message, e.g. "Nguyen Van A, 0912345678".`
          : `Tour **${tourTitle}** (${pkg.label}) rất đáng đi đó bạn. Để mình giữ chỗ, bạn cho mình xin ${missing.join(' và ')} nhé — gửi chung một tin cũng được, ví dụ: "Nguyễn Văn A, 0912345678".`;
        return { reply, recommendedTourIds: bookingTour ? [bookingTour.id] : [], bookingSubmission: null };
      }
      const note = extractNoteBits(userTexts);
      const submission: BookingSubmissionPayload = {
        fullName: name as string,
        phone: phone as string,
        tourId: bookingTour ? bookingTour.id : 'custom-private',
        tourTitle,
        packageId: pkg.id,
        packageLabel: pkg.label,
        note,
      };
      const reply = lang === 'en'
        ? `Thank you, ${name}! I've noted your booking request:\n**${tourTitle}** · ${pkg.label}\n📞 ${phone}\nThe Mây Lang Thang team will call you shortly to confirm the details.`
        : `Cảm ơn bạn ${name}! Mình đã ghi nhận yêu cầu đặt tour:\n**${tourTitle}** · ${pkg.label}\n📞 ${phone}\nĐội Mây Lang Thang sẽ gọi lại sớm để xác nhận chi tiết với bạn nhé.`;
      return { reply, recommendedTourIds: bookingTour ? [bookingTour.id] : [], bookingSubmission: submission };
    }
    // Booking intent but no tour identified yet.
    const reply = lang === 'en'
      ? 'I would love to help you book. Which tour are you interested in? Here are a few favourites:'
      : 'Mình rất sẵn lòng giúp bạn đặt tour. Bạn đang quan tâm tour nào dưới đây, hay một điểm đến khác?';
    return listReply(lang, reply, featured);
  }

  // ---------- greeting ----------
  const greetingOnly =
    (/^(xin chao|chao|hello|hi|hey|alo|good (morning|afternoon|evening))\b/.test(t) &&
      !/(tour|under|price|book|million|trieu|ngay|dem|di dau|where|what)/.test(t)) ||
    t.length <= 3;
  if (greetingOnly) {
    const reply = lang === 'en'
      ? 'Hello and welcome to **Mây Lang Thang** — "Travel slow, live more." I can help you find tours by destination, budget or length, share trip ideas, or hold a booking. Where would you like to go?'
      : 'Xin chào bạn, mình là trợ lý của **Mây Lang Thang** — "Đi chậm, sống nhiều." Mình giúp bạn tìm tour theo điểm đến, ngân sách hay số ngày, gợi ý trải nghiệm, và giữ chỗ đặt tour. Bạn đang muốn đi đâu?';
    return listReply(lang, reply, featured, lang === 'en' ? 'A few journeys travellers love:' : 'Một vài hành trình được yêu thích:');
  }

  // ---------- contact ----------
  if (/(hotline|lien he|so dien thoai|email|dia chi|gio lam viec|contact|call you|phone number|address)/.test(t)) {
    const lines: string[] = [lang === 'en' ? 'Here is how to reach **Mây Lang Thang**:' : 'Thông tin liên hệ của **Mây Lang Thang** đây bạn:'];
    if (contact.hotline) lines.push(`📞 Hotline: **${contact.hotline}**`);
    if (contact.phone && contact.phone !== contact.hotline) lines.push(`📱 ${contact.phone}`);
    if (contact.email) lines.push(`✉️ Email: **${contact.email}**`);
    if (contact.workingHours) lines.push(`🕘 ${contact.workingHours}`);
    if (contact.address) lines.push(`📍 ${contact.address}`);
    if (contact.hanoiOffice) lines.push(`📍 ${contact.hanoiOffice}`);
    lines.push(lang === 'en' ? 'Or just tell me here — I can hold a tour for you right in this chat.' : 'Hoặc bạn cứ nhắn ngay tại đây — mình giữ chỗ tour giúp bạn luôn trong khung chat này.');
    return { reply: lines.join('\n'), recommendedTourIds: [], bookingSubmission: null };
  }

  // ---------- about ----------
  if (/(may lang thang)/.test(t) && /(la ai|la gi|gioi thieu|about|who are)/.test(t)) {
    const reply = lang === 'en'
      ? '**Mây Lang Thang** is a small Vietnam travel studio built around one idea — "Travel slow, live more." We craft small-group and private journeys with local hosts across Vietnam. Tell me a place or a budget and I will line up the right trips for you.'
      : '**Mây Lang Thang** là một studio du lịch nhỏ, theo đuổi triết lý "Đi chậm, sống nhiều" — những hành trình nhóm nhỏ và tour riêng cùng người bản địa khắp Việt Nam. Bạn cứ nói một điểm đến hoặc mức ngân sách, mình xếp tour phù hợp cho bạn ngay.';
    return listReply(lang, reply, featured);
  }

  // ---------- experiences ----------
  if (/(trai nghiem|experience|workshop|hoat dong|activities)/.test(t) && experiences.length > 0) {
    const lines = experiences.slice(0, 5).map((e) => `- **${e.title}** — ${e.location} · ${e.duration}`);
    const reply = [
      lang === 'en' ? 'Local experiences travellers love:' : 'Những trải nghiệm bản địa được yêu thích:',
      ...lines,
      lang === 'en' ? 'Want a tour that includes one of these? Tell me the destination.' : 'Bạn muốn tour nào có kèm trải nghiệm này không? Nhắn mình điểm đến nhé.',
    ].join('\n');
    return { reply, recommendedTourIds: [], bookingSubmission: null };
  }

  // ---------- destination info ----------
  const dest = matchDestination(destinations, lastUser);
  const destTours = dest ? tours.filter((x) => norm(x.destination) === norm(dest.name) || tourHaystack(x).includes(norm(dest.name))) : [];
  if (dest && /(mua nao|thoi tiet|co gi|gioi thieu|dep|nen di|best season|weather|about|visit)/.test(t)) {
    const reply = lang === 'en'
      ? `**${dest.name}** (${dest.region}) — ${dest.tagline}\n🌤 Best season: **${dest.bestSeason}**.\nHere are the journeys we run there:`
      : `**${dest.name}** (${dest.region}) — ${dest.tagline}\n🌤 Mùa đẹp nhất: **${dest.bestSeason}**.\nCác hành trình Mây Lang Thang đang mở ở đây:`;
    if (destTours.length > 0) return listReply(lang, reply, destTours);
    return { reply, recommendedTourIds: [], bookingSubmission: null };
  }

  // ---------- tour search / detail ----------
  const filters = parseFilters(lastUser);

  // "Tour quốc tế / nước ngoài" with no specific country named → list the
  // international tours (cheapest first) and name the countries on offer.
  const countryByDest = new Map(
    destinations.map((d) => [norm(d.name), countryOfDestination(d)] as const)
  );
  const intlIntent = /(quoc te|nuoc ngoai|international|abroad|overseas)/.test(t);
  if (intlIntent && !dest && !detectCountry(lastUser, destinations)) {
    const intlPool = applyFilters(
      tours.filter((x) => norm(x.zone) === 'quoc te'),
      filters
    );
    if (intlPool.length > 0) {
      const sorted = [...intlPool].sort((a, b) => a.price - b.price);
      const countryNames = [
        ...new Set(
          destinations
            .filter((d) => norm(d.zone) === 'quoc te')
            .map((d) => (d.region || '').split('·')[0].trim())
            .filter(Boolean)
        ),
      ];
      const intro = lang === 'en'
        ? `We currently run **${intlPool.length} international tours**. Here are the best-priced ones:`
        : `Mây Lang Thang đang có **${intlPool.length} tour quốc tế** — gửi bạn vài tour giá tốt nhất trước:`;
      const outro = lang === 'en'
        ? `Countries on offer: ${countryNames.join(', ')}. Tell me a country (or a budget) and I'll narrow it down for you.`
        : `Các nước đang có tour: ${countryNames.join(', ')}. Bạn muốn đi nước nào, hoặc tầm giá bao nhiêu, nhắn mình lọc tiếp nhé.`;
      return listReply(lang, intro, sorted, outro);
    }
  }

  const pool = applyFilters(tours, filters);
  const matched = scoreTours(pool, lastUser, countryByDest);
  const hasFilter = filters.maxPrice !== undefined || filters.minPrice !== undefined || filters.days !== undefined;

  if (matched.length > 0) {
    const detailAsk = /(chi tiet|gia bao nhieu|gia the nao|thong tin|detail|how much|price of|bao nhieu tien)/.test(t);
    if (matched.length === 1 || detailAsk) return tourDetail(matched[0], lang);
    let intro: string;
    if (lang === 'en') {
      intro = hasFilter
        ? `I found **${matched.length}** tour(s) matching your filters:`
        : `Here are the journeys that fit you best:`;
    } else {
      intro = hasFilter
        ? `Mình tìm thấy **${matched.length} tour** hợp với yêu cầu của bạn:`
        : 'Những hành trình hợp với bạn nhất đây:';
    }
    let list = matched;
    if (filters.cheapest) list = [...matched].sort((a, b) => a.price - b.price);
    return listReply(lang, intro, list);
  }

  if (hasFilter && pool.length > 0) {
    // Filters matched tours even though no keyword scored — present the
    // filtered pool itself as the result set.
    const sorted = [...pool].sort((a, b) => a.price - b.price);
    const intro = lang === 'en'
      ? `I found **${sorted.length}** tour(s) within your criteria:`
      : `Mình tìm thấy **${sorted.length} tour** trong tầm tiêu chí của bạn:`;
    return listReply(lang, intro, sorted);
  }

  if (hasFilter && tours.length > 0) {
    // Nothing fits the filters at all — show the closest (cheapest) options.
    const sorted = [...tours].sort((a, b) => a.price - b.price);
    const intro = lang === 'en'
      ? 'No tour fits that budget/length right now — here are the closest options:'
      : 'Hiện chưa có tour nào vừa đúng tiêu chí đó — đây là những lựa chọn gần nhất:';
    return listReply(lang, intro, sorted);
  }

  if (dest && destTours.length > 0) {
    const intro = lang === 'en'
      ? `Here are our journeys in **${dest.name}**:`
      : `Các hành trình ở **${dest.name}** của Mây Lang Thang đây bạn:`;
    return listReply(lang, intro, destTours);
  }

  if (/(cam on|thank)/.test(t)) {
    return {
      reply: lang === 'en'
        ? 'You are very welcome! If you need anything else — a tour idea, a price, or a booking — just ask.'
        : 'Không có chi đâu bạn! Cần thêm gợi ý tour, hỏi giá hay đặt chỗ thì cứ nhắn mình nhé.',
      recommendedTourIds: [],
      bookingSubmission: null,
    };
  }

  // ---------- fallback ----------
  const reply = lang === 'en'
    ? 'I can help you: find tours by destination (e.g. "Da Lat tours"), by budget ("under 3 million"), by length ("3 days 2 nights"), show contact info, or hold a booking. Here are a few favourites:'
    : 'Mình giúp được các việc: tìm tour theo điểm đến (ví dụ "tour Đà Lạt"), theo ngân sách ("dưới 3 triệu"), theo số ngày ("3 ngày 2 đêm"), xem thông tin liên hệ, hoặc giữ chỗ đặt tour. Gửi bạn vài tour được yêu thích:';
  return listReply(lang, reply, featured);
}

// --- express app --------------------------------------------------------------

function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/chat', (req, res) => {
    try {
      const body = req.body as {
        messages?: ChatHistoryItem[];
        lang?: 'vi' | 'en';
        catalog?: CatalogPayload;
      };
      const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
      const lang: Lang = body?.lang === 'en' ? 'en' : 'vi';
      const catalog: CatalogPayload = body?.catalog || {};

      const sanitized = rawMessages
        .filter(
          (m): m is ChatHistoryItem =>
            Boolean(m) &&
            (m.role === 'user' || m.role === 'model') &&
            typeof m.text === 'string' &&
            m.text.trim().length > 0
        )
        .slice(-16)
        .map((m) => ({ role: m.role, text: m.text.trim().slice(0, 2000) }));

      const firstUserIdx = sanitized.findIndex((m) => m.role === 'user');
      if (firstUserIdx === -1) {
        res.status(400).json({ error: 'Tin nhắn trống.' });
        return;
      }

      const result = handleChat(sanitized.slice(firstUserIdx), lang, catalog);
      res.json(result);
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: 'Có lỗi xảy ra, bạn thử lại giúp mình nhé.' });
    }
  });

  return app;
}

const app = createApp();
export default app;
