/* ==========================================================================
   Services: pinned, scroll-driven showcase.
   The section is a tall "runway" with a sticky stage. Scroll progress through
   the runway picks which service is on stage; every panel gets three CSS
   variables (--a how far it has left the stage, --s which side it leaves on,
   --d signed distance for the rotations) and the CSS does the rest.
   Skipped entirely for "reduce motion" (the page keeps a plain card grid).
   ========================================================================== */
(function () {
  'use strict';
  var sec = document.getElementById('services');
  if (!sec || !sec.classList.contains('svcx')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var track  = sec.querySelector('.svcx__track');
  var panels = [].slice.call(sec.querySelectorAll('.svcx__panel'));
  var items  = [].slice.call(sec.querySelectorAll('.svcx__list button'));
  var cur    = document.getElementById('svcx-cur');
  var bar    = sec.querySelector('.svcx__bar i');
  var N = panels.length;
  if (!track || !N) return;

  sec.classList.add('svcx--live');

  var total = 1, target = 0, pos = 0, raf = 0, active = -1, lastDrawn = -1;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function measure() {
    total = Math.max(1, track.offsetHeight - window.innerHeight);
    read();
  }
  function read() {
    target = clamp(-track.getBoundingClientRect().top / total, 0, 1);
    if (!raf) raf = requestAnimationFrame(step);
  }
  function step() {
    raf = 0;
    pos += (target - pos) * 0.14;                 // glide toward the scroll position
    if (Math.abs(target - pos) < 0.0004) pos = target;
    if (pos !== lastDrawn) { render(pos); lastDrawn = pos; }
    if (pos !== target) raf = requestAnimationFrame(step);
  }

  function render(p) {
    var f = p * (N - 1);
    for (var i = 0; i < N; i++) {
      var d = f - i, ad = Math.abs(d);
      var a = clamp((ad - 0.10) / 0.52, 0, 1);    // a short hold, then a quick, clean hand-over
      a = a * a * (3 - 2 * a);
      var el = panels[i], st = el.style;
      st.setProperty('--a', a.toFixed(4));
      st.setProperty('--s', d > 0 ? 1 : -1);      // upcoming panels wait below, finished ones leave upward
      st.setProperty('--d', d.toFixed(4));
      st.visibility = a > 0.995 ? 'hidden' : 'visible';
      st.zIndex = a < 0.5 ? 2 : 1;
    }
    sec.style.setProperty('--sp', p.toFixed(4));
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    sec.classList.toggle('is-started', p > 0.02);

    var idx = clamp(Math.round(f), 0, N - 1);
    if (idx !== active) {
      active = idx;
      items.forEach(function (b, k) { b.classList.toggle('is-on', k === idx); });
      panels.forEach(function (el, k) {
        if (k === idx) { el.removeAttribute('aria-hidden'); } else { el.setAttribute('aria-hidden', 'true'); }
      });
      if (cur) {
        cur.textContent = '0' + (idx + 1);
        cur.classList.remove('tick'); void cur.offsetWidth; cur.classList.add('tick');
      }
    }
  }

  // jump to a service from the list
  items.forEach(function (b, i) {
    b.addEventListener('click', function () {
      var top = window.scrollY + track.getBoundingClientRect().top;
      window.scrollTo({ top: top + (i / (N - 1)) * total + 1, behavior: 'smooth' });
    });
  });

  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);

  measure();
  render(0); lastDrawn = 0;
})();
