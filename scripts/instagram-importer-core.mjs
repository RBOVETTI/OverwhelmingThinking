import { inferCategory, parseCaption, stripTitleQuotes } from './instagram-parser.mjs';

const MONTHS = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

const MANUAL_INSTAGRAM_MERGE_DECISIONS = new Map([
  ['CNz3nD9MtcE', 'COUuCkkMoj5'],
  ['CbA9RSVrIt4', 'CaxGQwsIfmU'],
  ['COUuVLfsBZt', 'CKrIJols85m'],
  ['COUtxf9sWLy', 'CNz38RoMZTw'],
  ['CFm3L3tMp2g', 'COUuM6lMk8s'],
]);
const MANUAL_INSTAGRAM_CANONICAL_CODES = new Set(MANUAL_INSTAGRAM_MERGE_DECISIONS.values());

export function buildArtworkRecord(item, options) {
  const captionText = item?.caption?.text || '';
  const parsed = parseCaption(captionText);
  const instagramCode = instagramCodeForPost(item);
  const record = {
    id: options.id,
    publicationDate: formatInstagramDate(item.taken_at),
    title: parsed.title,
    technique: parsed.technique,
    category: inferCategory(captionText, parsed.hashtags),
    price: inferPrice(captionText),
    dimensions: parsed.dimensions,
    description: parsed.description,
    image: options.image,
  };

  if (instagramCode) {
    record.instagramCode = instagramCode;
    record.instagramUrl = `https://www.instagram.com/p/${instagramCode}/`;
  }

  return record;
}

export function imageFilenameForPost(item) {
  const date = formatInstagramDate(item.taken_at);
  const code = String(instagramCodeForPost(item) || item.pk || item.id || 'post').replace(/[^a-zA-Z0-9_-]/g, '');
  return `IMG/IG_${date}_${code}.jpg`;
}

export function instagramCodeForPost(item) {
  return String(item?.code || item?.shortcode || '').replace(/[^a-zA-Z0-9_-]/g, '');
}

export function mergeArtworks(existingArtworks, importedArtworks) {
  const artworks = normalizeArtworksForSite(existingArtworks);
  const sourceArtworks = consolidateInstagramMergeDecisions(importedArtworks);
  const titleCounts = countImportedTitles(sourceArtworks);
  const dateCounts = countImportedDates(sourceArtworks);
  const consumedIndexes = new Set();
  const added = [];
  const updated = [];
  const removed = [];
  const mergedArtworks = [];

  sourceArtworks.forEach((imported) => {
    const candidates = findSourceCandidates(artworks, imported, consumedIndexes, titleCounts, dateCounts);

    if (!candidates.length) {
      if (imported.instagramImportable === false) {
        return;
      }

      const addedArtwork = cleanArtworkForSite(imported);
      mergedArtworks.push(addedArtwork);
      added.push(addedArtwork);
      return;
    }

    const [primary, ...duplicates] = candidates.sort((a, b) => compareCandidatePriority(a, b, imported));
    const existing = primary.artwork;
    const before = JSON.stringify(existing);
    const merged = mergeAuthoritativeArtwork(existing, imported, candidates.map((candidate) => candidate.artwork));

    candidates.forEach((candidate) => consumedIndexes.add(candidate.index));
    duplicates.forEach((duplicate) => removed.push(duplicate.artwork));
    mergedArtworks.push(merged);

    if (JSON.stringify(merged) !== before || duplicates.length > 0) {
      updated.push(merged);
    }
  });

  artworks.forEach((artwork, index) => {
    if (!consumedIndexes.has(index)) {
      mergedArtworks.push(artwork);
    }
  });

  mergedArtworks.sort(compareArtworksByDateDesc);
  return { artworks: mergedArtworks, added, updated, removed };
}

