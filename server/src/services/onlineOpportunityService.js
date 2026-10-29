import Opportunity from '../models/Opportunity.js';
import OnlineFeedSyncState from '../models/OnlineFeedSyncState.js';

const SOURCE_URLS = {
  techOpportunities: 'https://techopportunities.eu',
  himalayas: 'https://himalayas.app',
  hackalendar: 'https://hackalendar.com',
  brabble: 'https://brabble.ai'
};

function cleanText(value = '') {
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(', ');
  return String(value ?? '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function asDate(value) {
  if (value === null || value === undefined || value === '') return null;
  let candidate = value;
  if (typeof candidate === 'number' || (typeof candidate === 'string' && /^\d{9,13}$/.test(candidate))) {
    const numeric = Number(candidate);
    candidate = new Date(numeric < 100000000000 ? numeric * 1000 : numeric);
  } else {
    candidate = new Date(candidate);
  }
  return Number.isNaN(candidate.getTime()) ? null : candidate;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(String(value));
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function pick(...values) {
  return values.find(value => value !== undefined && value !== null && String(value).trim() !== '');
}

function toMode(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('hybrid')) return 'Hybrid';
  if (normalized.includes('online') || normalized.includes('remote') || normalized === 'virtual') return 'Online';
  if (normalized.includes('offline') || normalized.includes('onsite') || normalized.includes('in_person') || normalized.includes('in-person')) return 'Onsite';
  return 'Any';
}

function typeFor(value, title = '') {
  const normalized = `${value || ''} ${title || ''}`.toLowerCase();
  if (normalized.includes('scholarship')) return 'Scholarship';
  if (normalized.includes('intern')) return 'Internship';
  if (normalized.includes('hackathon')) return 'Hackathon';
  if (normalized.includes('fellowship')) return 'Fellowship';
  if (normalized.includes('workshop')) return 'Workshop';
  if (normalized.includes('course')) return 'Course';
  if (normalized.includes('competition') || normalized.includes('contest') || normalized.includes('coding challenge') || normalized.includes('case study')) return 'Competition';
  return 'Other';
}

function eligibilityList(values, sourceLabel) {
  const list = Array.isArray(values) ? values : values ? [values] : [];
  const clean = list.map(cleanText).filter(Boolean).slice(0, 20);
  if (!clean.length) return [{ criterionId: 'source-check', category: 'Eligibility', label: `Check eligibility and application rules on ${sourceLabel}.`, importance: 'Informational' }];
  return clean.map((label, index) => ({ criterionId: `api-eligibility-${index + 1}`, category: 'Eligibility', label: label.slice(0, 240), importance: 'Informational' }));
}

function normalizeRecord(record) {
  const title = cleanText(pick(record.title, record.name, record.role, record.position));
  const organization = cleanText(pick(record.company, record.companyName, record.company_name, record.organiser, record.organizer, record.organization, record.employer, record.provider));
  const applicationUrl = pick(record.applicationUrl, record.applicationLink, record.application_url, record.registration_url, record.registrationUrl, record.url, record.link, record.shareUrl);
  const sourceUrl = pick(record.sourceUrl, record.source_url, record.sourceLink, record.source_link);
  if (title.length < 3 || organization.length < 2 || !isHttpUrl(applicationUrl)) return null;

  const source = record.__source;
  const stableId = cleanText(pick(record.__externalId, record.guid, record.id, record.slug, record.linkedinJobId, record.url, record.link, applicationUrl));
  const rawDeadline = pick(record.__deadline, record.applicationDeadline, record.application_deadline, record.registrationDeadline, record.registration_deadline, record.deadlineAt, record.deadline_at);
  const deadlineAt = asDate(rawDeadline);
  const category = cleanText(pick(record.type, record.employmentType, record.employment_type, record.job_type, record.kind, record.category));
  const type = record.__type || typeFor(category, title);
  const description = cleanText(pick(record.description, record.excerpt, record.summary, record.shortDescription, record.short_description, record.details));
  let summary = description || `${title} at ${organization}. View the original listing for full details and eligibility.`;
  if (summary.length < 10) summary = `${summary} View the source listing for full details.`;
  const location = cleanText(pick(record.location, record.city, record.candidate_required_location, record.locationRestrictions, record.location_restrictions));
  const mode = record.__mode || toMode(pick(record.mode, record.remote, record.format, record.workplaceType, record.workplace_type));
  const tags = [...new Set([
    ...(Array.isArray(record.tags) ? record.tags : []),
    ...(Array.isArray(record.categories) ? record.categories : []),
    ...(Array.isArray(record.parentCategories) ? record.parentCategories : []),
    ...(record.category ? [record.category] : [])
  ].map(cleanText).filter(Boolean))].slice(0, 20);

  return {
    title: title.slice(0, 160),
    type,
    organization: organization.slice(0, 160),
    summary: summary.slice(0, 1200),
    description: description.slice(0, 8000),
    eligibilityCriteria: eligibilityList(pick(record.eligibility, record.eligibilityCriteria, record.eligibility_criteria), source.label),
    deadlineAt,
    deadlineState: deadlineAt ? 'Known' : 'NotSpecified',
    applicationUrl: String(applicationUrl),
    sourceUrl: isHttpUrl(sourceUrl) ? String(sourceUrl) : source.url,
    tags,
    targetEducationLevels: [],
    mode,
    location: location.slice(0, 120),
    benefits: [],
    status: 'Published',
    externalSource: source.key,
    externalId: stableId.slice(0, 240),
    sourceName: source.label,
    updatedFromOnlineAt: new Date()
  };
}

async function fetchJson(url, headers = {}) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json', 'User-Agent': 'OpportunityHub-Student-Case-Study/1.0', ...headers },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${new URL(url).host}`);
  return response.json();
}

