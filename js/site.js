/* ==========================================================================
   Veer — site behaviour
   Reads config.js and wires up: links, hero cards, gallery, video modal,
   filters, scrollspy, reveal-on-scroll, WhatsApp form, toast.
   Runs BEFORE the hero's 3D scene boots, so hero thumbnails are in place
   when the entrance animation samples them.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.VEER_CONFIG || {};
  var LINKS = CFG.links || {};
  var CONTACT = CFG.contact || {};
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* a value still holding one of the template placeholders (or empty) */
  function isPh(v) {
    return !v || /YOUR_|PASTE|X{4,}|yourdomain|example\.com/i.test(String(v));
  }

  /* ── toast ─────────────────────────────────────────────────────────── */
  var toastEl = null, toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    // force reflow so the transition replays on rapid clicks
    void toastEl.offsetWidth;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3800);
  }

  /* ── links ─────────────────────────────────────────────────────────── */
  var waDigits = String(CONTACT.whatsapp || '').replace(/\D/g, '');
  var waPh = isPh(CONTACT.whatsapp) || waDigits.length < 8;

  function waUrl(text) {
    return 'https://wa.me/' + waDigits + '?text=' + encodeURIComponent(text || CONTACT.whatsappMessage || 'Hi Veer!');
  }

  function wireLinks() {
    var map = {
      youtube:   { href: LINKS.youtube,   ph: isPh(LINKS.youtube),   msg: 'Add your YouTube channel URL in config.js and this button will work.', ext: true },
      instagram: { href: LINKS.instagram, ph: isPh(LINKS.instagram), msg: 'Add your Instagram profile URL in config.js and this button will work.', ext: true },
      whatsapp:  { href: waUrl(),         ph: waPh,                  msg: 'Add your WhatsApp number in config.js and this button will work.', ext: true },
      phone:     { href: 'tel:' + String(CONTACT.phone || '').replace(/[^\d+]/g, ''), ph: isPh(CONTACT.phone), msg: 'Add your phone number in config.js and tap-to-call will work.', ext: false },
      email:     { href: 'mailto:' + (CONTACT.email || ''), ph: isPh(CONTACT.email), msg: 'Add your email in config.js (or set it to "" to hide it).', ext: false }
    };

    $$('[data-link]').forEach(function (a) {
      var m = map[a.getAttribute('data-link')];
      if (!m) return;
      a.setAttribute('href', m.href || '#');
      if (m.ext) { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); }
      if (m.ph) { a.setAttribute('data-ph', m.msg); }
    });

    $$('[data-text="phone"]').forEach(function (n) { n.textContent = CONTACT.phone || ''; });
    $$('[data-text="email"]').forEach(function (n) { n.textContent = CONTACT.email || ''; });
    $$('[data-text="whatsapp"]').forEach(function (n) { n.textContent = waPh ? (CONTACT.phone || 'WhatsApp') : ('+' + waDigits); });

    // no email configured -> hide every email-only element
    if (!CONTACT.email) $$('[data-email-only]').forEach(function (n) { n.hidden = true; });

    // placeholders don't navigate to a dead page — they explain what to fill in
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-ph]');
      if (!a) return;
      e.preventDefault();
      toast(a.getAttribute('data-ph'));
    });
  }

  /* ── video parsing ─────────────────────────────────────────────────── */
  function parseVideo(url) {
    var m;
    if ((m = /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/.exec(url))) {
      return { type: 'youtube', id: m[1], tall: /\/shorts\//.test(url) };
    }
    if ((m = /instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/.exec(url))) {
      return { type: 'instagram', id: m[2], kind: m[1] === 'reels' ? 'reel' : m[1], tall: true };
    }
    if ((m = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url))) {
      return { type: 'vimeo', id: m[1] };
    }
    if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) {
      return { type: 'file' };
    }
    return { type: 'link' };
  }

  /* thumbnail: explicit thumb wins, otherwise a real YouTube link gives one */
  function thumbFor(v) {
    if (!v) return null;
    if (v.thumb) return { url: v.thumb };
    if (v.url && !isPh(v.url)) {
      var p = parseVideo(v.url);
      if (p.type === 'youtube') {
        return {
          url: 'https://i.ytimg.com/vi/' + p.id + '/maxresdefault.jpg',
          fallback: 'https://i.ytimg.com/vi/' + p.id + '/mqdefault.jpg'
        };
      }
    }
    return null;
  }

  function applyThumb(img, t) {
    if (!t) return;
    // a custom thumb is rarely CORS-enabled; the hero reveal copes without it
    img.removeAttribute('crossorigin');
    img.onerror = function () {
      if (t.fallback) { img.onerror = null; img.src = t.fallback; }
    };
    img.onload = function () {
      // YouTube serves a 120px grey stub (not a 404) when maxres is missing
      if (t.fallback && img.naturalWidth && img.naturalWidth <= 120) { img.onload = null; img.src = t.fallback; }
    };
    img.src = t.url;
  }

  /* ── modal ─────────────────────────────────────────────────────────── */
  var modal = $('#vmodal');
  var stage = $('#vmodal-stage');
  var lastFocus = null, closeTimer = 0;

  function icon(id) {
    return '<svg class="icon" aria-hidden="true"><use href="#i-' + id + '"/></svg>';
  }

  function openVideo(v, kicker) {
    if (!v || !modal) return;
    var url = v.url || '';
    var openLink = $('#vmodal-open');

    stage.innerHTML = '';
    stage.className = 'vmodal__stage';
    $('#vmodal-title').textContent = v.title || 'Video';
    $('#vmodal-kicker').textContent = kicker || 'Now playing';

    if (isPh(url)) {
      stage.innerHTML =
        '<div class="vph"><span class="ring">' + icon('play') + '</span>' +
        '<b>Your video plays here</b>' +
        '<span>Add the real link for this video in <code>config.js</code> and it will open right in this window.</span></div>';
      openLink.hidden = true;
    } else {
      var p = parseVideo(url);
      if (p.type === 'link') { window.open(url, '_blank', 'noopener'); return; }

      var el;
      if (p.type === 'youtube') {
        el = document.createElement('iframe');
        el.src = 'https://www.youtube-nocookie.com/embed/' + p.id + '?autoplay=1&rel=0&modestbranding=1&playsinline=1';
        if (p.tall) stage.classList.add('vmodal__stage--tall');
      } else if (p.type === 'instagram') {
        el = document.createElement('iframe');
        el.src = 'https://www.instagram.com/' + p.kind + '/' + p.id + '/embed';
        el.setAttribute('scrolling', 'no');
        stage.classList.add('vmodal__stage--tall');
      } else if (p.type === 'vimeo') {
        el = document.createElement('iframe');
        el.src = 'https://player.vimeo.com/video/' + p.id + '?autoplay=1';
      } else {
        el = document.createElement('video');
        el.src = url; el.controls = true; el.autoplay = true; el.playsInline = true;
      }
      if (el.tagName === 'IFRAME') {
        el.title = v.title || 'Video';
        el.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture; fullscreen');
        el.setAttribute('allowfullscreen', '');
      }
      stage.appendChild(el);
      openLink.href = url;
      openLink.hidden = false;
    }

    clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    void modal.offsetWidth;
    modal.classList.add('is-open');
    $('.vmodal__close', modal).focus({ preventScroll: true });
  }

  function closeVideo() {
    if (!modal || modal.hidden) return;
    modal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    closeTimer = setTimeout(function () {
      modal.hidden = true;
      stage.innerHTML = '';            // tears down the iframe so playback stops
    }, REDUCED ? 0 : 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  function wireModal() {
    if (!modal) return;
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) closeVideo();
    });
    document.addEventListener('keydown', function (e) {
      if (modal.hidden) return;
      if (e.key === 'Escape') { closeVideo(); return; }
      if (e.key === 'Tab') {           // keep focus inside the dialog
        var f = $$('button, a[href], [tabindex]:not([tabindex="-1"])', modal).filter(function (n) { return !n.hidden && n.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    // any element with data-open-video: "0"/"1" = hero cards, "showreel"
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-open-video]');
      if (!t) return;
      var k = t.getAttribute('data-open-video');
      if (k === 'showreel') openVideo({ title: 'Showreel', url: CFG.showreel }, 'Showreel');
      else openVideo((CFG.featured || [])[parseInt(k, 10)], 'Featured');
    });
  }

  /* ── hero cards & stats ────────────────────────────────────────────── */
  function wireHero() {
    (CFG.featured || []).forEach(function (f, i) {
      var card = $('[data-featured="' + i + '"]');
      if (!card) return;
      if (f.label) $('.label', card).textContent = f.label;
      if (f.title) $('h2', card).textContent = f.title;
      applyThumb($('img', card), thumbFor(f));
    });

    var stats = CFG.stats || [];
    stats.slice(0, 2).forEach(function (s, i) {
      var v = $('[data-stat-value="' + i + '"]'), l = $('[data-stat-label="' + i + '"]');
      if (v) v.textContent = s.value;
      if (l) l.textContent = s.label;
    });

    var list = $('#about-stats');
    if (list) {
      list.innerHTML = '';
      stats.slice(0, 3).forEach(function (s) {
        var d = document.createElement('div');
        var b = document.createElement('b'), sp = document.createElement('span');
        b.textContent = s.value; sp.textContent = s.label;
        d.appendChild(b); d.appendChild(sp);
        list.appendChild(d);
      });
    }

    var photo = $('#about-photo');
    if (photo && CFG.photo) { photo.src = CFG.photo; photo.hidden = false; }
  }

  /* ── gallery ───────────────────────────────────────────────────────── */
  var TAGS = { youtube: 'YouTube', reels: 'Reel', cinematic: 'Cinematic', other: 'Motion' };

  function buildGallery() {
    var host = $('#gallery');
    if (!host) return;
    var videos = CFG.videos || [];
    var section = $('#work');
    var track = $('.work-story__track', section);
    var pin = $('.work-story__pin', section);
    var count = document.createElement('div');
    count.className = 'work-story__count';
    count.setAttribute('aria-hidden', 'true');
    var current = document.createElement('b');
    var totalCount = document.createElement('span');
    count.appendChild(current);
    count.appendChild(totalCount);
    var progress = document.createElement('div');
    progress.className = 'work-story__bar';
    progress.setAttribute('aria-hidden', 'true');
    var progressFill = document.createElement('i');
    progress.appendChild(progressFill);
    host.appendChild(count);
    host.appendChild(progress);

    videos.forEach(function (v, i) {
      var art = document.createElement('article');
      art.className = 'vcard';
      art.setAttribute('data-cat', v.category || 'other');
      art.style.setProperty('--rd', Math.min(i % 3, 2) * 90 + 'ms');

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'vcard__btn';
      btn.setAttribute('aria-label', 'Play: ' + (v.title || 'video'));

      var thumb = document.createElement('span');
      thumb.className = 'vthumb';

      var ph = document.createElement('span');
      ph.className = 'vthumb__ph';
      ph.style.setProperty('--ang', (140 + (i * 37) % 70) + 'deg');
      ph.style.setProperty('--px1', (12 + (i * 29) % 70) + '%');
      ph.innerHTML = '<b>V</b>';
      thumb.appendChild(ph);

      var t = thumbFor(v);
      if (t) {
        var img = document.createElement('img');
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', function () { if (!t.fallback || img.src.indexOf(t.fallback) > -1) img.remove(); });
        applyThumb(img, t);
        thumb.appendChild(img);
      }

      var tag = document.createElement('span');
      tag.className = 'vtag';
      tag.textContent = TAGS[v.category] || 'Project';
      thumb.appendChild(tag);

      var play = document.createElement('span');
      play.className = 'vplay';
      play.innerHTML = icon('play');
      thumb.appendChild(play);

      var meta = document.createElement('span');
      meta.className = 'vmeta';
      var title = document.createElement('span'); title.className = 'vtitle'; title.textContent = v.title || '';
      var sub = document.createElement('span'); sub.className = 'vsub'; sub.textContent = v.meta || '';
      meta.appendChild(title); meta.appendChild(sub);

      btn.appendChild(thumb); btn.appendChild(meta);
      btn.addEventListener('click', function () { openVideo(v, TAGS[v.category] || 'Project'); });
      art.appendChild(btn);
      host.appendChild(art);
    });

    var cards = $$('.vcard', host);
    var liveCards = [];
    var scrollTotal = 1, target = 0, pos = 0, raf = 0, lastTime = 0, active = -1, lastPos = -1;
    function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
    function ease(value) { return value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2; }
    function smooth(value) { return value * value * (3 - 2 * value); }

    function render(value) {
      var frame = value * Math.max(0, liveCards.length - 1);
      liveCards.forEach(function (card, index) {
        var distance = frame - index;
        var blend = clamp((Math.abs(distance) - .06) / .64, 0, 1);
        var eased = ease(blend) * (distance > 0 ? 1 : -1);
        var opacity = 1 - smooth(clamp(blend / .7, 0, 1));
        var style = card.style;
        style.opacity = opacity.toFixed(3);
        style.visibility = blend >= .999 ? 'hidden' : 'visible';
        style.zIndex = blend < .5 ? '2' : '1';
        style.transform = REDUCED || blend === 0 ? 'none' :
          'translate3d(0,' + (eased * 90).toFixed(2) + 'px,0) scale(' + (1 - Math.abs(eased) * .04).toFixed(4) + ')';
      });

      progressFill.style.transform = 'scaleX(' + value.toFixed(4) + ')';
      section.classList.toggle('is-started', value > .02);
      var index = clamp(Math.round(frame), 0, Math.max(0, liveCards.length - 1));
      liveCards.forEach(function (card, i) {
        if (i === index) card.removeAttribute('aria-hidden');
        else card.setAttribute('aria-hidden', 'true');
      });
      if (index !== active) {
        active = index;
        current.textContent = (index + 1 < 10 ? '0' : '') + (index + 1);
        totalCount.textContent = '/ ' + (liveCards.length < 10 ? '0' : '') + liveCards.length;
      }
    }

    function step(now) {
      raf = 0;
      var dt = lastTime ? Math.min((now - lastTime) / 1000, .05) : .016;
      lastTime = now;
      pos += (target - pos) * (1 - Math.exp(-dt * 9));
      if (Math.abs(target - pos) < .0002) pos = target;
      if (pos !== lastPos) { render(pos); lastPos = pos; }
      if (pos !== target) raf = requestAnimationFrame(step);
    }

    function read() {
      if (!track || !pin) return;
      scrollTotal = Math.max(1, track.offsetHeight - pin.offsetHeight);
      target = clamp(-track.getBoundingClientRect().top / scrollTotal, 0, 1);
      if (!raf) { lastTime = 0; raf = requestAnimationFrame(step); }
    }

    function updateCards() {
      liveCards = cards.filter(function (card) { return !card.hidden; });
      active = -1;
      if (!liveCards.length) {
        cards.forEach(function (card) { card.setAttribute('aria-hidden', 'true'); });
        current.textContent = '00';
        totalCount.textContent = '/ 00';
        progressFill.style.transform = 'scaleX(0)';
        section.classList.remove('work-story--live', 'is-started');
        return;
      }
      if (track) track.style.setProperty('--gallery-count', liveCards.length);
      section.classList.toggle('work-story--live', !!track && !!pin);
      read();
    }

    // filters
    var chips = $$('.chip');
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var f = chip.getAttribute('data-filter');
        chips.forEach(function (c) {
          var on = c === chip;
          c.classList.toggle('is-active', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
        $$('.vcard', host).forEach(function (card) {
          var show = f === 'all' || card.getAttribute('data-cat') === f;
          card.hidden = !show;
          if (show) {
            card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop');
          }
        });
        updateCards();
      });
    });
    // hide filter chips that would be empty
    chips.forEach(function (chip) {
      var f = chip.getAttribute('data-filter');
      if (f !== 'all' && !videos.some(function (v) { return v.category === f; })) chip.hidden = true;
    });

    updateCards();
    if (track && pin) {
      window.addEventListener('scroll', read, { passive: true });
      window.addEventListener('resize', read);
      window.addEventListener('load', read);
      if ('ResizeObserver' in window) new ResizeObserver(read).observe(track);
      render(0);
      lastPos = 0;
    }
  }

  /* ── page behaviours ───────────────────────────────────────────────── */
  function scrollToSel(sel) {
    var el = $(sel);
    if (el) el.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
  }

  function wireScroll() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-scroll]');
      if (!t) return;
      e.preventDefault();
      var sel = t.getAttribute('data-scroll');
      if (sel === 'top') window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
      else scrollToSel(sel);
    });

    // reveal on scroll
    var rv = $$('.rv');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      rv.forEach(function (n) { io.observe(n); });
    } else {
      rv.forEach(function (n) { n.classList.add('in'); });
    }

    // dock highlights the section you are in
    var dockItems = $$('.dock-item[href^="#"]').filter(function (a) { return a.getAttribute('href').length > 1; });
    var map = {};
    dockItems.forEach(function (a) { map[a.getAttribute('href')] = a; });
    var current = null;
    function setActive(a) {
      if (a === current) return;
      current = a;
      dockItems.forEach(function (n) { n.classList.toggle('is-active', n === a); });
    }
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var a = map['#' + en.target.id];
          if (en.isIntersecting && a) setActive(a);
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      ['work', 'about', 'services', 'contact'].forEach(function (id) {
        var s = document.getElementById(id); if (s) spy.observe(s);
      });
    }
    window.addEventListener('scroll', function () {
      if (window.scrollY < window.innerHeight * 0.5) setActive(null);
    }, { passive: true });

    // floating WhatsApp button appears once the hero is behind you
    var fab = $('#fab');
    if (fab) {
      var onScroll = function () { fab.classList.toggle('show', window.scrollY > window.innerHeight * 0.75); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
  }

  /* ── contact form -> WhatsApp ──────────────────────────────────────── */
  function wireForm() {
    var form = $('#contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(form);
      var name = (d.get('name') || '').toString().trim();
      var type = (d.get('type') || '').toString().trim();
      var msg = (d.get('message') || '').toString().trim();
      var text = "Hi Veer! I'm " + (name || 'a new client') + '.' +
        (type ? '\nI need help with: ' + type + '.' : '') +
        (msg ? '\n\n' + msg : '');
      if (waPh) { toast('Add your WhatsApp number in config.js and this form will open a chat with it.'); return; }
      window.open(waUrl(text), '_blank', 'noopener');
    });
  }

  /* ── go ────────────────────────────────────────────────────────────── */
  wireLinks();
  wireModal();
  wireHero();
  buildGallery();
  wireScroll();
  wireForm();
})();
