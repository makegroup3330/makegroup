(() => {
  const key = 'makegroup.inquiry.pending.v1';
  const location = window.location;
  const live = ['makegroup.co.kr', 'www.makegroup.co.kr'].includes(location.hostname);
  if (!live || location.pathname !== '/inquiry-complete.html') return;

  const showComplete = () => {
    document.querySelector('#receipt-title').textContent = '문의 전송을 완료했습니다.';
    document.querySelector('#receipt-message').textContent = '보내주신 프로젝트 내용을 확인한 뒤 회신드리겠습니다.';
  };
  // This history flag restores the receipt UI after reload; it never sends an event.
  if (window.history.state?.makegroupInquiryComplete) showComplete();
  try {
    const pending = JSON.parse(window.sessionStorage.getItem(key));
    if (!pending || typeof pending.id !== 'string' ||
        !/^[a-f0-9-]{36}$/.test(pending.id) ||
        location.hash !== '#' + pending.id ||
        pending.source !== '/contact.html' ||
        !Number.isFinite(pending.at) || Date.now() < pending.at ||
        Date.now() - pending.at > 2 * 60 * 60 * 1000) return;
    // Consume before queueing: reload, Back/Forward and duplicate script loads
    // must not send the same inquiry again. No form contents are stored or sent.
    window.sessionStorage.removeItem(key);
    window.history.replaceState(
      { ...window.history.state, makegroupInquiryComplete: true }, '', location.pathname
    );
    showComplete();
    // Count a Naver lead only after the same verified FormSubmit return.
    Promise.resolve(window.makegroupNaverReady).then(ready => {
      if (!ready || !window.wcs || typeof window.wcs.trans !== 'function') return;
      window.wcs.trans({ type: 'lead' });
    });
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', {
        send_to: 'AW-828540777/WuxBCMHz360ZEOmOiosD',
        transaction_id: pending.id
      });
    }
  } catch (_) {
    // Blocked storage must not break the receipt or generate an unverified lead.
  }
})();