function getArray(payload, names = ['data', 'jobs', 'opportunities', 'listings', 'events', 'results']) {
  if (Array.isArray(payload)) return payload;
  for (const name of names) if (Array.isArray(payload?.[name])) return payload[name];
  return [];
}

async function fetchTechOpportunities() {
  const url = 'https://techopportunities.eu/api/v1/opportunities?type=internship&page-size=50';
  const payload = await fetchJson(url);
  return getArray(payload).map(item => ({
    ...item,
    __source: { key: 'techopportunities', label: 'European Tech Opportunities', url: SOURCE_URLS.techOpportunities },
    __externalId: item.linkedinJobId || item.id || item.link,
    __type: 'Internship',
    title: item.title,
    company: item.company,
    location: item.location,
    url: item.link,
    description: item.title && item.company ? `${item.title} at ${item.company}. Location: ${item.location || 'Not specified'}. Visit the original listing for full requirements.` : item.title,
    __deadline: null
  }));
}

async function fetchHimalayasInternships() {
  const jobs = [];
  for (const page of [1, 2]) {
    const url = new URL('https://himalayas.app/jobs/api/search');
    url.searchParams.set('employment_type', 'Intern');
    url.searchParams.set('sort', 'recent');
    url.searchParams.set('page', String(page));
    const payload = await fetchJson(url.toString());
    const items = getArray(payload, ['jobs', 'data', 'results']);
    jobs.push(...items);
    if (!items.length || items.length < 20) break;
  }
  return jobs.map(item => ({
    ...item,
    __source: { key: 'himalayas', label: 'Himalayas', url: SOURCE_URLS.himalayas },
    __externalId: item.guid || item.applicationLink || item.id,
    __type: 'Internship',
    title: item.title,
    companyName: item.companyName,
    summary: item.excerpt,
    description: item.excerpt || item.title,
    applicationUrl: item.applicationLink || item.guid,
    sourceUrl: SOURCE_URLS.himalayas,
    location: [...(item.locationRestrictions || []), ...((item.timezoneRestriction || item.timezoneRestrictions)?.length ? [`UTC offsets: ${(item.timezoneRestriction || item.timezoneRestrictions).join(', ')}`] : [])].join('; '),
    __deadline: null
  }));
}

