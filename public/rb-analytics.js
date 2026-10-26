// Shared GA4 property for rbovetti.com and its public sites.
(function () {
  var host = window.location.hostname;
  if (host !== 'rbovetti.com' && !host.endsWith('.rbovetti.com')) return;
  if (window.rbPortfolioAnalyticsLoaded) return;
  window.rbPortfolioAnalyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', 'G-FXFLFGE5VS');
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-FXFLFGE5VS';
  document.head.appendChild(script);
})();
