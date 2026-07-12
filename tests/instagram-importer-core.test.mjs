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
  assert.equal(artworks[1].image, 'IMG/IG_2025-09-28_DPJzWWEjNut.jpg');
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
  assert.equal(artworks[0].image, 'IMG/IG_2024-09-14_C_53DivoOGj.jpg');
});

test('mergeArtworks reconciles shifted legacy records with their Instagram source and drops imported duplicates', () => {
  const existing = [
    {
      id: 12,
      publicationDate: '2025-05-18',
      title: { it: 'Non sono stato io', en: 'Wrong shifted translation' },
      technique: { it: 'Old technique', en: '' },
      category: 'Cows and Bulls',
      price: 'SOLD',
      dimensions: 'old dimensions',
      description: { it: 'Old description', en: 'Wrong shifted description' },
      image: 'IMG/12_“Nonsonost.jpg',
    },
    {
      id: 127,
      publicationDate: '2025-05-11',
      title: { it: 'Non sono stato io', en: '' },
      technique: { it: 'Dimensioni: (dipinto), (con cornice)', en: '' },
      category: 'Photos',
      price: '100€',
      dimensions: '36x46 cm',
      description: { it: 'Imported duplicate description', en: '' },
      image: 'IMG/IG_2025-05-11_DJhE1BSo3XP.jpg',
    },
  ];
  const imported = [
    {
      id: 400,
      publicationDate: '2025-05-11',
      title: { it: 'Non sono stato io', en: '' },
      technique: { it: 'Olio, acrilico e grafite su tela montata su tavola di legno', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '36x46 cm',
      description: { it: 'Instagram source description', en: '' },
      image: 'IMG/IG_2025-05-11_DJhE1BSo3XP.jpg',
      instagramCode: 'DJhE1BSo3XP',
      instagramUrl: 'https://www.instagram.com/p/DJhE1BSo3XP/',
    },
  ];

  const { artworks, added, updated, removed } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(updated.length, 1);
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 127);
  assert.equal(artworks[0].id, 12);
  assert.equal(artworks[0].publicationDate, '2025-05-11');
  assert.equal(artworks[0].image, 'IMG/IG_2025-05-11_DJhE1BSo3XP.jpg');
  assert.equal(artworks[0].price, 'SOLD');
  assert.equal(artworks[0].category, 'Cows and Bulls');
  assert.equal(artworks[0].instagramCode, 'DJhE1BSo3XP');
  assert.equal(artworks[0].title.en, '');
  assert.equal(artworks[0].description.it, 'Instagram source description');
});