export function validateArtworks(artworks, options = {}) {
  const imageExists = options.imageExists || (() => true);
  const errors = [];

  artworks.forEach((artwork) => {
    if (!artwork.category) {
      errors.push(`Artwork ${artwork.id} has empty category`);
    }
    if (!requiredString(artwork.title?.it)) {
      errors.push(`Artwork ${artwork.id} has empty Italian title`);
    }
    if (!requiredString(artwork.publicationDate)) {
      errors.push(`Artwork ${artwork.id} has empty publicationDate`);
    }
    if (!requiredString(artwork.image)) {
      errors.push(`Artwork ${artwork.id} has empty image`);
    } else if (!imageExists(artwork.image)) {
      errors.push(`Artwork ${artwork.id} image file not found: ${artwork.image}`);
    }
  });

  return errors;
}

export function normalizeArtworksForSite(artworks) {
  return artworks.map((artwork) => {
    const normalized = structuredClone(artwork);
    normalized.publicationDate = normalizePublicationDate(normalized.publicationDate);
    if (!normalized.category) {
      normalized.category = inferCategory(
        [
          normalized.title?.it,
          normalized.technique?.it,
          normalized.description?.it,
          normalized.dimensions,
        ].join(' '),
        [],
      );
    }
    return normalized;
  });
}

export function formatInstagramDate(timestamp) {
  return new Date(Number(timestamp) * 1000).toISOString().slice(0, 10);
}

export function normalizePublicationDate(value) {
  const raw = String(value || '').trim();
  if (!raw) return raw;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  const match = raw.match(/^([A-Za-z]{3})\s+(\d{1,2}),\s+(\d{4})/);
  if (!match) return raw;

  const [, monthName, day, year] = match;
  const month = MONTHS[monthName.toLowerCase()];
  if (!month) return raw;

  return `${year}-${month}-${String(day).padStart(2, '0')}`;
}

function inferPrice(captionText) {
  return /\b(sold|vendut[oaie]?|gi[aà]\s+vendut[oaie]?)\b/i.test(captionText) ? 'SOLD' : '100€';
}

function mergeSparseArtwork(existing, imported) {
  fillObjectField(existing.title, imported.title, 'it');
  fillObjectField(existing.title, imported.title, 'en');
  fillObjectField(existing.technique, imported.technique, 'it');
  fillObjectField(existing.technique, imported.technique, 'en');
  fillObjectField(existing.description, imported.description, 'it');
  fillObjectField(existing.description, imported.description, 'en');

  fillField(existing, imported, 'category');
  fillField(existing, imported, 'publicationDate');
  fillField(existing, imported, 'dimensions');

  if (existing.price !== 'SOLD' && imported.price === 'SOLD') {
    existing.price = 'SOLD';
  } else {
    fillField(existing, imported, 'price');
  }
}

function mergeAuthoritativeArtwork(existing, imported, candidates) {
  const merged = cleanArtworkForSite(imported);
  const instagramCode = canonicalInstagramCode(imported.instagramCode || codeFromInstagramImage(imported.image));

  merged.id = existing.id || imported.id;
  merged.publicationDate = normalizePublicationDate(imported.publicationDate) || normalizePublicationDate(existing.publicationDate);
  merged.title = {
    it: firstString(imported.title?.it, existing.title?.it),
    en: '',
  };
  merged.technique = {
    it: firstString(imported.technique?.it, existing.technique?.it),
    en: '',
  };
  merged.description = {
    it: firstString(imported.description?.it, existing.description?.it),
    en: '',
  };
  merged.dimensions = firstString(imported.dimensions, existing.dimensions);
  merged.category = resolveCategory(candidates, imported);
  merged.price = resolvePrice(candidates, imported);
  merged.image = firstString(imported.image, existing.image);

  if (instagramCode) {
    merged.instagramCode = instagramCode;
    merged.instagramUrl = imported.instagramUrl || `https://www.instagram.com/p/${instagramCode}/`;
  }

  return merged;
}

function cleanArtworkForSite(artwork) {
  const cleaned = structuredClone(artwork);
  delete cleaned.instagramImportable;
  return cleaned;
}

