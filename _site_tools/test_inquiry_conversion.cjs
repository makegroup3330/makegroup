const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = name => fs.readFileSync(path.join(root, 'assets', name), 'utf8');
const key = 'makegroup.inquiry.pending.v1';
const destination = 'AW-828540777/WuxBCMHz360ZEOmOiosD';

function browser({ hostname = 'makegroup.co.kr', pathname = '/contact.html', denied = false } = {}) {
  const store = new Map();
  const listeners = {};
  const formEvents = {};
  const fields = {
    button: { disabled: false }, status: { textContent: '' },
    next: { value: 'https://makegroup.co.kr/inquiry-complete.html' },
    honey: { value: '' }, title: { textContent: '문의 접수 안내' }, message: { textContent: '' }
  };
  const attributes = new Map();
  let valid = true;
  const form = {
    querySelector(selector) {
      return fields[({ '[type="submit"]': 'button', '#form-status': 'status',
        '[name="_next"]': 'next', '[name="_honey"]': 'honey' })[selector]];
    },
    checkValidity: () => valid,
    setAttribute: (name, value) => attributes.set(name, value),
    removeAttribute: name => attributes.delete(name),
    addEventListener: (name, fn) => { formEvents[name] = fn; }
  };
  const location = { hostname, pathname, hash: '', origin: 'https://' + hostname };
  const storage = {
    getItem(name) { if (denied) throw new Error('blocked'); return store.get(name) ?? null; },
    setItem(name, value) { if (denied) throw new Error('blocked'); store.set(name, value); },
    removeItem(name) { if (denied) throw new Error('blocked'); store.delete(name); }
  };
  const scripts = [];
  const window = {
    location, sessionStorage: storage, crypto: { randomUUID },
    history: { state: null, replaceState(state, _, url) {
      this.state = state; location.hash = ''; location.pathname = url;
    } },
    addEventListener: (name, fn) => { listeners[name] = fn; }
  };
  const document = {
    querySelector(selector) {
      return ({ '#inquiry-form': form, '#receipt-title': fields.title,
        '#receipt-message': fields.message })[selector] ?? null;
    },
    querySelectorAll: () => [],
    createElement: () => ({}),
    head: { appendChild: script => scripts.push(script) }
  };
  const context = vm.createContext({ window, document, Date, JSON, Number });
  const run = name => vm.runInContext(source(name), context);
  const submit = (defaultPrevented = false) => {
    const event = { defaultPrevented, preventDefault() { this.defaultPrevented = true; } };
    formEvents.submit(event); return event;
  };
  const returnFromProvider = () => {
    const url = new URL(fields.next.value);
    location.pathname = url.pathname; location.hash = url.hash;
    run('ads-measurement.js'); run('inquiry-conversion.js');
  };
  const conversions = () => Array.from(window.dataLayer ?? [])
    .map(args => Array.from(args)).filter(args => args[0] === 'event');
  return { window, fields, scripts, store, listeners, attributes, run, submit,
    returnFromProvider, conversions, setValid: value => { valid = value; } };
}

test('a submitted inquiry only converts after returning with its matching receipt', () => {
  const b = browser(); b.run('contact-form.js'); b.listeners.pageshow();
  b.submit();
  assert.equal(b.conversions().length, 0);
  const pending = JSON.parse(b.store.get(key));
  assert.equal(b.fields.button.disabled, true);
  assert.equal(b.attributes.get('aria-busy'), 'true');
  assert.equal(b.fields.next.value, 'https://makegroup.co.kr/inquiry-complete.html#' + pending.id);
  b.returnFromProvider();
  assert.equal(b.store.has(key), false);
  assert.equal(b.fields.title.textContent, '문의 전송을 완료했습니다.');
  assert.equal(b.conversions().length, 1);
  const event = b.conversions()[0];
  assert.equal(event[1], 'conversion');
  assert.equal(event[2].send_to, destination);
  assert.equal(event[2].transaction_id, pending.id);
  assert.deepEqual(Object.keys(event[2]).sort(), ['send_to', 'transaction_id']);
  assert.equal(b.window.location.hash, '');
  b.run('inquiry-conversion.js');
  assert.equal(b.conversions().length, 1, 'receipt reload must not count again');
});

test('invalid fields and another handler cancellation never mark a pending inquiry', () => {
  const b = browser(); b.run('contact-form.js'); b.setValid(false); b.submit();
  assert.equal(b.store.has(key), false); assert.equal(b.fields.button.disabled, false);
  b.setValid(true); b.submit(true); assert.equal(b.store.has(key), false);
});

test('duplicate clicks and focus cannot create another native POST attempt', () => {
  const b = browser(); b.run('contact-form.js'); b.submit();
  const id = b.store.get(key);
  assert.equal(b.listeners.focus, undefined);
  assert.equal(b.submit().defaultPrevented, true);
  assert.equal(b.store.get(key), id);
});

