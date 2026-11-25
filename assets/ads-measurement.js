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
})();
