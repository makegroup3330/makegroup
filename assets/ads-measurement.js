// Shared by the live website pages. Preview and local checks never send data.
(() => {
  if (!['makegroup.co.kr', 'www.makegroup.co.kr'].includes(window.location.hostname)
      || window.location.pathname.startsWith('/preview/')
      || window.__makegroupAdsTagReady) return;
  window.__makegroupAdsTagReady = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'AW-828540777');
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=AW-828540777';
  document.head.appendChild(tag);

  // Naver Search Ads shared key issued for https://www.makegroup.co.kr.
  // Load one WCS trans script on every live page and send the page view.
  window.makegroupNaverReady = new Promise(resolve => {
    const naverTag = document.createElement('script');
    naverTag.async = true;
    naverTag.src = 'https://wcs.naver.net/wcslog.js';
    naverTag.onload = () => {
      try {
        if (!window.wcs || typeof window.wcs.inflow !== 'function' ||
            typeof window.wcs_do !== 'function') { resolve(false); return; }
        if (!window.wcs_add) window.wcs_add = {};
        window.wcs_add.wa = 's_471a99d887f0';
        window.wcs.inflow('makegroup.co.kr');
        window.wcs_do();
        resolve(true);
      } catch (_) {
        resolve(false);
      }
    };
    naverTag.onerror = () => resolve(false);
    document.head.appendChild(naverTag);
  });
})();
