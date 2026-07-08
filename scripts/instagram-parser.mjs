const DEFAULT_CATEGORY = 'Cows and Bulls';

const ARTWORK_SIGNAL_RE =
  /\b(cm|acrilico|olio|grafite|tela|carta|cartoncino|pastello|linoleografia|china|tempera|pennarello|supporto|forex|masonite|legno|gesso|cornice|collage|inchiostro)\b/i;

const DIMENSION_RE =
  /(?:circa\s*)?(?:\d+(?:[.,]\d+)?\s*[x×]\s*\d+(?:[.,]\d+)?(?:\s*[x×]\s*\d+(?:[.,]\d+)?)?\s*cm|formato\s*A\d+|A\d+)/i;

const HASH_TAG_RE = /#([\p{L}\p{N}_-]+)/gu;

const COMBINED_TITLE_DETAIL_RE =
  /\b(dittico|serie|progetto protoartistico|acrilico|olio|grafite|linoleografia|china|tempera|pastell[oi]|pennarello|stampa|mixed media)\b/i;

export function parseCaption(captionText) {
  const text = String(captionText || '').replace(/\r\n?/g, '\n').trim();
  const hashtags = extractHashtags(text);
  const rawLines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !isSeparatorLine(line));

  const lines = splitCombinedTitleLine(rawLines);
  const titleLineIndex = lines.findIndex((line) => !isHashtagOnlyLine(line));
  const titleLine = titleLineIndex === -1 ? '' : lines[titleLineIndex];
  const title = stripTitleQuotes(removeInlineHashtags(titleLine));

  let dimensions = '';
  let technique = '';
  let dimensionLineIndex = -1;
  let techniqueLineIndex = -1;

  lines.forEach((line, index) => {
    if (index === titleLineIndex || isHashtagOnlyLine(line) || dimensions) return;
    const dimensionParts = extractDimensionParts(line);
    if (!dimensionParts) return;

    dimensions = dimensionParts.dimensions;
    dimensionLineIndex = index;

    if (dimensionParts.rest && ARTWORK_SIGNAL_RE.test(dimensionParts.rest)) {
      technique = cleanTechnique(dimensionParts.rest);
      techniqueLineIndex = index;
    }
  });

  if (!technique) {
    lines.forEach((line, index) => {
      if (index === titleLineIndex || index === dimensionLineIndex || technique || isHashtagOnlyLine(line)) return;
      const withoutTags = removeInlineHashtags(line);
      if (!ARTWORK_SIGNAL_RE.test(withoutTags)) return;

      const dimensionParts = extractDimensionParts(withoutTags);
      technique = cleanTechnique(dimensionParts?.rest || withoutTags);
      techniqueLineIndex = index;
    });
  }

  const description = lines
    .filter((line, index) => index !== titleLineIndex && index !== dimensionLineIndex && index !== techniqueLineIndex)
    .filter((line) => !isHashtagOnlyLine(line))
    .map(removeInlineHashtags)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n\n')
    .trim();

  return {
    title: { it: title, en: '' },
    technique: { it: technique, en: '' },
    dimensions,
    description: { it: description, en: '' },
    hashtags,
  };
}

export function isLikelyArtworkPost(item) {
  const captionText = item?.caption?.text || '';
  if (!captionText.trim()) return false;

  const parsed = parseCaption(captionText);
  const signalCount = [
    Boolean(parsed.dimensions),
    Boolean(parsed.technique.it),
    ARTWORK_SIGNAL_RE.test(captionText),
    /#(artedelsabato|riccardobovettiart|semiabstractacrylics|artecontemporanea|contemporarypainting|mixedmedia|bovini|animalart)\b/i.test(
      captionText,
    ),
  ].filter(Boolean).length;

  return signalCount >= 2;
}

export function inferCategory(text, hashtags = []) {
  const haystack = `${text || ''} ${hashtags.join(' ')}`.toLowerCase();

  if (/\b(semiabstractacrylics|semi[-\s]?abstract|semi astratt)/i.test(haystack)) {
    return 'Semi Abstract';
  }

  if (/\b(pureabstract|abstract|astratto puro|astratti)\b/i.test(haystack)) {
    return 'Pure Abstract';
  }

  if (/\b(photo|fotografia|foto)\b/i.test(haystack)) {
    return 'Photos';
  }

  if (/\b(mucca|mucche|toro|tori|bovino|bovina|bovini|cow|cows|bull|bulls|animalart)\b/i.test(haystack)) {
    return 'Cows and Bulls';
  }

  return DEFAULT_CATEGORY;
}

export function stripTitleQuotes(value) {
  return String(value || '')
    .trim()
    .replace(/^[\s"'“”‘’«»]+/, '')
    .replace(/[\s"'“”‘’«»]+$/, '')
    .trim();
}

function extractHashtags(text) {
  return [...String(text || '').matchAll(HASH_TAG_RE)].map((match) => match[1]);
}

function removeInlineHashtags(line) {
  return String(line || '')
    .replace(HASH_TAG_RE, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractDimensionParts(line) {
  const match = String(line || '').match(DIMENSION_RE);
  if (!match) return null;

  const dimensions = normalizeDimensions(match[0]);
  const before = line.slice(0, match.index).trim();
  const after = line.slice(match.index + match[0].length).trim();
  const rest = `${before} ${after}`
    .replace(/^[\s:;,.–—-]+/, '')
    .replace(/[\s:;,.–—-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { dimensions, rest };
}

function normalizeDimensions(value) {
  return String(value || '')
    .replace(/formato\s*/i, '')
    .replace(/×/g, 'x')
    .replace(/\s*x\s*/gi, 'x')
    .replace(/\s*cm\b/i, ' cm')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanTechnique(value) {
  return String(value || '')
    .replace(DIMENSION_RE, '')
    .replace(/^[\s:;,.–—-]+/, '')
    .replace(/[\s:;,.–—-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function splitCombinedTitleLine(rawLines) {
  if (!rawLines.length) return rawLines;

  const titleIndex = rawLines.findIndex((line) => !isHashtagOnlyLine(line));
  if (titleIndex === -1) return rawLines;

  const firstLine = removeInlineHashtags(rawLines[titleIndex]);
  if (!ARTWORK_SIGNAL_RE.test(firstLine)) return rawLines;

  const marker = firstLine.match(COMBINED_TITLE_DETAIL_RE);
  if (!marker || !marker.index || marker.index < 4) return rawLines;

  const titleLine = firstLine
    .slice(0, marker.index)
    .replace(/[\s:;–—-]+$/, '')
    .trim();
  const detailLine = firstLine.slice(marker.index).trim();
  if (!titleLine || !detailLine) return rawLines;

  return [...rawLines.slice(0, titleIndex), titleLine, detailLine, ...rawLines.slice(titleIndex + 1)];
}

function isSeparatorLine(line) {
  return /^[\s\-–—⸻]+$/.test(line);
}

function isHashtagOnlyLine(line) {
  const withoutTags = removeInlineHashtags(line).replace(/["“”‘’«»\s]+/g, '');
  return withoutTags.length === 0 && /#[\p{L}\p{N}_-]+/u.test(line);
}