async function fetchHackalendar() {
  const url = new URL('https://hackalendar.com/api/events');
  url.searchParams.set('from', new Date().toISOString().slice(0, 10));
  url.searchParams.set('limit', '100');
  const payload = await fetchJson(url.toString());
  return getArray(payload, ['data', 'events', 'results']).map(item => {
    const eventDate = pick(item.startDate, item.start_date, item.startsAt, item.starts_at, item.start, item.date);
    const registrationDeadline = pick(item.registrationDeadline, item.registration_deadline, item.applicationDeadline, item.application_deadline);
    const dateText = eventDate ? ` Event date: ${cleanText(eventDate)}.` : '';
    return {
      ...item,
      __source: { key: 'hackalendar', label: 'Hackalendar', url: SOURCE_URLS.hackalendar },
      __externalId: item.id || item.slug || item.url || item.eventUrl || item.event_url,
      __type: 'Hackathon',
      title: pick(item.title, item.name),
      organization: pick(item.organizer, item.organiser, item.host, 'Hackathon Organizer'),
      summary: `${cleanText(pick(item.summary, item.description, item.title, item.name, 'Upcoming hackathon'))}${dateText}`,
      description: cleanText(pick(item.description, item.summary)),
      applicationUrl: pick(item.registrationUrl, item.registration_url, item.registrationLink, item.registration_link, item.url, item.eventUrl, item.event_url),
      sourceUrl: SOURCE_URLS.hackalendar,
      location: pick(item.location, item.city, item.venue, ''),
      mode: pick(item.mode, item.format),
      eligibility: pick(item.eligibility, item.audience),
      __deadline: registrationDeadline
    };
  });
}

