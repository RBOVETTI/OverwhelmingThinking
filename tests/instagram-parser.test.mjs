import test from 'node:test';
import assert from 'node:assert/strict';

import {
  inferCategory,
  isLikelyArtworkPost,
  parseCaption,
} from '../scripts/instagram-parser.mjs';

test('parseCaption extracts title, dimensions, technique, description, and removes hashtags', () => {
  const caption = `Fonti fossili e verdura
40x40 cm - olio, grafite ed acrilico su tela nuova

C'e un'ironia sottile nel titolo, ma non e satira. E piuttosto la constatazione di una convivenza paradossale.

#artedelsabato #riccardobovettiart #artecontemporanea #contemporarypainting`;

  const parsed = parseCaption(caption);

  assert.equal(parsed.title.it, 'Fonti fossili e verdura');
  assert.equal(parsed.dimensions, '40x40 cm');
  assert.equal(parsed.technique.it, 'olio, grafite ed acrilico su tela nuova');
  assert.equal(
    parsed.description.it,
    "C'e un'ironia sottile nel titolo, ma non e satira. E piuttosto la constatazione di una convivenza paradossale.",
  );
  assert.deepEqual(parsed.hashtags, [
    'artedelsabato',
    'riccardobovettiart',
    'artecontemporanea',
    'contemporarypainting',
  ]);
});

test('parseCaption strips title quotes and handles dimensions joined to cm', () => {
  const caption = `“È tempo di tornare dall'alpeggio”
50x70cm
Acrilico bagnato su tela nuova, inchiodata su telaio di recupero

L'animale avanza al centro della scena, come emerso da un velo di nebbia alpina.`;

  const parsed = parseCaption(caption);

  assert.equal(parsed.title.it, "È tempo di tornare dall'alpeggio");
  assert.equal(parsed.dimensions, '50x70 cm');
  assert.equal(
    parsed.technique.it,
    'Acrilico bagnato su tela nuova, inchiodata su telaio di recupero',
  );
  assert.equal(
    parsed.description.it,
    "L'animale avanza al centro della scena, come emerso da un velo di nebbia alpina.",
  );
});

test('parseCaption splits first-line title from technique when Instagram caption combines them', () => {
  const caption = `Essere ed essente. dittico formato da due schizzi a grafite e inchiostro su carta formato A3.

Due figure apparentemente simili ma profondamente diverse: una resta, l'altra avanza.`;

  const parsed = parseCaption(caption);

  assert.equal(parsed.title.it, 'Essere ed essente.');
  assert.equal(parsed.dimensions, 'A3');
  assert.equal(parsed.technique.it, 'dittico formato da due schizzi a grafite e inchiostro su carta');
  assert.equal(
    parsed.description.it,
    "Due figure apparentemente simili ma profondamente diverse: una resta, l'altra avanza.",
  );
});

test('parseCaption skips leading hashtag-only lines before the real artwork title', () => {
  const caption = `#oramaiFase3”
“Tra un po’ è San Lorenzo” acrilico bagnato su legno
#artbrut #outsiderart #myart #artedelsabato #firstattempts`;

  const parsed = parseCaption(caption);

  assert.equal(parsed.title.it, 'Tra un po’ è San Lorenzo');
  assert.equal(parsed.technique.it, 'acrilico bagnato su legno');
  assert.equal(parsed.description.it, '');
});

test('isLikelyArtworkPost rejects missing captions and editorial posts', () => {
  assert.equal(isLikelyArtworkPost({ caption: null }), false);

  assert.equal(
    isLikelyArtworkPost({
      caption: {
        text: 'Qualche settimana fa avevo annunciato di essermi lanciato in un impresa editoriale sulla AI.',
      },
    }),
    false,
  );
});

test('isLikelyArtworkPost accepts captions with dimensions and material signals', () => {
  assert.equal(
    isLikelyArtworkPost({
      caption: {
        text: 'Blasfemia policroma\n60x60 cm\nAcrilico e pastello a olio su tela nuova',
      },
    }),
    true,
  );
});

test('inferCategory uses hashtags and text, with a non-null fallback', () => {
  assert.equal(
    inferCategory('Acromie umorali #SemiAbstractAcrylics', ['semiabstractacrylics']),
    'Semi Abstract',
  );
  assert.equal(inferCategory('Mucca su tela 40x40 cm', []), 'Cows and Bulls');
  assert.equal(inferCategory('Studio cromatico senza soggetto', []), 'Cows and Bulls');
});
