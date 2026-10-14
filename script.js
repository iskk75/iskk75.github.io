(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ========== Bandeau à pois animé ========== */
  var cv = $('#dots');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d'), dots = [], W = 0, H = 0;
    var cols = ['rgba(255,255,255,.95)', 'rgba(246,183,196,.95)', 'rgba(255,255,255,.75)', 'rgba(190,240,232,.9)'];
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * d; cv.height = H * d; ctx.setTransform(d, 0, 0, d, 0, 0);
      dots = [];
      var n = Math.round(W / 34);
      for (var i = 0; i < n; i++) dots.push({ x: Math.random() * W, y: Math.random() * H, r: 6 + Math.random() * 9, v: .15 + Math.random() * .35, c: cols[i % cols.length], p: Math.random() * 6 });
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(function (d) {
        if (!reduce) { d.x += d.v; if (d.x - d.r > W) d.x = -d.r; }
        var y = d.y + (reduce ? 0 : Math.sin(t / 1400 + d.p) * 3);
        ctx.fillStyle = d.c; ctx.beginPath(); ctx.arc(d.x, y, d.r, 0, Math.PI * 2); ctx.fill();
      });
      if (!reduce) requestAnimationFrame(draw);
    }
    size(); draw(0);
    window.addEventListener('resize', function () { size(); if (reduce) draw(0); });
  }

  /* ========== Navigation par onglets ========== */
  var views = $$('.view');
  var order = views.map(function (v) { return v.id; });
  var progress = $('.progress'), ribbon = $('#ribbon'), burger = $('#burger');
  var current = null, busy = false;

  function closeMenus() {
    $$('.has-dd').forEach(function (li) { li.classList.remove('open'); $('.dd-btn', li).setAttribute('aria-expanded', 'false'); });
    ribbon.classList.remove('mob-open'); burger.setAttribute('aria-expanded', 'false');
  }

  function show(id, initial) {
    views.forEach(function (v) { v.hidden = v.id !== id; v.classList.remove('enter', 'leave'); });
    var v = document.getElementById(id);
    $$('.rv', v).forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 12)); });
    void v.offsetWidth;
    v.classList.add('enter');
    $$('.menu > li > a, #side-pages a').forEach(function (a) {
      if (a.dataset.go === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $$('#side-pages a').forEach(function (a) { a.classList.toggle('cur', a.dataset.go === id); });
    $$('.has-dd').forEach(function (li) { li.classList.toggle('cur', li.dataset.for === id); });
    current = id;
    var top = $('.ribbon-wrap').offsetTop;
    if (window.scrollY > top) window.scrollTo(0, top);
    if (!initial) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    document.title = (id === 'accueil' ? '' : v.dataset.label + ' · ') + 'Portfolio Issak Dirir';
  }

  function go(id, after) {
    if (order.indexOf(id) === -1 || busy) return;
    if (id === current) { if (after) after(); return; }
    if (reduce) { show(id); if (after) after(); return; }
    busy = true;
    progress.classList.remove('run'); void progress.offsetWidth; progress.classList.add('run');
    var old = document.getElementById(current);
    old.classList.remove('enter'); old.classList.add('leave');
    setTimeout(function () { show(id); busy = false; if (after) setTimeout(after, 300); }, 200);
  }

  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      closeMenus();
      var after = null;
      if (el.dataset.open) after = function () { filter('all'); openModal(projs.indexOf(document.getElementById(el.dataset.open))); };
      else if (el.dataset.scroll) after = function () { var t = document.getElementById(el.dataset.scroll); t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); };
      else if (el.dataset.acc) after = function () {
        var d = $$('#acc details')[+el.dataset.acc];
        $$('#acc details').forEach(function (x) { x.open = x === d; });
        d.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      };
      go(el.dataset.go, after);
    });
  });

  var start = (location.hash || '').slice(1);
  show(order.indexOf(start) > -1 ? start : 'accueil', true);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  /* ========== Menus déroulants + menu mobile ========== */
  var desktop = window.matchMedia('(min-width: 981px) and (hover: hover)');
  $$('.has-dd').forEach(function (li) {
    var btn = $('.dd-btn', li);
    function set(open) {
      $$('.has-dd').forEach(function (o) { if (o !== li) { o.classList.remove('open'); $('.dd-btn', o).setAttribute('aria-expanded', 'false'); } });
      li.classList.toggle('open', open); btn.setAttribute('aria-expanded', open);
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); set(!li.classList.contains('open')); });
    li.addEventListener('mouseenter', function () { if (desktop.matches) set(true); });
    li.addEventListener('mouseleave', function () { if (desktop.matches) set(false); });
  });
  burger.addEventListener('click', function (e) {
    e.stopPropagation();
    var o = !ribbon.classList.contains('mob-open');
    ribbon.classList.toggle('mob-open', o); burger.setAttribute('aria-expanded', o);
  });
  document.addEventListener('click', function (e) { if (!ribbon.contains(e.target)) closeMenus(); });

  document.addEventListener('keydown', function (e) {
    if (!modal.hidden) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      return;
    }
    if (e.key === 'Escape') closeMenus();
  });

  /* ========== Thème ========== */
  var root = document.documentElement;
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  $('#theme').addEventListener('click', function () {
    var t = root.getAttribute('data-theme');
    var dark = t ? t === 'dark' : (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    toast(next === 'dark' ? 'Thème sombre activé' : 'Thème clair activé');
  });

  /* ========== Filtres ========== */
  var fbtn = $$('.filters button'), count = $('#count');
  function filter(f) {
    var n = 0;
    fbtn.forEach(function (b) { var on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $$('.proj').forEach(function (p) {
      var hit = f === 'all' || p.dataset.c.split(' ').indexOf(f) > -1;
      p.classList.toggle('dim', !hit); p.tabIndex = hit ? 0 : -1;
      if (hit) n++;
    });
    count.textContent = n + (n > 1 ? ' réalisations' : ' réalisation') + (f === 'all' ? '' : ' · ' + f);
  }
  fbtn.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });

  /* ========== Fenêtre de détail ========== */
  var modal = $('#modal'), projs = $$('.proj'), mi = 0, lastFocus = null;
  function fill(i) {
    mi = (i + projs.length) % projs.length;
    var p = projs[mi], d = $('.detail', p), body = $('#m-body');
    $('#m-ref').textContent = d.dataset.ref;
    $('#m-title').textContent = $('h3', p).textContent;
    $('#m-ctx').textContent = d.dataset.ctx;
    body.innerHTML = '';
    $$('[data-h]', d).forEach(function (s) {
      var h = document.createElement('h4'); h.textContent = s.dataset.h; body.appendChild(h);
      var txt = s.textContent, el;
      if (s.dataset.h === 'Missions') {
        el = document.createElement('ul');
        txt.split('|').forEach(function (m) { var li = document.createElement('li'); li.textContent = m; el.appendChild(li); });
      } else if (s.dataset.h === 'Outils') {
        el = document.createElement('div'); el.className = 'tags';
        txt.split(',').forEach(function (o) { var t = document.createElement('span'); t.className = 'tag'; t.textContent = o.trim(); el.appendChild(t); });
      } else { el = document.createElement('p'); el.textContent = txt; }
      body.appendChild(el);
    });
    var h = document.createElement('h4'); h.textContent = 'Compétences'; body.appendChild(h);
    body.appendChild($('.tags', p).cloneNode(true));
    $('.panel', modal).scrollTop = 0;
  }
  function openModal(i) { lastFocus = document.activeElement; fill(i); modal.hidden = false; document.body.style.overflow = 'hidden'; $('.close', modal).focus(); }
  function closeModal() { modal.hidden = true; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
  function step(d) {
    var panel = $('.panel', modal);
    if (!reduce) { panel.style.animation = 'none'; void panel.offsetWidth; panel.style.animation = ''; }
    fill(mi + d);
  }
  projs.forEach(function (p, i) { p.addEventListener('click', function () { openModal(i); }); });
  $$('[data-close]', modal).forEach(function (b) { b.addEventListener('click', closeModal); });
  $('#m-prev').addEventListener('click', function () { step(-1); });
  $('#m-next').addEventListener('click', function () { step(1); });

  /* ========== Tableau de synthèse ========== */
  var table = $('#matrix');
  function colHi(i) {
    $$('.col-hi', table).forEach(function (c) { c.classList.remove('col-hi'); });
    if (i < 1) return;
    $$('tr', table).forEach(function (tr) { var c = tr.children[i]; if (c) c.classList.add('col-hi'); });
  }
  table.addEventListener('pointerover', function (e) {
    var cell = e.target.closest('th,td');
    if (cell) colHi(Array.prototype.indexOf.call(cell.parentElement.children, cell));
  });
  table.addEventListener('pointerleave', function () { colHi(-1); });
  $$('tbody tr', table).forEach(function (tr) {
    tr.addEventListener('click', function () {
      var i = projs.indexOf(document.getElementById(tr.dataset.rp));
      go('realisations', function () { filter('all'); openModal(i); });
    });
  });

  /* ========== Copier l'e-mail ========== */
  var toastEl = $('.toast'), tt;
  function toast(m) { toastEl.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, 1800); }
  $('#copy').addEventListener('click', function () {
    var code = $('#email'), t = code.textContent;
    function sel() { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Adresse sélectionnée, faites Ctrl+C'); }
    try { navigator.clipboard.writeText(t).then(function () { toast('Adresse e-mail copiée'); }, sel); } catch (e) { sel(); }
  });
})();
