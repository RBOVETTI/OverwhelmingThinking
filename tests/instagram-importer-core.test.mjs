import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildArtworkRecord,
  imageFilenameForPost,
  mergeArtworks,
  normalizeArtworksForSite,
  validateArtworks,
} from '../scripts/instagram-importer-core.mjs';

test('buildArtworkRecord creates a Paintings.json-compatible record from an Instagram item', () => {
  const record = buildArtworkRecord(
    {
      code: 'DaX9CCrtEQh',
      taken_at: 1783175227,
      caption: {
        text: `Fonti fossili e verdura
40x40 cm - olio, grafite ed acrilico su tela nuova

C'e un'ironia sottile nel titolo.`,
      },
    },
    {
      id: 100,
      image: 'IMG/IG_2026-07-04_DaX9CCrtEQh.jpg',
    },
  );

  assert.equal(record.id, 100);
  assert.equal(record.publicationDate, '2026-07-04');
  assert.equal(record.title.it, 'Fonti fossili e verdura');
  assert.equal(record.technique.it, 'olio, grafite ed acrilico su tela nuova');
  assert.equal(record.dimensions, '40x40 cm');
  assert.equal(record.description.it, "C'e un'ironia sottile nel titolo.");
  assert.equal(record.category, 'Cows and Bulls');
  assert.equal(record.price, '100€');
  assert.equal(record.image, 'IMG/IG_2026-07-04_DaX9CCrtEQh.jpg');
});

test('buildArtworkRecord marks sold only when caption explicitly says sold or venduto', () => {
  const record = buildArtworkRecord(
    {
      code: 'soldpost',
      taken_at: 1783175227,
      caption: {
        text: `Opera venduta
40x40 cm
Acrilico su tela nuova

Pezzo gia venduto.`,
      },
    },
    {
      id: 101,
      image: 'IMG/IG_2026-07-04_soldpost.jpg',
    },
  );

  assert.equal(record.price, 'SOLD');
});

test('imageFilenameForPost is stable and filesystem-safe', () => {
  assert.equal(
    imageFilenameForPost({ code: 'DaX9CCrtEQh', taken_at: 1783175227 }),
    'IMG/IG_2026-07-04_DaX9CCrtEQh.jpg',
  );
});

test('mergeArtworks updates sparse existing matches and prepends newer imported records', () => {
  const existing = [
    {
      id: 1,
      publicationDate: '2025-09-28',
      title: { it: "È tempo di tornare dall'alpeggio", en: '' },
      technique: { it: '', en: '' },
      category: null,
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/1.jpg',
    },
  ];
  const imported = [
    {
      id: 100,
      publicationDate: '2026-07-04',
      title: { it: 'Fonti fossili e verdura', en: '' },
      technique: { it: 'olio su tela', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '40x40 cm',
      description: { it: 'Descrizione nuova.', en: '' },
      image: 'IMG/IG_2026-07-04_DaX9CCrtEQh.jpg',
    },
    {
      id: 101,
      publicationDate: '2025-09-28',
      title: { it: "È tempo di tornare dall'alpeggio", en: '' },
      technique: { it: 'Acrilico bagnato su tela nuova', en: '' },
      category: 'Cows and Bulls',
      price: 'SOLD',
      dimensions: '50x70 cm',
      description: { it: 'Descrizione recuperata.', en: '' },
      image: 'IMG/IG_2025-09-28_DPJzWWEjNut.jpg',
    },
  ];

  const { artworks, added, updated } = mergeArtworks(existing, imported);

  assert.equal(added.length, 1);
  assert.equal(updated.length, 1);
  assert.equal(artworks[0].title.it, 'Fonti fossili e verdura');
  assert.equal(artworks[1].id, 1);
  assert.equal(artworks[1].category, 'Cows and Bulls');
  assert.equal(artworks[1].technique.it, 'Acrilico bagnato su tela nuova');
  assert.equal(artworks[1].image, 'IMG/1.jpg');
});

test('mergeArtworks matches legacy Instagram date strings against ISO dates', () => {
  const existing = [
    {
      id: 41,
      publicationDate: 'Sep 14, 2024',
      title: { it: 'Fuck the Jellyfish', en: '' },
      technique: { it: 'Acrilico e pastello ad olio su tela riciclata - parte di trittico', en: '' },
      category: null,
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/41_FucktheJel.jpg',
    },
  ];
  const imported = [
    {
      id: 155,
      publicationDate: '2024-09-14',
      title: { it: 'Fuck the Jellyfish', en: '' },
      technique: { it: 'Acrilico e pastello ad olio su tela riciclata - parte di trittico', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '50x50 cm',
      description: { it: 'Descrizione recuperata.', en: '' },
      image: 'IMG/IG_2024-09-14_C_53DivoOGj.jpg',
    },
  ];

  const { artworks, added, updated } = mergeArtworks(existing, imported);

  assert.equal(added.length, 0);
  assert.equal(updated.length, 1);
  assert.equal(artworks[0].id, 41);
  assert.equal(artworks[0].publicationDate, '2024-09-14');
  assert.equal(artworks[0].category, 'Cows and Bulls');
  assert.equal(artworks[0].image, 'IMG/41_FucktheJel.jpg');
});

test('validateArtworks reports null categories and missing image files', () => {
  const errors = validateArtworks(
    [
      {
        id: 1,
        publicationDate: '2026-07-04',
        title: { it: 'Titolo', en: '' },
        technique: { it: 'Acrilico', en: '' },
        category: null,
        price: '100€',
        dimensions: '40x40 cm',
        description: { it: 'Descrizione', en: '' },
        image: 'IMG/missing.jpg',
      },
    ],
    {
      imageExists: () => false,
    },
  );

  assert.deepEqual(errors, [
    'Artwork 1 has empty category',
    'Artwork 1 image file not found: IMG/missing.jpg',
  ]);
});

test('normalizeArtworksForSite fills null categories without changing existing categories', () => {
  const artworks = normalizeArtworksForSite([
    {
      id: 1,
      publicationDate: '2026-07-04',
      title: { it: 'Studio cromatico', en: '' },
      technique: { it: 'Acrilico su tela', en: '' },
      category: null,
      price: '100€',
      dimensions: '40x40 cm',
      description: { it: 'Descrizione', en: '' },
      image: 'IMG/one.jpg',
    },
    {
      id: 2,
      publicationDate: '2026-07-05',
      title: { it: 'Acromie umorali', en: '' },
      technique: { it: 'Acrilico su tela', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '40x40 cm',
      description: { it: 'Descrizione', en: '' },
      image: 'IMG/two.jpg',
    },
  ]);

  assert.equal(artworks[0].category, 'Cows and Bulls');
  assert.equal(artworks[1].category, 'Semi Abstract');
});