function consolidateInstagramMergeDecisions(importedArtworks) {
  const result = [];
  const groups = new Map();
  const groupPositions = new Map();

  importedArtworks.forEach((artwork) => {
    const code = originalInstagramCodeForArtwork(artwork);

    if (!isManualMergeGroupCode(code)) {
      result.push(artwork);
      return;
    }

    const canonicalCode = canonicalInstagramCode(code);
    if (!groups.has(canonicalCode)) {
      groups.set(canonicalCode, []);
      groupPositions.set(canonicalCode, result.length);
      result.push(null);
    }

    groups.get(canonicalCode).push(artwork);
  });

  groups.forEach((group, canonicalCode) => {
    result[groupPositions.get(canonicalCode)] = mergeInstagramDecisionGroup(canonicalCode, group);
  });

  return result;
}

function mergeInstagramDecisionGroup(canonicalCode, group) {
  const canonicalArtwork = group.find((artwork) => originalInstagramCodeForArtwork(artwork) === canonicalCode) || group[0];
  const merged = structuredClone(canonicalArtwork);

  merged.instagramCode = canonicalCode;
  merged.instagramUrl = `https://www.instagram.com/p/${canonicalCode}/`;
  merged.instagramImportable = group.some((artwork) => artwork.instagramImportable !== false);

  group
    .filter((artwork) => artwork !== canonicalArtwork)
    .forEach((artwork) => mergeSparseArtwork(merged, artwork));

  return merged;
}

function fillField(target, source, field) {
  if (isEmpty(target[field]) && !isEmpty(source[field])) {
    target[field] = source[field];
  }
}

function fillObjectField(target = {}, source = {}, field) {
  if (isEmpty(target[field]) && !isEmpty(source[field])) {
    target[field] = source[field];
  }
}

function artworkKey(artwork) {
  return `${normalizePublicationDate(artwork.publicationDate) || ''}::${normalizeTitle(artwork.title?.it || artwork.title || '')}`;
}

function countImportedTitles(importedArtworks) {
  const counts = new Map();
  importedArtworks.forEach((artwork) => {
    const title = normalizeTitle(artwork.title?.it || artwork.title || '');
    if (!title) return;
    counts.set(title, (counts.get(title) || 0) + 1);
  });
  return counts;
}

function countImportedDates(importedArtworks) {
  const counts = new Map();
  importedArtworks.forEach((artwork) => {
    const date = normalizePublicationDate(artwork.publicationDate);
    if (!date) return;
    counts.set(date, (counts.get(date) || 0) + 1);
  });
  return counts;
}

function findSourceCandidates(artworks, imported, consumedIndexes, titleCounts, dateCounts) {
  const importedTitle = normalizeTitle(imported.title?.it || imported.title || '');
  const importedDate = normalizePublicationDate(imported.publicationDate);
  const importedCode = canonicalInstagramCode(imported.instagramCode || codeFromInstagramImage(imported.image));
  const titleIsUniqueInSources = importedTitle && titleCounts.get(importedTitle) === 1;
  const dateIsUniqueInSources = importedDate && dateCounts.get(importedDate) === 1;
  const primaryCandidates = [];
  const dateFallbackCandidates = [];

  artworks.forEach((artwork, index) => {
    if (consumedIndexes.has(index)) return;

    const artworkTitles = normalizedArtworkTitles(artwork);
    const artworkDate = normalizePublicationDate(artwork.publicationDate);
    const artworkCode = canonicalInstagramCode(artwork.instagramCode || codeFromInstagramImage(artwork.image));
    const hasSameCode = Boolean(importedCode && artworkCode === importedCode);
    const hasSameDateAndTitle = Boolean(
      importedTitle && artworkTitles.some((artworkTitle) => artworkTitle === importedTitle) && artworkDate === importedDate,
    );
    const hasUniqueSameTitle = Boolean(
      titleIsUniqueInSources && importedTitle && artworkTitles.some((artworkTitle) => artworkTitle === importedTitle),
    );
    const hasUniqueCompatibleTitle = Boolean(
      titleIsUniqueInSources &&
        importedTitle &&
        artworkTitles.some((artworkTitle) => titlesAreCompatible(artworkTitle, importedTitle)),
    );
    const hasUniqueSameDate = Boolean(dateIsUniqueInSources && artworkDate === importedDate);

    const candidate = {
        index,
        artwork,
        hasSameCode,
        hasSameDateAndTitle,
        hasUniqueSameTitle,
        hasUniqueCompatibleTitle,
        hasUniqueSameDate,
      };

    if (hasSameCode || hasSameDateAndTitle || hasUniqueSameTitle || hasUniqueCompatibleTitle) {
      primaryCandidates.push(candidate);
    } else if (hasUniqueSameDate) {
      dateFallbackCandidates.push(candidate);
    }
  });

  return primaryCandidates.length ? primaryCandidates : dateFallbackCandidates;
}