test('mergeArtworks prefers title/code matches over unique-date fallback for shifted legacy rows', () => {
  const existing = [
    {
      id: 12,
      publicationDate: '2025-05-18',
      title: { it: 'Non sono stato io', en: '' },
      technique: { it: 'Old Non sono technique', en: '' },
      category: 'Cows and Bulls',
      price: 'SOLD',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/12_“Nonsonost.jpg',
    },
    {
      id: 13,
      publicationDate: '2025-05-11',
      title: { it: 'Guardando al futuro con aspettativa e scetticismo, in eguale misura', en: '' },
      technique: { it: 'Old Guardando technique', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/13_“Guardando.jpg',
    },
    {
      id: 126,
      publicationDate: '2025-05-18',
      title: { it: 'Beata, la gioventù', en: '' },
      technique: { it: 'Olio e grafite', en: '' },
      category: 'Cows and Bulls',
      price: 'NON DISPONIBILE',
      dimensions: '36x46 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2025-05-18_DJyrMvPoWli.jpg',
      instagramCode: 'DJyrMvPoWli',
    },
  ];
  const imported = [
    {
      id: 400,
      publicationDate: '2025-05-18',
      title: { it: 'Beata, la gioventù', en: '' },
      technique: { it: 'Olio e grafite', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '36x46 cm',
      description: { it: 'Beata source.', en: '' },
      image: 'IMG/IG_2025-05-18_DJyrMvPoWli.jpg',
      instagramCode: 'DJyrMvPoWli',
    },
    {
      id: 401,
      publicationDate: '2025-05-11',
      title: { it: 'Non sono stato io', en: '' },
      technique: { it: 'Olio, acrilico e grafite', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '36x46 cm',
      description: { it: 'Non sono source.', en: '' },
      image: 'IMG/IG_2025-05-11_DJhE1BSo3XP.jpg',
      instagramCode: 'DJhE1BSo3XP',
    },
  ];

  const { artworks } = mergeArtworks(existing, imported);
  const nonSono = artworks.find((artwork) => artwork.instagramCode === 'DJhE1BSo3XP');
  const beata = artworks.find((artwork) => artwork.instagramCode === 'DJyrMvPoWli');

  assert.equal(nonSono.id, 12);
  assert.equal(nonSono.publicationDate, '2025-05-11');
  assert.equal(nonSono.price, 'SOLD');
  assert.equal(beata.id, 126);
  assert.equal(beata.price, 'NON DISPONIBILE');
});

test('mergeArtworks matches legacy titles that include technique after the Instagram title', () => {
  const existing = [
    {
      id: 58,
      publicationDate: '2023-07-02',
      title: {
        it: 'Autoritratto di altra persona Acrilico e pastello ad olio su tela di recupero preparata a gesso',
        en: 'Autoritratto di altra persona Acrilico e pastello ad olio su tela di recupero preparata a gesso',
      },
      technique: { it: '', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/58_“Autoritra.jpg',
    },
  ];
  const imported = [
    {
      id: 401,
      publicationDate: '2023-07-02',
      title: { it: 'Autoritratto di altra persona', en: '' },
      technique: { it: 'Acrilico e pastello ad olio su tela di recupero preparata a gesso', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '50x70 cm',
      description: { it: 'Descrizione dalla caption Instagram.', en: '' },
      image: 'IMG/IG_2023-07-02_CuMRcbfoHCu.jpg',
      instagramCode: 'CuMRcbfoHCu',
    },
  ];

  const { artworks, added, updated } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(updated.length, 1);
  assert.equal(artworks[0].id, 58);
  assert.equal(artworks[0].title.it, 'Autoritratto di altra persona');
  assert.equal(artworks[0].title.en, '');
  assert.equal(artworks[0].image, 'IMG/IG_2023-07-02_CuMRcbfoHCu.jpg');
  assert.equal(artworks[0].instagramCode, 'CuMRcbfoHCu');
});

test('mergeArtworks can use non-importable Instagram posts to reconcile existing records without adding new ones', () => {
  const existing = [
    {
      id: 57,
      publicationDate: '2023-08-15',
      title: { it: 'OverCOWded stampa su maglietta con matrice linoleum', en: '' },
      technique: { it: '', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/57_“OverCOWde.jpg',
    },
  ];
  const imported = [
    {
      id: 402,
      publicationDate: '2023-08-15',
      title: { it: 'OverCOWded', en: '' },
      technique: { it: '', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/IG_2023-08-15_Cv91E0lIHty.jpg',
      instagramCode: 'Cv91E0lIHty',
      instagramImportable: false,
    },
    {
      id: 403,
      publicationDate: '2023-08-16',
      title: { it: 'Post editoriale non opera', en: '' },
      technique: { it: '', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/IG_2023-08-16_editorial.jpg',
      instagramCode: 'editorial',
      instagramImportable: false,
    },
  ];

  const { artworks, added, updated } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(updated.length, 1);
  assert.equal(artworks[0].id, 57);
  assert.equal(artworks[0].title.it, 'OverCOWded');
  assert.equal(artworks[0].image, 'IMG/IG_2023-08-15_Cv91E0lIHty.jpg');
  assert.equal(artworks[0].instagramCode, 'Cv91E0lIHty');
  assert.equal(artworks[0].instagramImportable, undefined);
});

test('mergeArtworks ignores apostrophe differences when matching legacy titles', () => {
  const existing = [
    {
      id: 81,
      publicationDate: '2023-02-11',
      title: {
        it: 'Lora che segnano le meridiane di notte progetto protoartistico su commissione',
        en: '',
      },
      technique: { it: '', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/81_“L’oraches.jpg',
    },
  ];
  const imported = [
    {
      id: 404,
      publicationDate: '2023-02-11',
      title: { it: 'L’ora che segnano le meridiane di notte', en: '' },
      technique: { it: 'Acrilico e pastello ad olio su tela di juta', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '72x62 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2023-02-11_CoiBPOHIPYX.jpg',
      instagramCode: 'CoiBPOHIPYX',
    },
    {
      id: 405,
      publicationDate: '2023-02-11',
      title: { it: 'A-social networks', en: '' },
      technique: { it: 'Acrilico su tela', en: '' },
      category: 'Semi Abstract',
      price: '100€',
      dimensions: '50x50 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2023-02-11_CoiBpE4IuPk.jpg',
      instagramCode: 'CoiBpE4IuPk',
      instagramImportable: false,
    },
  ];

  const { artworks, added } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(artworks[0].id, 81);
  assert.equal(artworks[0].title.it, 'L’ora che segnano le meridiane di notte');
  assert.equal(artworks[0].instagramCode, 'CoiBPOHIPYX');
});

test('mergeArtworks matches titles when Instagram omits a leading non', () => {
  const existing = [
    {
      id: 35,
      publicationDate: '2024-10-27',
      title: { it: 'Non può piovere per sempre', en: '' },
      technique: { it: 'Acrilico su tela nuova', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '50x70 cm',
      description: { it: '', en: '' },
      image: 'IMG/35_puòpiovere.jpg',
    },
  ];
  const imported = [
    {
      id: 406,
      publicationDate: '2024-10-27',
      title: { it: 'può piovere per sempre', en: '' },
      technique: { it: 'Acrilico su tela nuova', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '50x70 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2024-10-27_DBoubS5ubld.jpg',
      instagramCode: 'DBoubS5ubld',
    },
    {
      id: 407,
      publicationDate: '2024-10-27',
      title: { it: 'Altro post stesso giorno', en: '' },
      technique: { it: '', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/IG_2024-10-27_other.jpg',
      instagramCode: 'other',
      instagramImportable: false,
    },
  ];

  const { artworks, added } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(artworks[0].id, 35);
  assert.equal(artworks[0].instagramCode, 'DBoubS5ubld');
});

test('mergeArtworks does not merge base titles with numbered variants', () => {
  const existing = [
    {
      id: 92,
      publicationDate: '2022-12-25',
      title: { it: 'Dell’esser sovente in errore ma mai nel dubbio (numero 2)', en: '' },
      technique: { it: 'Acrilico e pastello a olio', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '120x82 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2022-12-25_CmmIVpYotof.jpg',
      instagramCode: 'CmmIVpYotof',
    },
    {
      id: 572,
      publicationDate: '2021-12-30',
      title: { it: 'Dell’esser sovente in errore ma mai nel dubbio', en: '' },
      technique: { it: 'Acrilico su tela di recupero', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '50x50 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2021-12-30_CYHHxDQIpXG.jpg',
      instagramCode: 'CYHHxDQIpXG',
    },
  ];
  const imported = [
    {
      id: 408,
      publicationDate: '2022-12-25',
      title: { it: 'Dell’esser sovente in errore ma mai nel dubbio (numero 2)', en: '' },
      technique: { it: 'Acrilico e pastello a olio', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '120x82 cm',
      description: { it: '', en: '' },
      image: 'IMG/IG_2022-12-25_CmmIVpYotof.jpg',
      instagramCode: 'CmmIVpYotof',
    },
  ];

  const { artworks, removed } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 2);
  assert.equal(removed.length, 0);
  assert.ok(artworks.find((artwork) => artwork.instagramCode === 'CYHHxDQIpXG'));
  assert.ok(artworks.find((artwork) => artwork.instagramCode === 'CmmIVpYotof'));
});

test('mergeArtworks applies manual Instagram duplicate decisions and keeps the selected reference', () => {
  const existing = [
    {
      id: 303,
      publicationDate: '2021-05-01',
      title: { it: 'Ipostasi come assolutizzazione di principio relativo', en: '' },
      technique: { it: 'Acrilico su tela', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: 'Dettagli asta recuperati dal post duplicato.', en: '' },
      image: 'IMG/IG_2021-05-01_COUuVLfsBZt.jpg',
      instagramCode: 'COUuVLfsBZt',
    },
    {
      id: 331,
      publicationDate: '2021-01-30',
      title: { it: 'Ipostasi come assolutizzazione di principio relativo', en: '' },
      technique: { it: 'acrilico su tela 50x50', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/IG_2021-01-30_CKrIJols85m.jpg',
      instagramCode: 'CKrIJols85m',
    },
  ];
  const imported = [
    {
      id: 600,
      publicationDate: '2021-05-01',
      title: { it: 'Ipostasi come assolutizzazione di principio relativo', en: '' },
      technique: { it: 'Acrilico su tela', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: 'Dettagli asta recuperati dal post duplicato.', en: '' },
      image: 'IMG/IG_2021-05-01_COUuVLfsBZt.jpg',
      instagramCode: 'COUuVLfsBZt',
    },
    {
      id: 601,
      publicationDate: '2021-01-30',
      title: { it: 'Ipostasi come assolutizzazione di principio relativo', en: '' },
      technique: { it: 'acrilico su tela 50x50', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: 'IMG/IG_2021-01-30_CKrIJols85m.jpg',
      instagramCode: 'CKrIJols85m',
    },
  ];

  const { artworks, added, updated, removed } = mergeArtworks(existing, imported);

  assert.equal(artworks.length, 1);
  assert.equal(added.length, 0);
  assert.equal(updated.length, 1);
  assert.equal(removed.length, 1);
  assert.equal(removed[0].id, 303);
  assert.equal(artworks[0].id, 331);
  assert.equal(artworks[0].publicationDate, '2021-01-30');
  assert.equal(artworks[0].image, 'IMG/IG_2021-01-30_CKrIJols85m.jpg');
  assert.equal(artworks[0].instagramCode, 'CKrIJols85m');
  assert.equal(artworks[0].description.it, 'Dettagli asta recuperati dal post duplicato.');
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
