(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('#form-status');
  const next = form.querySelector('[name="_next"]');
  const key = 'makegroup.inquiry.pending.v1';
  const live = ['makegroup.co.kr', 'www.makegroup.co.kr'].includes(window.location.hostname)
    && window.location.pathname === '/contact.html';
  let pending = false;
  const restore = () => {
    pending = false;
    button.disabled = false;
    form.removeAttribute('aria-busy');
    status.textContent = '';
    try { window.sessionStorage.removeItem(key); } catch (_) {}
  };
  // Native POST keeps FormSubmit's spam verification enabled and works without JS.
  form.addEventListener('submit', event => {
    if (event.defaultPrevented || !form.checkValidity()) return;
    if (pending) { event.preventDefault(); return; }
    try {
      window.sessionStorage.removeItem(key);
      if (live && next && !form.querySelector('[name="_honey"]').value) {
        const id = window.crypto.randomUUID();
        window.sessionStorage.setItem(key, JSON.stringify({
          id, at: Date.now(), source: window.location.pathname
        }));
        next.value = window.location.origin + '/inquiry-complete.html#' + id;
      }
    } catch (_) {
      // FormSubmit must still work if browser storage is unavailable.
      if (next) next.value = 'https://makegroup.co.kr/inquiry-complete.html';
    }
    pending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = '보안 확인 페이지로 이동합니다. 확인을 완료해 주세요.';
  });
  // A failed navigation or Back must allow the visitor to retry their saved entry.
  window.addEventListener('pageshow', restore);
})();
