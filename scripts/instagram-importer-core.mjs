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

export function buildArtworkRecord(item, options) {
  const captionText = item?.caption?.text || '';
  const parsed = parseCaption(captionText);

  return {
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
}

export function imageFilenameForPost(item) {
  const date = formatInstagramDate(item.taken_at);
  const code = String(item.code || item.shortcode || item.pk || item.id || 'post').replace(/[^a-zA-Z0-9_-]/g, '');
  return `IMG/IG_${date}_${code}.jpg`;
}

export function mergeArtworks(existingArtworks, importedArtworks) {
  const artworks = normalizeArtworksForSite(existingArtworks);
  const byKey = new Map(artworks.map((artwork) => [artworkKey(artwork), artwork]));
  const added = [];
  const updated = [];

  importedArtworks.forEach((imported) => {
    const existing = byKey.get(artworkKey(imported));
    if (!existing) {
      artworks.push(structuredClone(imported));
      added.push(imported);
      return;
    }

    const before = JSON.stringify(existing);
    mergeSparseArtwork(existing, imported);
    if (JSON.stringify(existing) !== before) {
      updated.push(existing);
    }
  });

  artworks.sort(compareArtworksByDateDesc);
  return { artworks, added, updated };
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

function normalizeTitle(value) {
  return stripTitleQuotes(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’`]/g, "'")
    .replace(/["“”‘’«»]/g, '')
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
