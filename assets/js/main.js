(function () {
  'use strict';

  var WHATSAPP = '918220564585';
  var EMAIL = 'vmsufiyan786@gmail.com';

  var header = document.querySelector('.site-header');
  var nav = document.getElementById('main-nav');
  var toggle = document.querySelector('.nav-toggle');

  /* ---------- Mobile menu ---------- */
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }
  toggle.addEventListener('click', function () {
    setMenu(!nav.classList.contains('open'));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Header background on scroll ---------- */
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('li a'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  function spy() {
    var mark = window.scrollY + window.innerHeight * 0.4;
    var current = sections[0];
    sections.forEach(function (s) {
      if (s.offsetTop <= mark) current = s;
    });
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current.id);
    });
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  if ('IntersectionObserver' in window) {
    /* ---------- Reveal on scroll ---------- */
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    document.querySelectorAll('.reveal').forEach(function (el) {
      // stagger siblings in grids
      var parent = el.parentElement;
      var siblings = parent ? parent.querySelectorAll(':scope > .reveal') : [];
      if (siblings.length > 1) {
        var i = Array.prototype.indexOf.call(siblings, el);
        el.style.transitionDelay = Math.min(i * 70, 500) + 'ms';
      }
      revealer.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Hadith slider ---------- */
  var hadith = document.querySelector('.hadith');
  if (hadith) {
    var stage = document.getElementById('h-stage');
    var slides = hadith.querySelectorAll('.h-slide');
    var dots = hadith.querySelectorAll('.h-dot');
    var DELAY = 8000;
    var current = 0;
    var timer = null;
    var hovering = false;
    var inView = true;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    hadith.style.setProperty('--h-delay', DELAY + 'ms');

    var showSlide = function (n) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) {
        var on = i === current;
        s.classList.toggle('is-active', on);
        s.setAttribute('aria-hidden', String(!on));
        s.inert = !on;
      });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === current);
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    };

    var stop = function () {
      clearInterval(timer);
      timer = null;
      hadith.classList.remove('is-playing');
    };
    var play = function () {
      stop();
      if (reduceMotion || hovering || !inView || document.hidden) return;
      // reflow so the active dot's progress animation restarts
      void hadith.offsetWidth;
      hadith.classList.add('is-playing');
      timer = setInterval(function () { showSlide(current + 1); }, DELAY);
    };
    // manual navigation: announce the new slide and restart the timer
    var goTo = function (n) {
      stage.setAttribute('aria-live', 'polite');
      showSlide(n);
      play();
    };

    hadith.querySelectorAll('.h-arrow').forEach(function (btn) {
      btn.addEventListener('click', function () { goTo(current + Number(btn.dataset.dir)); });
    });
    dots.forEach(function (d, i) {
      d.addEventListener('click', function () { goTo(i); });
    });
    hadith.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') goTo(current + 1);
      if (e.key === 'ArrowLeft') goTo(current - 1);
    });

    // swipe on touch screens
    var startX = null;
    stage.addEventListener('pointerdown', function (e) { startX = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (startX === null) return;
      var dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener('pointercancel', function () { startX = null; });

    // pause while the reader is hovering, focused inside, or the slider is off screen
    hadith.addEventListener('mouseenter', function () { hovering = true; stop(); });
    hadith.addEventListener('mouseleave', function () { hovering = false; play(); });
    hadith.addEventListener('focusin', function () { hovering = true; stop(); });
    hadith.addEventListener('focusout', function (e) {
      if (!hadith.contains(e.relatedTarget)) { hovering = false; play(); }
    });
    document.addEventListener('visibilitychange', play);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        play();
      }, { threshold: 0.25 }).observe(hadith);
    }

    showSlide(0);
    play();
  }

  /* ---------- Courses carousel progress (mobile) ---------- */
  var scroller = document.querySelector('.course-scroller');
  var bar = document.querySelector('.scroll-progress span');
  if (scroller && bar) {
    var updateBar = function () {
      var max = scroller.scrollWidth - scroller.clientWidth;
      var visible = scroller.clientWidth / scroller.scrollWidth;
      var ratio = max > 0 ? scroller.scrollLeft / max : 0;
      bar.style.width = Math.max(visible * 100, 12) + '%';
      bar.style.transform = 'translateX(' + (ratio * (1 / Math.max(visible, 0.12) - 1) * 100) + '%)';
    };
    scroller.addEventListener('scroll', updateBar, { passive: true });
    window.addEventListener('resize', updateBar);
    updateBar();
  }

  /* ---------- Free trial form -> WhatsApp / Email ---------- */
  var form = document.getElementById('trial-form');
  var via = 'whatsapp';

  form.querySelectorAll('button[type="submit"]').forEach(function (btn) {
    btn.addEventListener('click', function () { via = btn.dataset.via; });
  });

  function check(input) {
    var ok = input.value.trim() !== '';
    input.closest('.field').classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    if (!ok) input.setAttribute('aria-describedby', input.id + '-err');
    else input.removeAttribute('aria-describedby');
    return ok;
  }

  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('input', function () {
      if (input.closest('.field').classList.contains('invalid')) check(input);
    });
    input.addEventListener('change', function () {
      if (input.closest('.field').classList.contains('invalid')) check(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    var invalid = required.filter(function (input) { return !check(input); });
    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    var data = new FormData(form);
    var lines = [
      'Assalamu Alaikum,',
      'I would like to book a FREE trial class at Aalamul Quran Online Academy.',
      '',
      'Name: ' + data.get('name').trim(),
      'Classes for: ' + data.get('who'),
      'Course: ' + data.get('course'),
      'Preferred teacher: ' + data.get('teacher'),
      'Country: ' + (data.get('country').trim() || '-'),
      'Preferred time: ' + data.get('time')
    ];
    var msg = data.get('message').trim();
    if (msg) lines.push('', 'Message: ' + msg);
    var text = lines.join('\n');

    var href = via === 'email'
      ? 'mailto:' + EMAIL +
        '?subject=' + encodeURIComponent('Free Trial Class Request - ' + data.get('name').trim()) +
        '&body=' + encodeURIComponent(text)
      : 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);

    // a real link (not window.open) so popup blockers and in-app browsers let it through
    var link = document.getElementById('form-link');
    link.href = href;
    link.target = via === 'email' ? '_self' : '_blank';
    link.textContent = via === 'email' ? 'Open your email app' : 'Open WhatsApp';
    document.getElementById('form-result').hidden = false;
    link.click();
  });

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