function normalizedArtworkTitles(artwork) {
  const rawTitles = typeof artwork.title === 'object'
    ? [artwork.title.it, artwork.title.en]
    : [artwork.title];

  return [...new Set(rawTitles.map(normalizeTitle).filter(Boolean))];
}

function titlesAreCompatible(left, right) {
  if (!left || !right) return false;
  if (left === right) return true;
  if (stripLeadingNon(left) === stripLeadingNon(right)) return true;

  const shorter = left.length < right.length ? left : right;
  const longer = left.length < right.length ? right : left;
  const remainder = longer.slice(shorter.length).trim();

  if (/^(numero|num|n)\b/.test(remainder)) {
    return false;
  }

  return shorter.length >= 12 && longer.startsWith(shorter);
}

function stripLeadingNon(value) {
  return String(value || '').replace(/^non\s+/, '');
}

function compareCandidatePriority(a, b, imported) {
  const importedCode = canonicalInstagramCode(originalInstagramCodeForArtwork(imported));

  if (isManualMergeGroupCode(importedCode)) {
    const aIsCanonicalReference = originalInstagramCodeForArtwork(a.artwork) === importedCode;
    const bIsCanonicalReference = originalInstagramCodeForArtwork(b.artwork) === importedCode;

    if (aIsCanonicalReference !== bIsCanonicalReference) {
      return aIsCanonicalReference ? -1 : 1;
    }
  }

  const aId = Number(a.artwork.id) || Number.MAX_SAFE_INTEGER;
  const bId = Number(b.artwork.id) || Number.MAX_SAFE_INTEGER;
  return aId - bId;
}

function originalInstagramCodeForArtwork(artwork) {
  return artwork?.instagramCode || codeFromInstagramImage(artwork?.image);
}

function canonicalInstagramCode(code) {
  return MANUAL_INSTAGRAM_MERGE_DECISIONS.get(code) || code || '';
}

function isManualMergeGroupCode(code) {
  return MANUAL_INSTAGRAM_CANONICAL_CODES.has(canonicalInstagramCode(code));
}

function codeFromInstagramImage(imagePath) {
  const match = String(imagePath || '').match(/(?:^|\/)IG_\d{4}-\d{2}-\d{2}_([A-Za-z0-9_-]+)\.jpg$/);
  return match?.[1] || '';
}

function resolveCategory(candidates, imported) {
  if (imported.category && imported.category !== 'Cows and Bulls') {
    return imported.category;
  }

  const candidateSpecific = candidates
    .map((candidate) => candidate.category)
    .find((category) => category && category !== 'Cows and Bulls' && category !== 'Photos');

  return candidateSpecific || imported.category || candidates.find((candidate) => candidate.category)?.category || 'Cows and Bulls';
}

function resolvePrice(candidates, imported) {
  const explicitCandidatePrice = candidates
    .map((candidate) => candidate.price)
    .find((price) => price && price !== '100€');

  return explicitCandidatePrice || imported.price || candidates.find((candidate) => candidate.price)?.price || '100€';
}

function firstString(...values) {
  return values.find((value) => !isEmpty(value)) || '';
}

function normalizeTitle(value) {
  return stripTitleQuotes(value)
    .replace(/&amp;/gi, 'et')
    .replace(/&/g, 'et')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’`']/g, '')
    .replace(/["“”‘’«»]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function compareArtworksByDateDesc(a, b) {
  const dateComparison = String(b.publicationDate || '').localeCompare(String(a.publicationDate || ''));
  if (dateComparison !== 0) return dateComparison;
  return Number(a.id || 0) - Number(b.id || 0);
}

function isEmpty(value) {
  return value === null || value === undefined || String(value).trim() === '';
}

function requiredString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
