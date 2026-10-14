(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ========== Onglets et transition ========== */
  var views = $$('.view');
  var order = views.map(function (v) { return v.id; });
  var tabs = $$('.tabs a');
  var line = $('.tabs .line');
  var progress = $('.progress');
  var current = null, busy = false;

  function placeLine() {
    var a = $('.tabs a[aria-current="page"]');
    if (!a || !line) return;
    line.style.width = a.offsetWidth + 'px';
    line.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    var nav = a.parentElement;
    if (nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left: a.offsetLeft - 20, behavior: reduce ? 'auto' : 'smooth' });
  }

  function show(id, initial) {
    views.forEach(function (v) { v.hidden = v.id !== id; v.classList.remove('enter', 'leave'); });
    var v = document.getElementById(id);
    $$('.rv', v).forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 12)); });
    void v.offsetWidth;
    v.classList.add('enter');
    tabs.forEach(function (a) {
      if (a.dataset.go === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    current = id;
    placeLine();
    window.scrollTo(0, 0);
    if (!initial) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    document.title = (id === 'accueil' ? '' : v.dataset.label + ' · ') + 'Portfolio Issak Dirir';
    if (id === 'accueil') countUp();
  }

  function go(id, after) {
    if (order.indexOf(id) === -1 || busy) return;
    if (id === current) { if (after) after(); return; }
    if (reduce) { show(id); if (after) after(); return; }
    busy = true;
    progress.classList.remove('run'); void progress.offsetWidth; progress.classList.add('run');
    var old = document.getElementById(current);
    old.classList.remove('enter'); old.classList.add('leave');
    setTimeout(function () {
      show(id);
      busy = false;
      if (after) setTimeout(after, 250);
    }, 220);
  }

  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); go(el.dataset.go); });
  });
  window.addEventListener('resize', placeLine);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeLine);

  var start = (location.hash || '').slice(1);
  show(order.indexOf(start) > -1 ? start : 'accueil', true);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  document.addEventListener('keydown', function (e) {
    if (!modal.hidden) {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      return;
    }
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var i = order.indexOf(current);
    if (e.key === 'ArrowRight') go(order[(i + 1) % order.length]);
    else if (e.key === 'ArrowLeft') go(order[(i - 1 + order.length) % order.length]);
  });

  /* ========== Thème clair / sombre ========== */
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

  /* ========== Compteurs ========== */
  function countUp() {
    $$('#accueil [data-count]').forEach(function (n) {
      var end = +n.dataset.count;
      if (reduce) { n.textContent = end; return; }
      var from = end > 1000 ? end - 30 : 0, t0 = null;
      (function stepC(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1200, 1), k = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(from + (end - from) * k);
        if (p < 1) requestAnimationFrame(stepC);
      })(performance.now());
    });
  }

  /* ========== Filtres ========== */
  var fbtn = $$('.filters button'), count = $('#count');
  function filter(f) {
    var n = 0;
    fbtn.forEach(function (b) { var on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    $$('.proj').forEach(function (p) {
      var hit = f === 'all' || p.dataset.c.split(' ').indexOf(f) > -1;
      p.classList.toggle('dim', !hit);
      p.tabIndex = hit ? 0 : -1;
      if (hit) n++;
    });
    count.textContent = n + (n > 1 ? ' réalisations' : ' réalisation') + (f === 'all' ? '' : ' · ' + f);
  }
  fbtn.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });

  /* ========== Fenêtre de détail ========== */
  var modal = $('#modal'), projs = $$('.proj'), mi = 0, lastFocus = null;
  function fill(i) {
    mi = (i + projs.length) % projs.length;
    var p = projs[mi], d = $('.detail', p);
    $('#m-ref').textContent = $('.meta b', p).textContent;
    $('#m-title').textContent = $('h3', p).textContent;
    $('#m-ctx').textContent = d.dataset.ctx;
    var body = $('#m-body'); body.innerHTML = '';
    $$('[data-h]', d).forEach(function (s) {
      var h = document.createElement('h4'); h.textContent = s.dataset.h; body.appendChild(h);
      var txt = s.textContent;
      if (s.dataset.h === 'Missions') {
        var ul = document.createElement('ul');
        txt.split('|').forEach(function (m) { var li = document.createElement('li'); li.textContent = m; ul.appendChild(li); });
        body.appendChild(ul);
      } else if (s.dataset.h === 'Outils') {
        var w = document.createElement('div'); w.className = 'tags';
        txt.split(',').forEach(function (o) { var t = document.createElement('span'); t.className = 'tag'; t.textContent = o.trim(); w.appendChild(t); });
        body.appendChild(w);
      } else {
        var pp = document.createElement('p'); pp.textContent = txt; body.appendChild(pp);
      }
    });
    var h = document.createElement('h4'); h.textContent = 'Compétences'; body.appendChild(h);
    var tg = $('.tags', p).cloneNode(true); body.appendChild(tg);
    $('.panel', modal).scrollTop = 0;
  }
  function openModal(i) {
    lastFocus = document.activeElement;
    fill(i);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.close', modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
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
  function toast(m) {
    toastEl.textContent = m; toastEl.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }
  function copyMail() {
    var code = $('#email'), t = code.textContent;
    function sel() { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Adresse sélectionnée, faites Ctrl+C'); }
    try { navigator.clipboard.writeText(t).then(function () { toast('Adresse e-mail copiée'); }, sel); } catch (e) { sel(); }
  }
  $('#copy').addEventListener('click', copyMail);
  $('#copy2').addEventListener('click', copyMail);
})();
