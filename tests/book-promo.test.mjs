import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

test('main site shell declares Italian as the active document language', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const langMatch = html.match(/<html\b[^>]*\blang=["']([^"']+)["']/i);

  assert.equal(langMatch?.[1], 'it');
});

test('book promo uses the document language before stale stored language preferences', async () => {
  const script = await readFile(new URL('../public/book-promo.js', import.meta.url), 'utf8');
  const itPromo = createElement({ 'data-rb-book-site': 'OverwhelmingThinking', 'data-rb-book-lang': 'it' });
  const enPromo = createElement({ 'data-rb-book-site': 'OverwhelmingThinking', 'data-rb-book-lang': 'en', hidden: '' });
  const itModal = createElement({ 'data-rb-book-lang': 'it', hidden: '' });
  const enModal = createElement({ 'data-rb-book-lang': 'en', hidden: '' });
  const documentElement = createElement({ lang: 'it' });

  const context = {
    document: {
      documentElement,
      querySelectorAll(selector) {
        if (selector === '[data-rb-book-promo]') return [itPromo, enPromo];
        if (selector === '[data-rb-book-modal]') return [itModal, enModal];
        return [];
      },
      querySelector() {
        return null;
      },
      addEventListener() {},
    },
    navigator: { language: 'en-US' },
    window: {
      location: { search: '', pathname: '/' },
      localStorage: {
        getItem(key) {
          return key === 'i18nextLng' ? 'en' : null;
        },
        setItem() {},
      },
      setTimeout(callback) {
        callback();
      },
    },
  };

  vm.runInNewContext(script, context);

  assert.equal(itPromo.hasAttribute('hidden'), false);
  assert.equal(enPromo.hasAttribute('hidden'), true);
  assert.equal(itModal.hasAttribute('hidden'), false);
  assert.equal(enModal.hasAttribute('hidden'), true);
});

function createElement(attributes = {}) {
  const attrs = new Map(Object.entries(attributes));

  return {
    get lang() {
      return attrs.get('lang') || '';
    },
    set lang(value) {
      attrs.set('lang', value);
    },
    classList: {
      add() {},
      remove() {},
    },
    focus() {},
    getAttribute(name) {
      return attrs.has(name) ? attrs.get(name) : null;
    },
    hasAttribute(name) {
      return attrs.has(name);
    },
    setAttribute(name, value) {
      attrs.set(name, value);
    },
    removeAttribute(name) {
      attrs.delete(name);
    },
    addEventListener() {},
    querySelector() {
      return null;
    },
  };
}