test('Back to form clears the old attempt and permits a new inquiry', () => {
  const b = browser(); b.run('contact-form.js'); b.submit(); const old = b.store.get(key);
  b.listeners.pageshow(); assert.equal(b.store.has(key), false);
  assert.equal(b.fields.button.disabled, false);
  b.submit(); assert.notEqual(b.store.get(key), old);
});

test('honeypot submissions are never eligible for a conversion', () => {
  const b = browser(); b.run('contact-form.js'); b.fields.honey.value = 'bot'; b.submit();
  assert.equal(b.store.has(key), false);
});

test('storage failures preserve the native submission without counting a lead', () => {
  const b = browser({ denied: true }); b.run('contact-form.js'); b.listeners.pageshow();
  assert.equal(b.submit().defaultPrevented, false);
  b.returnFromProvider(); assert.equal(b.conversions().length, 0);
});

test('direct receipt visits never convert', () => {
  const b = browser({ pathname: '/inquiry-complete.html' });
  b.run('ads-measurement.js'); b.run('inquiry-conversion.js');
  assert.equal(b.conversions().length, 0);
  assert.equal(b.fields.title.textContent, '문의 접수 안내');
});

for (const invalid of ['expired', 'future', 'mismatched', 'malformed', 'preview', 'bad JSON']) {
  test('rejects unverified receipt: ' + invalid, () => {
    const b = browser(); b.run('contact-form.js'); b.submit();
    const pending = JSON.parse(b.store.get(key));
    if (invalid === 'expired') pending.at -= 2 * 60 * 60 * 1000 + 5000;
    if (invalid === 'future') pending.at += 60000;
    if (invalid === 'mismatched') pending.id = randomUUID();
    if (invalid === 'malformed') pending.id = 'not-a-receipt';
    if (invalid === 'preview') pending.source = '/preview/contact.html';
    b.store.set(key, invalid === 'bad JSON' ? 'not JSON' : JSON.stringify(pending));
    b.returnFromProvider(); assert.equal(b.conversions().length, 0);
  });
}

test('Google tag is initialized once without changing inquiry form behaviour', () => {
  const b = browser(); b.run('ads-measurement.js');
  assert.equal(b.scripts.length, 1);
  assert.equal(b.scripts[0].src, 'https://www.googletagmanager.com/gtag/js?id=AW-828540777');
  const initial = b.window.dataLayer.length;
  // A second page-script execution in a separate lexical scope exercises its guard.
  vm.runInNewContext('{\n' + source('ads-measurement.js') + '\n}', { window: b.window,
    document: { querySelector: () => null, querySelectorAll: () => [],
      createElement: () => ({}), head: { appendChild: script => b.scripts.push(script) } }, Date });
  assert.equal(b.scripts.length, 1); assert.equal(b.window.dataLayer.length, initial);
  assert.equal(b.conversions().length, 0);
});

for (const options of [{ hostname: 'localhost' }, { pathname: '/preview/contact.html' }]) {
  test('local and preview traffic never loads Ads measurement: ' + JSON.stringify(options), () => {
    const b = browser(options); b.run('ads-measurement.js'); b.run('contact-form.js'); b.submit();
    assert.equal(b.scripts.length, 0); assert.equal(b.store.has(key), false);
  });
}

test('www receipt stays on the same origin as its form session', () => {
  const b = browser({ hostname: 'www.makegroup.co.kr' });
  b.run('contact-form.js'); b.submit();
  assert.match(b.fields.next.value, /^https:\/\/www\.makegroup\.co\.kr\//);
  b.returnFromProvider(); assert.equal(b.conversions().length, 1);
});

test('native form keeps its receiver, validation, honeypot and CAPTCHA', () => {
  const html = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
  assert.match(html, /action="https:\/\/formsubmit\.co\/Makegroupcg@naver\.com" method="POST"/);
  assert.match(html, /name="_next" value="https:\/\/makegroup\.co\.kr\/inquiry-complete\.html"/);
  assert.match(html, /name="_honey"/);
  assert.doesNotMatch(html, /name="_captcha"[^>]*value="false"/);
  assert.match(html, /name="email" required="" type="email"/);
  assert.match(html, /<textarea[^>]*name="message"[^>]*required/);
});

test('all 43 existing public content pages include the standalone measurement tag', () => {
  const pages = fs.readdirSync(root).filter(name => name.endsWith('.html') &&
    !['404.html', 'inquiry-complete.html'].includes(name));
  assert.equal(pages.length, 43);
  for (const name of pages) {
    const html = fs.readFileSync(path.join(root, name), 'utf8');
    assert.equal((html.match(/src="assets\/ads-measurement\.js\?v=20261126"/g) ?? []).length, 1, name);
  }
});

test('receipt initializes measurement before sending a completed inquiry event', () => {
  const html = fs.readFileSync(path.join(root, 'inquiry-complete.html'), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex,nofollow"/);
  assert.ok(html.indexOf('assets/ads-measurement.js') < html.indexOf('assets/inquiry-conversion.js'));
});
