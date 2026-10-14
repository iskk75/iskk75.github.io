(function () {
  'use strict';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================= Onglets + transition ================= */
  var views = $$('.view');
  var order = views.map(function (v) { return v.id; });
  var tabs = $$('.tabs a');
  var pill = $('.pill');
  var wipe = $('.wipe');
  var label = $('#wipe-label');
  var current = 'accueil';
  var busy = false, queued = null;

  function placePill() {
    var a = $('.tabs a[aria-current="page"]');
    if (!a || !pill) return;
    pill.style.width = a.offsetWidth + 'px';
    pill.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    if (a.scrollIntoView && a.parentElement.scrollWidth > a.parentElement.clientWidth) {
      a.parentElement.scrollTo({ left: a.offsetLeft - 40, behavior: reduce ? 'auto' : 'smooth' });
    }
  }

  function show(id, initial) {
    views.forEach(function (v) { v.hidden = v.id !== id; v.classList.remove('enter'); });
    var v = document.getElementById(id);
    $$('.rv', v).forEach(function (el, i) { el.style.setProperty('--i', Math.min(i, 14)); });
    void v.offsetWidth;
    v.classList.add('enter');
    tabs.forEach(function (a) {
      if (a.dataset.go === id) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    current = id;
    placePill();
    window.scrollTo(0, 0);
    if (!initial) { try { history.replaceState(null, '', '#' + id); } catch (e) {} }
    if (id === 'accueil') countUp();
  }

  function go(id, after) {
    if (order.indexOf(id) === -1) return;
    if (busy) { queued = [id, after]; return; }
    if (id === current) { if (after) after(); return; }
    if (reduce) { show(id); if (after) after(); return; }
    busy = true;
    label.textContent = document.getElementById(id).dataset.label;
    wipe.classList.remove('reset', 'out');
    void wipe.offsetWidth;
    wipe.classList.add('in');
    setTimeout(function () {
      show(id);
      setTimeout(function () {
        wipe.classList.add('out');
        setTimeout(function () {
          wipe.classList.add('reset');
          wipe.classList.remove('in', 'out');
          busy = false;
          if (after) after();
          if (queued) { var q = queued; queued = null; go(q[0], q[1]); }
        }, 680);
      }, 160);
    }, 650);
  }

  $$('[data-go]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); go(el.dataset.go); });
  });
  window.addEventListener('resize', placePill);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placePill);

  var start = (location.hash || '').slice(1);
  show(order.indexOf(start) > -1 ? start : 'accueil', true);
  window.addEventListener('load', function () { window.scrollTo(0, 0); });

  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var i = order.indexOf(current);
    if (e.key === 'ArrowRight') go(order[(i + 1) % order.length]);
    else if (e.key === 'ArrowLeft') go(order[(i - 1 + order.length) % order.length]);
    else if (/^[1-6]$/.test(e.key)) go(order[+e.key - 1]);
  });

  /* ================= Thème jour / nuit ================= */
  var root = document.documentElement;
  try { var saved = localStorage.getItem('theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  function isDark() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  }
  function toggleTheme() {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    toast(next === 'dark' ? 'Tirage de nuit' : 'Tirage de jour');
  }
  $('#theme').addEventListener('click', toggleTheme);

  /* ================= Curseur encre + décalage d'impression ================= */
  var blob = $('.blob'), name = $('.name .p');
  var bx = -100, by = -100, tx = -100, ty = -100;
  if (fine && !reduce && blob) {
    blob.classList.add('on');
    (function loop() {
      bx += (tx - bx) * .2; by += (ty - by) * .2;
      blob.style.transform = 'translate(' + bx + 'px,' + by + 'px)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('pointerover', function (e) {
      var hot = e.target.closest && e.target.closest('a,button,.card,.stk,summary,tbody tr,.vcard,input');
      blob.classList.toggle('big', !!hot);
    });
    document.addEventListener('pointerleave', function () { blob.classList.remove('on'); });
    document.addEventListener('pointerenter', function () { blob.classList.add('on'); });
  }
  window.addEventListener('pointermove', function (e) {
    tx = e.clientX; ty = e.clientY;
    if (name && !reduce) {
      var mx = (e.clientX / window.innerWidth - .5) * 18, my = (e.clientY / window.innerHeight - .5) * 14;
      name.style.setProperty('--mx', (7 + mx).toFixed(1) + 'px');
      name.style.setProperty('--my', (6 + my).toFixed(1) + 'px');
    }
  });

  /* ================= Boutons magnétiques ================= */
  if (fine && !reduce) $$('.mag').forEach(function (b) {
    b.addEventListener('pointermove', function (e) {
      var r = b.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) * .25, y = (e.clientY - r.top - r.height / 2) * .35;
      b.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    });
    b.addEventListener('pointerleave', function () { b.style.transform = ''; });
  });

  /* ================= Machine à écrire ================= */
  var typed = $('#typed');
  var words = ['Développeur web en devenir', 'Fan de PHP et de JavaScript', 'Toujours en train d\'apprendre', 'Cherche une alternance'];
  if (typed && !reduce) {
    var w = 0, c = words[0].length, del = true;
    (function tick() {
      var word = words[w];
      c += del ? -1 : 1;
      typed.textContent = word.slice(0, c);
      var t = del ? 30 : 60;
      if (!del && c === word.length) { del = true; t = 2000; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; t = 250; }
      setTimeout(tick, t);
    })();
  }

  /* ================= Compteurs ================= */
  function countUp() {
    $$('#accueil [data-count]').forEach(function (n) {
      var end = +n.dataset.count;
      if (reduce) { n.textContent = end; return; }
      var t0 = null, from = end > 1000 ? end - 40 : 0;
      (function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1300, 1), k = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(from + (end - from) * k);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }

  /* ================= Terminal ================= */
  var out = $('#out'), form = $('#cmd-form'), input = $('#cmd');
  var hist = [], hi = 0;
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function print(html) { var d = document.createElement('div'); d.innerHTML = html; out.appendChild(d); out.scrollTop = out.scrollHeight; }
  function link(cmd, txt) { return '<button type="button" data-cmd="' + cmd + '">' + (txt || cmd) + '</button>'; }
  var cmds = {
    aide: function () {
      return '<span class="h">Commandes disponibles</span>\n' +
        '  ' + link('whoami') + '        qui je suis\n' +
        '  ' + link('competences') + '   mes langages et outils\n' +
        '  ' + link('projets') + '       ouvrir mes réalisations\n' +
        '  ' + link('parcours') + '      formation et stages\n' +
        '  ' + link('synthese') + '      tableau E5\n' +
        '  ' + link('veille') + '        veille technologique\n' +
        '  ' + link('contact') + '       me contacter\n' +
        '  ' + link('theme') + '         jour / nuit\n' +
        '  ' + link('ls') + ' · ' + link('date') + ' · ' + link('clear');
    },
    whoami: function () { return 'Issak Dirir, étudiant en <span class="h">BTS SIO option SLAM</span>.\nJ\'aime construire des applis web utiles et comprendre comment tout fonctionne derrière.'; },
    competences: function () {
      return '<span class="h">back </span>  PHP · Symfony · SQL · Node.js\n<span class="h">front</span>  HTML · CSS · JavaScript\n<span class="h">outils</span> Git · Linux · GLPI · Docker';
    },
    ls: function () { return 'accueil/  parcours/  realisations/  synthese/  veille/  contact/  cv.pdf'; },
    'cat cv.pdf': function () { return 'Fichier binaire. Le CV est disponible sur demande : tape ' + link('contact') + '.'; },
    date: function () { return new Date().toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }); },
    theme: function () { toggleTheme(); return 'Thème changé.'; },
    projets: function () { setTimeout(function () { go('realisations'); }, 350); return 'Ouverture des réalisations…'; },
    realisations: function () { return cmds.projets(); },
    parcours: function () { setTimeout(function () { go('parcours'); }, 350); return 'Ouverture du parcours…'; },
    synthese: function () { setTimeout(function () { go('synthese'); }, 350); return 'Ouverture du tableau de synthèse…'; },
    veille: function () { setTimeout(function () { go('veille'); }, 350); return 'Ouverture de la veille…'; },
    contact: function () { setTimeout(function () { go('contact'); }, 350); return 'Ouverture du contact…'; },
    help: function () { return cmds.aide(); },
    clear: function () { out.innerHTML = ''; return null; }
  };
  function run(raw) {
    var c = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!c) return;
    print('<span class="u">issak@sio:~$</span> ' + esc(raw.trim()));
    hist.push(raw.trim()); hi = hist.length;
    var r;
    if (cmds[c]) r = cmds[c]();
    else if (c.indexOf('sudo') === 0) r = '<span class="e">Permission refusée.</span> Il faut d\'abord valider le BTS.';
    else if (c === 'rm -rf /' || c === 'rm -rf') r = '<span class="e">Bien essayé.</span> Ce portfolio est protégé.';
    else if (c === 'hello' || c === 'bonjour' || c === 'salut') r = 'Salut ! Tape ' + link('aide') + ' pour voir ce que je sais faire.';
    else r = '<span class="e">commande introuvable :</span> ' + esc(c) + '. Tape ' + link('aide') + '.';
    if (r) print(r);
  }
  print('Bienvenue sur mon portfolio.\nTape ' + link('aide') + ' ou clique sur une commande.');
  form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value); input.value = ''; });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' && hist.length) { hi = Math.max(0, hi - 1); input.value = hist[hi]; e.preventDefault(); }
    if (e.key === 'ArrowDown' && hist.length) { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-cmd]');
    if (b) run(b.dataset.cmd);
  });

  /* ================= Autocollants déplaçables ================= */
  var board = $('#board'), z = 10;
  function fitStickers() {
    var bw = board.clientWidth, bh = board.clientHeight;
    $$('.stk', board).forEach(function (s) {
      var l = s.offsetLeft, t = s.offsetTop;
      if (l + s.offsetWidth > bw - 6) s.style.left = Math.max(0, bw - s.offsetWidth - 6) + 'px';
      if (t + s.offsetHeight > bh - 6) s.style.top = Math.max(0, bh - s.offsetHeight - 6) + 'px';
    });
  }
  fitStickers();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStickers);
  window.addEventListener('resize', fitStickers);
  $$('.stk', board).forEach(function (s) {
    s.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      s.setPointerCapture(e.pointerId);
      s.classList.add('drag');
      s.style.zIndex = ++z;
      var br = board.getBoundingClientRect(), sr = s.getBoundingClientRect();
      var ox = e.clientX - sr.left, oy = e.clientY - sr.top;
      function move(ev) {
        var x = Math.max(0, Math.min(br.width - sr.width, ev.clientX - br.left - ox));
        var y = Math.max(0, Math.min(br.height - sr.height, ev.clientY - br.top - oy));
        s.style.left = x + 'px'; s.style.top = y + 'px';
      }
      function up() {
        s.classList.remove('drag');
        s.style.setProperty('--r', (Math.random() * 16 - 8).toFixed(1) + 'deg');
        s.removeEventListener('pointermove', move);
        s.removeEventListener('pointerup', up);
        s.removeEventListener('pointercancel', up);
      }
      s.addEventListener('pointermove', move);
      s.addEventListener('pointerup', up);
      s.addEventListener('pointercancel', up);
    });
  });

  /* ================= Cartes projets ================= */
  $$('.card').forEach(function (card) {
    card.addEventListener('click', function () { card.classList.toggle('flipped'); });
    if (fine && !reduce) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var dx = ((e.clientX - r.left) / r.width - .5) * -2, dy = ((e.clientY - r.top) / r.height - .5) * -2;
        card.style.setProperty('--sx', (7 + dx * 7).toFixed(1) + 'px');
        card.style.setProperty('--sy', (7 + dy * 7).toFixed(1) + 'px');
      });
      card.addEventListener('pointerleave', function () { card.style.removeProperty('--sx'); card.style.removeProperty('--sy'); });
    }
  });

  var fbtn = $$('.filters button'), count = $('#count');
  function filter(f) {
    fbtn.forEach(function (b) { var on = b.dataset.f === f; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    var n = 0;
    $$('.card').forEach(function (c) {
      var hit = f === 'all' || c.dataset.c.split(' ').indexOf(f) > -1;
      c.classList.toggle('dim', !hit);
      if (hit) n++;
    });
    count.textContent = n + (n > 1 ? ' réalisations affichées' : ' réalisation affichée') + (f === 'all' ? '' : ' pour ' + f);
  }
  fbtn.forEach(function (b) { b.addEventListener('click', function () { filter(b.dataset.f); }); });

  /* ================= Tableau de synthèse ================= */
  var table = $('#matrix');
  function colHi(i) {
    $$('th,td', table).forEach(function (c) { c.classList.remove('col-hi'); });
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
      go('realisations', function () {
        filter('all');
        var card = document.getElementById(tr.dataset.rp);
        card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        setTimeout(function () {
          card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash', 'flipped');
        }, reduce ? 0 : 450);
      });
    });
  });

  /* ================= Carte de visite ================= */
  var vc = $('#vcard');
  function flipVc() { vc.classList.toggle('flipped'); }
  vc.addEventListener('click', flipVc);
  vc.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipVc(); } });

  /* ================= Copier l'email + toast ================= */
  var toastEl = $('.toast'), tt;
  function toast(m) {
    toastEl.textContent = m; toastEl.classList.add('show');
    clearTimeout(tt); tt = setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }
  $('#copy').addEventListener('click', function () {
    var code = $('#email'), t = code.textContent;
    function sel() { var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); toast('Adresse sélectionnée : Ctrl+C'); }
    try { navigator.clipboard.writeText(t).then(function () { toast('Adresse copiée'); }, sel); } catch (e) { sel(); }
  });
})();
