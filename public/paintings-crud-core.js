(function (root) {
  'use strict';

  const KNOWN_FIELDS = [
    'id',
    'publicationDate',
    'title',
    'technique',
    'category',
    'price',
    'dimensions',
    'description',
    'image',
  ];

  function text(value) {
    return value === null || value === undefined ? '' : String(value);
  }

  function trimmed(value) {
    return text(value).trim();
  }

  function clone(value) {
    if (typeof structuredClone === 'function') {
      return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
  }

  function translated(value) {
    return {
      it: text(value && value.it),
      en: text(value && value.en),
    };
  }

  function numericId(value) {
    const id = Number(value);
    return Number.isFinite(id) && id > 0 ? id : 0;
  }

  function normalizePainting(painting) {
    const normalized = painting ? clone(painting) : {};

    normalized.id = numericId(normalized.id);
    normalized.publicationDate = text(normalized.publicationDate);
    normalized.title = translated(normalized.title);
    normalized.technique = translated(normalized.technique);
    normalized.category = text(normalized.category);
    normalized.price = text(normalized.price);
    normalized.dimensions = text(normalized.dimensions);
    normalized.description = translated(normalized.description);
    normalized.image = text(normalized.image);

    return normalized;
  }

  function paintingToFormValues(painting) {
    const normalized = normalizePainting(painting);

    return {
      id: normalized.id ? String(normalized.id) : '',
      publicationDate: normalized.publicationDate,
      category: normalized.category,
      price: normalized.price,
      dimensions: normalized.dimensions,
      image: normalized.image,
      titleIt: normalized.title.it,
      titleEn: normalized.title.en,
      techniqueIt: normalized.technique.it,
      techniqueEn: normalized.technique.en,
      descriptionIt: normalized.description.it,
      descriptionEn: normalized.description.en,
    };
  }

  function formValuesToPainting(values, previousPainting) {
    const painting = normalizePainting(previousPainting);

    painting.id = numericId(values.id);
    painting.publicationDate = trimmed(values.publicationDate);
    painting.title = {
      it: trimmed(values.titleIt),
      en: trimmed(values.titleEn),
    };
    painting.technique = {
      it: trimmed(values.techniqueIt),
      en: trimmed(values.techniqueEn),
    };
    painting.category = trimmed(values.category);
    painting.price = trimmed(values.price);
    painting.dimensions = trimmed(values.dimensions);
    painting.description = {
      it: trimmed(values.descriptionIt),
      en: trimmed(values.descriptionEn),
    };
    painting.image = trimmed(values.image);

    return painting;
  }

  function nextPaintingId(paintings) {
    return (paintings || []).reduce((max, painting) => {
      return Math.max(max, numericId(painting && painting.id));
    }, 0) + 1;
  }

  function createEmptyPainting(paintings) {
    return {
      id: nextPaintingId(paintings),
      publicationDate: '',
      title: { it: '', en: '' },
      technique: { it: '', en: '' },
      category: 'Cows and Bulls',
      price: '100\u20ac',
      dimensions: '',
      description: { it: '', en: '' },
      image: '',
    };
  }

  function moveIndex(currentIndex, delta, length) {
    if (!length) {
      return -1;
    }

    if (!Number.isInteger(currentIndex)) {
      return 0;
    }

    const start = currentIndex;
    return (start + delta + length) % length;
  }

  function validatePaintingsForSave(paintings) {
    const errors = [];
    const ids = new Map();

    (paintings || []).forEach((painting, index) => {
      const position = index + 1;
      const id = numericId(painting && painting.id);

      if (id) {
        if (ids.has(id)) {
          errors.push(`ID duplicato: ${id}`);
        } else {
          ids.set(id, position);
        }
      }

      if (!trimmed(painting && painting.title && painting.title.it)) {
        errors.push(`Record ${position}: titolo IT mancante`);
      }
      if (!trimmed(painting && painting.publicationDate)) {
        errors.push(`Record ${position}: data pubblicazione mancante`);
      }
      if (!trimmed(painting && painting.image)) {
        errors.push(`Record ${position}: immagine mancante`);
      }
    });

    return errors;
  }

  function serializePaintings(paintings) {
    return `${JSON.stringify(paintings || [], null, 2)}\n`;
  }

  function includesQuery(value, query) {
    return text(value).toLowerCase().includes(query);
  }

  function filterPaintingIndexes(paintings, query) {
    const normalizedQuery = trimmed(query).toLowerCase();
    if (!normalizedQuery) {
      return (paintings || []).map((_, index) => index);
    }

    return (paintings || []).reduce((matches, painting, index) => {
      const searchable = [
        painting && painting.id,
        painting && painting.publicationDate,
        painting && painting.title && painting.title.it,
        painting && painting.title && painting.title.en,
        painting && painting.category,
        painting && painting.image,
      ];

      if (searchable.some((value) => includesQuery(value, normalizedQuery))) {
        matches.push(index);
      }
      return matches;
    }, []);
  }

  function fieldOptionValue(painting, fieldName) {
    if (!painting) {
      return '';
    }

    switch (fieldName) {
      case 'category':
        return painting.category;
      case 'price':
        return painting.price;
      case 'dimensions':
        return painting.dimensions;
      case 'image':
        return painting.image;
      case 'techniqueIt':
        return painting.technique && painting.technique.it;
      case 'techniqueEn':
        return painting.technique && painting.technique.en;
      default:
        return '';
    }
  }

  function valueOptionsForField(paintings, fieldName, defaults) {
    const options = [];
    const seen = new Set();

    function add(value) {
      const option = trimmed(value);
      const key = option.toLowerCase();
      if (!option || seen.has(key)) {
        return;
      }
      seen.add(key);
      options.push(option);
    }

    (defaults || []).forEach(add);

    const observed = [];
    (paintings || []).forEach((painting) => {
      const option = trimmed(fieldOptionValue(painting, fieldName));
      if (option) {
        observed.push(option);
      }
    });

    observed.sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' })).forEach(add);

    return options;
  }

  function knownFieldNames() {
    return KNOWN_FIELDS.slice();
  }

  root.PaintingsCrudCore = {
    createEmptyPainting,
    filterPaintingIndexes,
    formValuesToPainting,
    knownFieldNames,
    moveIndex,
    nextPaintingId,
    normalizePainting,
    paintingToFormValues,
    serializePaintings,
    valueOptionsForField,
    validatePaintingsForSave,
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
