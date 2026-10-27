/* ==========================================================================
   Services: pinned, scroll-driven showcase.
   The section is a tall "runway" with a sticky stage. Scroll progress through
   the runway picks which service is on stage. Every transform and opacity is
   written straight to the elements (no CSS-variable cascade), the progress is
   smoothed with a frame-rate independent ease, and a resting panel gets no
   transform at all so its text stays crisp.
   With "reduce motion" on it still pins and swaps, as a calm cross-fade.
   ========================================================================== */
(function () {
  'use strict';
  var sec = document.getElementById('services');
  if (!sec || !sec.classList.contains('svcx')) return;

  var track  = sec.querySelector('.svcx__track');
  var pin    = sec.querySelector('.svcx__pin');
  var panels = [].slice.call(sec.querySelectorAll('.svcx__panel'));
  var items  = [].slice.call(sec.querySelectorAll('.svcx__list button'));
  var cur    = document.getElementById('svcx-cur');
  var bar    = sec.querySelector('.svcx__bar i');
  var N = panels.length;
  if (!track || !pin || !N) return;

  var CALM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  sec.classList.add('svcx--live');
  if (CALM) sec.classList.add('svcx--calm');

  var parts = panels.map(function (p) {
    return {
      p: p, h: p.querySelector('.svcx__copy h3'), t: p.querySelector('.svcx__copy p'), g: p.querySelector('.svcx__tags'),
      art: p.querySelector('.svcx__art'), ico: p.querySelector('.ico'), r1: p.querySelector('.r1'), r2: p.querySelector('.r2'),
      gh: p.querySelector('.svcx__ghost'), last: -1
    };
  });

  var total = 1, target = 0, pos = 0, raf = 0, lastT = 0, active = -1, lastP = -1;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }   // easeInOutCubic
  function sm(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function T(y, k) { return 'translate3d(0,' + (y * k).toFixed(2) + 'px,0)'; }

  function measure() {
    // pin height (svh) rather than innerHeight: phone address bars resize innerHeight while scrolling
    total = Math.max(1, track.offsetHeight - pin.offsetHeight);
    read();
  }
  function read() {
    target = clamp(-track.getBoundingClientRect().top / total, 0, 1);
    if (!raf) { lastT = 0; raf = requestAnimationFrame(step); }
  }
  function step(now) {
    raf = 0;
    var dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0.016;
    lastT = now;
    pos += (target - pos) * (1 - Math.exp(-dt * 9));          // same glide at 60, 90 or 120 Hz
    if (Math.abs(target - pos) < 0.0002) pos = target;
    if (pos !== lastP) { render(pos); lastP = pos; }
    if (pos !== target) raf = requestAnimationFrame(step);
  }

  function render(p) {
    var f = p * (N - 1), i, o;
    for (i = 0; i < N; i++) {
      o = parts[i];
      var d = f - i, ad = Math.abs(d);
      var t = clamp((ad - 0.06) / 0.64, 0, 1);                // short hold, then a long, eased hand-over
      if (t === o.last) continue;                              // nothing changed for this panel
      o.last = t;
      var s = d > 0 ? 1 : -1, mv = ease(t) * s, op = 1 - sm(t / 0.7);
      var st = o.p.style;
      st.opacity = op.toFixed(3);
      st.visibility = t >= 0.999 ? 'hidden' : 'visible';
      st.zIndex = t < 0.5 ? 2 : 1;
      if (CALM) continue;
      st.transform = t === 0 ? 'none' : T(mv, 110) + ' scale(' + (1 - Math.abs(mv) * 0.05).toFixed(4) + ')';
      if (o.h)  o.h.style.transform  = t === 0 ? '' : T(mv, 34);
      if (o.t)  o.t.style.transform  = t === 0 ? '' : T(mv, 58);
      if (o.g)  o.g.style.transform  = t === 0 ? '' : T(mv, 84);
      if (o.art) o.art.style.transform = t === 0 ? '' : T(mv, 40);
      if (o.ico) o.ico.style.transform = 'rotate(' + (-d * 50).toFixed(1) + 'deg)';
      if (o.r1)  o.r1.style.transform  = 'rotate(' + (d * 220).toFixed(1) + 'deg)';
      if (o.r2)  o.r2.style.transform  = 'rotate(' + (-d * 140).toFixed(1) + 'deg)';
      if (o.gh)  o.gh.style.transform  = 'translate3d(' + (-d * 140).toFixed(1) + 'px,0,0)';
    }
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    sec.classList.toggle('is-started', p > 0.02);

    var idx = clamp(Math.round(f), 0, N - 1);
    if (idx !== active) {
      active = idx;
      items.forEach(function (b, k) { b.classList.toggle('is-on', k === idx); });
      panels.forEach(function (el, k) {
        if (k === idx) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
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
      window.scrollTo({ top: top + (i / (N - 1)) * total + 1, behavior: CALM ? 'auto' : 'smooth' });
    });
  });

  window.addEventListener('scroll', read, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);

  measure();
  render(0); lastP = 0;
})();
