(() => {
  const form = document.querySelector('#inquiry-form');
  if (!form) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('#form-status');
  let pending = false;
  const restore = () => {
    pending = false;
    button.disabled = false;
    form.removeAttribute('aria-busy');
    status.textContent = '';
  };
  // Native POST keeps FormSubmit's spam verification enabled and works without JS.
  form.addEventListener('submit', event => {
    if (pending) { event.preventDefault(); return; }
    pending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.textContent = '보안 확인 페이지로 이동합니다. 확인을 완료해 주세요.';
  });
  // A failed navigation or Back must allow the visitor to retry their saved entry.
  window.addEventListener('pageshow', restore);
  window.addEventListener('focus', restore);
})();