async function fetchBrabble() {
  const key = process.env.BRABBLE_API_KEY?.trim();
  if (!key) return { skipped: true, reason: 'BRABBLE_API_KEY not configured' };
  const url = new URL('https://brabble.ai/api/listings');
  url.searchParams.set('hub', 'college-students');
  url.searchParams.set('limit', '100');
  const payload = await fetchJson(url.toString(), { Authorization: `Bearer ${key}` });
  const items = getArray(payload, ['listings', 'data', 'results']);
  return items.map(item => {
    const typeText = String(item.type || '').toLowerCase();
    const date = item.deadline ? asDate(item.deadline) : null;
    return {
      ...item,
      __source: { key: 'brabble', label: 'Brabble.ai', url: SOURCE_URLS.brabble },
      __externalId: item.id,
      __type: typeText.includes('hackathon') ? 'Hackathon' : 'Competition',
      title: item.title,
      organization: item.organiser,
      summary: `${item.title} by ${item.organiser || item.platform || 'the organiser'}. ${item.mode || 'See listing for format'}${item.city ? ` · ${item.city}` : ''}${item.prize?.label && item.prize.label !== 'See listing' ? ` · Prize: ${item.prize.label}` : ''}`,
      description: `${Array.isArray(item.eligibility) ? item.eligibility.join('. ') : ''} Platform: ${item.platform || 'Organizer website'}.`,
      applicationUrl: item.url,
      sourceUrl: SOURCE_URLS.brabble,
      location: item.city || '',
      mode: item.mode,
      eligibility: item.eligibility,
      __deadline: item.kind === 'competition' ? date : null
    };
  });
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let activeSyncPromise = null;

export function syncOnlineOpportunities(actorId) {
  if (activeSyncPromise) return activeSyncPromise;
  activeSyncPromise = performOnlineSync(actorId).finally(() => { activeSyncPromise = null; });
  return activeSyncPromise;
}

async function performOnlineSync(actorId) {
  const oneHour = 60 * 60 * 1000;
  const oneDay = 24 * oneHour;
  const providers = [
    { name: 'Tech Opportunities', key: 'techopportunities', cacheMs: oneDay, fetch: fetchTechOpportunities },
    { name: 'Himalayas', key: 'himalayas', cacheMs: oneDay, fetch: fetchHimalayasInternships },
    { name: 'Hackalendar', key: 'hackalendar', cacheMs: oneHour, fetch: fetchHackalendar },
    { name: 'Brabble.ai', key: 'brabble', cacheMs: oneHour, fetch: fetchBrabble }
  ];
  const result = { imported: 0, updated: 0, skipped: 0, sources: [], failures: [], syncedAt: new Date() };

  // Respect source refresh cadence and avoid repeated requests on every server restart or button click.
  const fetched = await Promise.all(providers.map(async provider => {
    if (provider.key === 'brabble' && !process.env.BRABBLE_API_KEY?.trim()) {
      return { provider, output: { skipped: true, reason: 'BRABBLE_API_KEY not configured' } };
    }
    try {
      const state = await OnlineFeedSyncState.findOne({ source: provider.key }).lean();
      const latestSuccess = state?.lastSuccessAt ? new Date(state.lastSuccessAt).getTime() : 0;
      const existingSourceRecords = await Opportunity.countDocuments({ externalSource: provider.key, status: { $ne: 'Archived' } });
      if (latestSuccess && Date.now() - latestSuccess < provider.cacheMs && existingSourceRecords > 0) {
        return { provider, cached: true, note: `Using cached listings; last synced ${new Date(latestSuccess).toLocaleString('en-IN')}.` };
      }
      const output = await provider.fetch();
      return { provider, output };
    } catch (error) {
      return { provider, error };
    }
  }));

  for (const item of fetched) {
    const { provider } = item;
    if (item.cached) {
      result.sources.push({ name: provider.name, received: 0, imported: 0, updated: 0, skipped: 0, note: item.note });
      continue;
    }
    if (item.error) {
      result.failures.push({ source: provider.name, message: item.error.message });
      result.sources.push({ name: provider.name, received: 0, imported: 0, updated: 0, skipped: 0, error: item.error.message });
      await OnlineFeedSyncState.findOneAndUpdate(
        { source: provider.key },
        { $set: { lastAttemptAt: new Date(), lastError: item.error.message } },
        { upsert: true, new: true }
      ).catch(() => {});
      continue;
    }
    const output = item.output;
    if (output?.skipped) {
      result.sources.push({ name: provider.name, received: 0, imported: 0, updated: 0, skipped: 0, note: output.reason });
      continue;
    }

    try {
      const normalizedRecords = output.map(normalizeRecord).filter(Boolean);
      let imported = 0;
      let updated = 0;
      let skipped = output.length - normalizedRecords.length;

      for (const record of normalizedRecords) {
        // Exact provider IDs make refreshes idempotent; title fallback avoids simple cross-feed duplicates.
        let existing = await Opportunity.findOne({ externalSource: record.externalSource, externalId: record.externalId });
        let matchedByTitle = false;
        if (!existing) {
          existing = await Opportunity.findOne({
            title: new RegExp(`^${escapeRegex(record.title)}$`, 'i'),
            organization: new RegExp(`^${escapeRegex(record.organization)}$`, 'i'),
            status: { $ne: 'Archived' }
          });
          matchedByTitle = Boolean(existing);
        }
        if (existing?.status === 'Archived') { skipped += 1; continue; }
        if (matchedByTitle && existing?.externalSource && existing.externalSource !== record.externalSource) {
          skipped += 1;
          continue;
        }
        if (existing) {
          Object.assign(existing, record, { updatedBy: actorId });
          await existing.save();
          updated += 1;
        } else {
          await Opportunity.create({ ...record, createdBy: actorId, updatedBy: actorId });
          imported += 1;
        }
      }
      result.imported += imported;
      result.updated += updated;
      result.skipped += skipped;
      result.sources.push({ name: provider.name, received: output.length, imported, updated, skipped });
      await OnlineFeedSyncState.findOneAndUpdate(
        { source: provider.key },
        { $set: { lastAttemptAt: new Date(), lastSuccessAt: new Date(), lastError: '', recordCount: output.length } },
        { upsert: true, new: true }
      );
    } catch (error) {
      result.failures.push({ source: provider.name, message: error.message });
      result.sources.push({ name: provider.name, received: output.length, imported: 0, updated: 0, skipped: 0, error: error.message });
    }
  }
  result.total = await Opportunity.countDocuments({ status: { $nin: ['Archived'] }, deadlineState: { $ne: 'Closed' } });
  return result;
}
