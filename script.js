(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Graphe réseau animé dans le hero ---------- */
  var cv = document.getElementById('net');
  if (cv && cv.getContext){
    var ctx = cv.getContext('2d'), nodes = [], W = 0, H = 0, dpr = 1, mouse = {x:-999, y:-999};
    function size(){
      var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      var n = Math.round(Math.min(90, Math.max(30, W * H / 14000)));
      nodes = [];
      for (var i = 0; i < n; i++) nodes.push({
        x: Math.random()*W, y: Math.random()*H,
        vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
        r: Math.random()*1.6 + .8, hub: Math.random() < .08
      });
    }
    function frame(){
      ctx.clearRect(0,0,W,H);
      var max = 130;
      for (var i = 0; i < nodes.length; i++){
        var a = nodes[i];
        if (!reduce){
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
          var dx = mouse.x - a.x, dy = mouse.y - a.y, dm = Math.sqrt(dx*dx + dy*dy);
          if (dm < 160){ a.x += dx * .006; a.y += dy * .006; }
        }
        for (var j = i + 1; j < nodes.length; j++){
          var b = nodes[j], ex = a.x - b.x, ey = a.y - b.y, d = Math.sqrt(ex*ex + ey*ey);
          if (d < max){
            ctx.strokeStyle = 'rgba(120,150,255,' + (1 - d/max) * .32 + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        var md = Math.hypot(mouse.x - a.x, mouse.y - a.y);
        if (md < 160){
          ctx.strokeStyle = 'rgba(255,181,71,' + (1 - md/160) * .5 + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
        ctx.fillStyle = a.hub ? '#ffb547' : 'rgba(170,190,255,.85)';
        ctx.beginPath(); ctx.arc(a.x, a.y, a.hub ? a.r + 1.6 : a.r, 0, Math.PI*2); ctx.fill();
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    size(); frame();
    var rt; window.addEventListener('resize', function(){ clearTimeout(rt); rt = setTimeout(function(){ size(); if (reduce) frame(); }, 150); });
    var hero = cv.parentElement;
    hero.addEventListener('pointermove', function(e){ var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', function(){ mouse.x = mouse.y = -999; });
  }

  /* ---------- Lueur qui suit la souris ---------- */
  var glow = document.querySelector('.glow');
  window.addEventListener('pointermove', function(e){
    if (!glow) return;
    glow.style.setProperty('--gx', e.clientX + 'px'); glow.style.setProperty('--gy', e.clientY + 'px');
  });

  /* ---------- Machine à écrire ---------- */
  var el = document.getElementById('typed');
  var words = ['Développeur web en devenir', 'Étudiant BTS SIO option SLAM', 'Passionné de PHP et JavaScript', 'À la recherche d\'une alternance'];
  if (el && !reduce){
    var w = 0, c = words[0].length, del = true;
    (function tick(){
      var word = words[w];
      c += del ? -1 : 1;
      el.textContent = word.slice(0, c);
      var t = del ? 35 : 65;
      if (!del && c === word.length){ del = true; t = 1800; }
      else if (del && c === 0){ del = false; w = (w + 1) % words.length; t = 300; }
      setTimeout(tick, t);
    })();
  }

  /* ---------- Compteurs ---------- */
  var counted = false;
  function count(){
    if (counted) return; counted = true;
    document.querySelectorAll('[data-count]').forEach(function(n){
      var end = +n.dataset.count, t0 = null;
      if (reduce){ n.textContent = end; return; }
      n.textContent = '0';
      (function step(ts){
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / 1200, 1), e = 1 - Math.pow(1 - p, 3);
        n.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }

  /* ---------- Apparition au scroll + nav active ---------- */
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting){
          e.target.classList.add('shown');
          if (e.target.classList.contains('stats')) count();
          io.unobserve(e.target);
        }
      });
    }, {threshold:.12});
    document.querySelectorAll('.reveal').forEach(function(s){
      var r = s.getBoundingClientRect();
      if (r.top > window.innerHeight) io.observe(s);
      else if (s.classList.contains('stats')) count();
    });
    var links = document.querySelectorAll('nav ul a');
    var nio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, {rootMargin:'-45% 0px -50% 0px'});
    document.querySelectorAll('main section[id]').forEach(function(s){ nio.observe(s); });
  } else count();

  /* ---------- Projets : halo au survol ---------- */
  document.querySelectorAll('.proj').forEach(function(p){
    p.addEventListener('pointermove', function(e){
      var r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (e.clientX - r.left) + 'px'); p.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Filtre par compétence ---------- */
  var fb = document.querySelectorAll('.filters button');
  fb.forEach(function(b){
    b.addEventListener('click', function(){
      fb.forEach(function(x){ x.classList.remove('on'); x.setAttribute('aria-pressed','false'); });
      b.classList.add('on'); b.setAttribute('aria-pressed','true');
      var f = b.dataset.f;
      document.querySelectorAll('.proj').forEach(function(p){
        p.classList.toggle('dim', f !== 'all' && p.dataset.c.split(' ').indexOf(f) === -1);
      });
    });
  });

  /* ---------- Tableau de synthèse → projet ---------- */
  document.querySelectorAll('tbody tr[data-go]').forEach(function(tr){
    tr.addEventListener('click', function(){
      var t = document.getElementById(tr.dataset.go); if (!t) return;
      fb.forEach(function(x){ x.classList.toggle('on', x.dataset.f === 'all'); });
      document.querySelectorAll('.proj').forEach(function(p){ p.classList.remove('dim'); });
      t.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block:'center'});
      t.classList.remove('flash'); void t.offsetWidth; t.classList.add('flash');
    });
  });

  /* ---------- Copier l'email ---------- */
  var toast = document.querySelector('.toast');
  function say(m){ toast.textContent = m; toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); }, 1800); }
  var cp = document.getElementById('copy');
  if (cp) cp.addEventListener('click', function(){
    var code = document.getElementById('email'), t = code.textContent;
    function sel(){ var r = document.createRange(); r.selectNodeContents(code); var s = getSelection(); s.removeAllRanges(); s.addRange(r); say('Adresse sélectionnée, fais Ctrl+C'); }
    try { navigator.clipboard.writeText(t).then(function(){ say('Adresse copiée'); }, sel); } catch(e){ sel(); }
  });
})();
