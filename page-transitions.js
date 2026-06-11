/* ──────────────────────────────────────────────────────────────
   Stenward — shared page transitions for the "learn more" pages
   • Subtle slide-in on load (transform only — never hides content,
     so the page is always visible even if animations are paused)
   • Fades out before navigating to another internal page
   • Carries a flag so the home page auto-opens the calendar when a
     service-page "Book a call" button is clicked
   ────────────────────────────────────────────────────────────── */
(function () {
  // 1. Inject the transition styles
  var css = document.createElement('style');
  css.textContent =
    '@keyframes stnPageIn{from{transform:translateY(12px)}to{transform:none}}' +
    '@keyframes stnPageOut{from{opacity:1}to{opacity:0}}' +
    'body.stn-in{animation:stnPageIn .42s cubic-bezier(.22,1,.36,1)}' +
    'body.stn-leaving{animation:stnPageOut .29s ease-out forwards}' +
    '@media (prefers-reduced-motion: reduce){body.stn-in{animation:none}}';
  (document.head || document.documentElement).appendChild(css);

  // 2. Play the entrance slide (base state stays fully visible)
  document.body.classList.add('stn-in');

  // 3. Is this href an in-site navigation (same origin / relative path)?
  function isInternal(href) {
    if (!href) return false;
    if (href.charAt(0) === '#') return false;                 // same-page anchor
    if (/^(mailto:|tel:)/i.test(href)) return false;          // not a page nav
    if (/^https?:\/\//i.test(href)) {                          // absolute URL
      try { return new URL(href, location.href).origin === location.origin; }
      catch (e) { return false; }
    }
    return true;                                               // relative: "index.html#contact", "service-x.html"
  }

  // 4. Intercept clicks → fade out → navigate
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href');

    // "Book a call" → tell the home page to open the calendar on arrival
    if (a.hasAttribute('data-book')) {
      try { sessionStorage.setItem('openBooking', '1'); } catch (_) {}
    }

    if (a.target === '_blank') return;
    if (!isInternal(href)) return;

    e.preventDefault();
    document.body.classList.add('stn-leaving');
    setTimeout(function () { window.location.href = href; }, 280);
  });
})();
