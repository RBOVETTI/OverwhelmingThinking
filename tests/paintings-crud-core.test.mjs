import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const corePath = path.resolve('public/paintings-crud-core.js');

function loadCore() {
  const source = fs.readFileSync(corePath, 'utf8');
  const sandbox = {};
  vm.runInNewContext(source, sandbox, { filename: corePath });
  return sandbox.PaintingsCrudCore;
}

test('form values round-trip through the Paintings.json schema without dropping unknown fields', () => {
  const core = loadCore();
  const previous = {
    id: 8,
    publicationDate: '2024-01-02',
    title: { it: 'Titolo vecchio', en: 'Old title' },
    technique: { it: 'Olio', en: 'Oil' },
    category: 'Cows and Bulls',
    price: '100€',
    dimensions: '40x40 cm',
    description: { it: 'Descrizione', en: 'Description' },
    image: 'IMG/old.jpg',
    instagramCode: 'abc123',
  };

  const values = core.paintingToFormValues(previous);
  values.titleIt = ' Titolo nuovo ';
  values.descriptionIt = '  Riga uno\n\nRiga due  ';
  values.image = ' IMG/new.jpg ';

  const updated = core.formValuesToPainting(values, previous);

  assert.equal(updated.id, 8);
  assert.equal(updated.title.it, 'Titolo nuovo');
  assert.equal(updated.description.it, 'Riga uno\n\nRiga due');
  assert.equal(updated.image, 'IMG/new.jpg');
  assert.equal(updated.instagramCode, 'abc123');
});

test('navigation wraps around the loaded paintings', () => {
  const core = loadCore();

  assert.equal(core.moveIndex(0, -1, 3), 2);
  assert.equal(core.moveIndex(2, 1, 3), 0);
  assert.equal(core.moveIndex(1, 1, 3), 2);
  assert.equal(core.moveIndex(null, 1, 3), 0);
  assert.equal(core.moveIndex(0, 1, 0), -1);
});

test('validation blocks duplicate ids and missing required fields before file save', () => {
  const core = loadCore();
  const errors = core.validatePaintingsForSave([
    {
      id: 1,
      publicationDate: '2026-07-04',
      title: { it: 'Uno', en: '' },
      technique: { it: '', en: '' },
      category: 'Cows and Bulls',
      price: '100€',
      dimensions: '40x40 cm',
      description: { it: '', en: '' },
      image: 'IMG/one.jpg',
    },
    {
      id: 1,
      publicationDate: '',
      title: { it: '', en: '' },
      technique: { it: '', en: '' },
      category: '',
      price: '100€',
      dimensions: '',
      description: { it: '', en: '' },
      image: '',
    },
  ]);

  assert.deepEqual(JSON.parse(JSON.stringify(errors)), [
    'ID duplicato: 1',
    'Record 2: titolo IT mancante',
    'Record 2: data pubblicazione mancante',
    'Record 2: immagine mancante',
  ]);
});

test('new paintings use the next numeric id and serialize with a final newline', () => {
  const core = loadCore();
  const painting = core.createEmptyPainting([
    { id: 4 },
    { id: 12 },
  ]);

  assert.equal(painting.id, 13);
  assert.deepEqual(JSON.parse(JSON.stringify(painting.title)), { it: '', en: '' });
  assert.match(core.serializePaintings([painting]), /\n$/);
});

test('valueOptionsForField returns defaults first and appends unique values from paintings', () => {
  const core = loadCore();
  const paintings = [
    { category: 'Semi Abstract', price: '100€' },
    { category: 'Cows and Bulls', price: 'SOLD' },
    { category: 'Photos', price: 'NON DISPONIBILE' },
    { category: 'Cows and Bulls', price: '100€' },
    { category: 'Installations', price: 'DISTRUTTO' },
  ];

  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'category', ['Cows and Bulls', 'Semi Abstract', 'Photos']))),
    ['Cows and Bulls', 'Semi Abstract', 'Photos', 'Installations'],
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'price', ['100€', 'SOLD']))),
    ['100€', 'SOLD', 'DISTRUTTO', 'NON DISPONIBILE'],
  );
});

test('valueOptionsForField extracts nested and free-text suggestion fields', () => {
  const core = loadCore();
  const paintings = [
    {
      dimensions: '50x50 cm',
      image: 'IMG/one.jpg',
      technique: { it: 'Acrilico su tela', en: 'Acrylic on canvas' },
    },
    {
      dimensions: '40x40 cm',
      image: 'IMG/two.jpg',
      technique: { it: 'Olio su tela', en: 'Oil on canvas' },
    },
    {
      dimensions: '50x50 cm',
      image: 'IMG/one.jpg',
      technique: { it: 'Acrilico su tela', en: '' },
    },
  ];

  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'dimensions'))),
    ['40x40 cm', '50x50 cm'],
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'techniqueIt'))),
    ['Acrilico su tela', 'Olio su tela'],
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'techniqueEn'))),
    ['Acrylic on canvas', 'Oil on canvas'],
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(core.valueOptionsForField(paintings, 'image'))),
    ['IMG/one.jpg', 'IMG/two.jpg'],
  );
});
