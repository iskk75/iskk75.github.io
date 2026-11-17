/* =====================================================================
   script.js — Portfolio Issak Dirir
   1. Génère les cartes des réalisations et le tableau E5 depuis projets.js
   2. Gère les filtres, la fenêtre de détail et la copie de l'e-mail
   3. Ajoute les animations : apparition au défilement, compteurs,
      barre de progression, menu actif, effets de survol à la souris
   ===================================================================== */

/* Respecte le réglage "réduire les animations" de l'ordinateur */
const moinsAnimations = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. Cartes des réalisations ---------- */
const grille = document.getElementById("grille");

PROJETS.forEach(function (projet, i) {
  const carte = document.createElement("button");
  carte.type = "button";
  carte.className = "carte reveal";
  carte.style.setProperty("--n", i % 6);        // décalage de l'animation d'apparition
  carte.dataset.competences = projet.competences.join(" ");
  // Une ligne par réalisation : numéro, titre + résumé, cadre + compétences, flèche
  carte.innerHTML =
    '<span class="num">' + projet.ref.replace("RP-", "") + "</span>" +
    '<span class="corps"><h3>' + projet.titre + "</h3><p>" + projet.resume + "</p></span>" +
    '<span class="meta"><span class="cadre-ligne">' + projet.cadre + " — " + projet.lieu + "</span>" +
    '<span class="tags">' + projet.competences.map(c => '<span class="tag">' + c + "</span>").join("") + "</span></span>" +
    '<span class="fleche" aria-hidden="true">→</span>';
  carte.addEventListener("click", function () { ouvrirDetail(i); });
  grille.appendChild(carte);
});

/* ---------- 2. Filtres par compétence ---------- */
const filtres = document.getElementById("filtres");
["Toutes"].concat(Object.keys(COMPETENCES)).forEach(function (nom) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.textContent = nom;
  bouton.setAttribute("aria-pressed", nom === "Toutes");
  bouton.addEventListener("click", function () {
    filtres.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", b === bouton));
    grille.querySelectorAll(".carte").forEach(function (carte) {
      const garde = nom === "Toutes" || carte.dataset.competences.includes(nom);
      carte.classList.toggle("estompee", !garde);
    });
  });
  filtres.appendChild(bouton);
});

/* ---------- 3. Fenêtre de détail ---------- */
const fenetre = document.getElementById("detail");
const liste = items => "<ul>" + items.map(m => "<li>" + m + "</li>").join("") + "</ul>";

function ouvrirDetail(i) {
  const p = PROJETS[i];
  let html =
    '<span class="label">' + p.ref + "</span>" +
    '<h3 id="detail-titre">' + p.titre + "</h3>" +
    '<p class="cadre">' + p.cadre + " · " + p.lieu + " · " + p.periode + "</p>" +
    "<h4>Contexte</h4><p>" + p.contexte + "</p>";
  if (p.missions) html += "<h4>Missions</h4>" + liste(p.missions);
  // Rubriques libres (Mon rôle, Démarche, Résultat…) : texte ou liste
  (p.details || []).forEach(function (d) {
    html += "<h4>" + d.titre + "</h4>" + (d.liste ? liste(d.liste) : "<p>" + d.texte + "</p>");
  });
  html +=
    '<h4>Outils</h4><div class="tags">' + p.outils.map(o => '<span class="tag">' + o + "</span>").join("") + "</div>" +
    '<h4>Compétences</h4><div class="tags">' + p.competences.map(c => '<span class="tag">' + c + " · " + COMPETENCES[c] + "</span>").join("") + "</div>";
  // Documents liés (PDF, PowerPoint…)
  if (p.documents && p.documents.length) {
    html += '<div class="documents">' + p.documents.map(function (doc, k) {
      const classe = k === 0 ? "btn btn-primary" : "btn btn-ghost";
      const cible = doc.telecharger ? " download" : ' target="_blank" rel="noopener"';
      return '<a class="' + classe + '" href="' + doc.href + '"' + cible + ">" + doc.label + "</a>";
    }).join("") + "</div>";
  }
  document.getElementById("detail-contenu").innerHTML = html;
  fenetre.showModal();   // la touche Échap ferme la fenêtre automatiquement
  fenetre.scrollTop = 0;
}
fenetre.querySelector(".fermer").addEventListener("click", () => fenetre.close());
fenetre.addEventListener("click", function (e) { if (e.target === fenetre) fenetre.close(); }); // clic en dehors

/* ---------- 4. Tableau de synthèse E5 ---------- */
const codes = Object.keys(COMPETENCES);
let html = "<thead><tr><th scope='col' style='text-align:left'>Réalisation</th>";
codes.forEach(c => html += "<th scope='col'><b>" + c + "</b></th>");
html += "</tr></thead><tbody>";

let n = 0;   // numéro de la coche, pour les faire apparaître l'une après l'autre
PROJETS.forEach(function (p, i) {
  html += "<tr data-i='" + i + "'><th scope='row'><small>" + p.ref + "</small>" + p.titre + "</th>";
  codes.forEach(function (c) {
    html += p.competences.includes(c)
      ? "<td><span class='coche' style='--n:" + (n++) + "' aria-label='oui'>✓</span></td>"
      : "<td class='vide'>–</td>";
  });
  html += "</tr>";
});

// Ligne "Total" calculée automatiquement
html += "</tbody><tfoot><tr><th>Total</th>";
codes.forEach(c => html += "<td>" + PROJETS.filter(p => p.competences.includes(c)).length + "</td>");
html += "</tr></tfoot>";

const tableau = document.getElementById("tableau");
tableau.innerHTML = html;
tableau.querySelectorAll("tbody tr").forEach(tr => tr.addEventListener("click", () => ouvrirDetail(Number(tr.dataset.i))));

document.getElementById("legende").innerHTML =
  codes.map(c => "<div><dt>" + c + "</dt><dd>" + COMPETENCES[c] + "</dd></div>").join("");

/* Chiffres clés calculés depuis les données */
const couvertes = codes.filter(c => PROJETS.some(p => p.competences.includes(c))).length;
document.getElementById("nb-projets").textContent = PROJETS.length;
document.getElementById("nb-competences").textContent = couvertes + "/" + codes.length;

/* ---------- 5. Copier l'adresse e-mail ---------- */
const toast = document.getElementById("toast");
function afficherMessage(texte) {
  toast.textContent = texte;
  toast.classList.add("montre");
  setTimeout(() => toast.classList.remove("montre"), 1800);
}
document.getElementById("copier").addEventListener("click", function () {
  const email = document.getElementById("email").textContent;
  navigator.clipboard.writeText(email)
    .then(() => afficherMessage("Adresse e-mail copiée"))
    .catch(() => afficherMessage(email));
});

/* =====================================================================
   ANIMATIONS
   ===================================================================== */

/* ---------- 6. Titre : les mots apparaissent un par un ---------- */
const titre = document.querySelector(".hero h1");
if (!moinsAnimations) {
  titre.innerHTML = titre.textContent.split(" ")
    .map((mot, i) => '<span class="mot" style="--n:' + i + '">' + mot + "</span>")
    .join(" ");
}

/* ---------- 7. Apparition des blocs au défilement ---------- */
// On marque les éléments à animer, puis un IntersectionObserver ajoute
// la classe "visible" quand ils entrent dans l'écran.
document.querySelectorAll(".section .label, .section h2, .sous-titre, .ledger > li, .domaines article, .stats div, .table-scroll, .accordeon details, .ligne, .sources")
  .forEach(function (el) {
    el.classList.add("reveal");
    // décalage en cascade entre éléments voisins
    el.style.setProperty("--n", Array.from(el.parentElement.children).indexOf(el) % 5);
  });

const observateur = new IntersectionObserver(function (entrees) {
  entrees.forEach(function (entree) {
    if (entree.isIntersecting) {
      entree.target.classList.add("visible");
      observateur.unobserve(entree.target);   // l'animation ne se joue qu'une fois
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observateur.observe(el));

/* ---------- 8. Compteurs des chiffres clés ---------- */
// "3 ans" compte de 0 à 3, "6/6" de 0/6 à 6/6, etc.
function animerCompteur(el) {
  const texte = el.textContent;
  const cible = parseInt(texte, 10);
  const suite = texte.replace(String(cible), "");   // " ans" ou "/6"
  const debut = performance.now();
  function etape(t) {
    const avance = Math.min((t - debut) / 1200, 1);
    const doux = 1 - Math.pow(1 - avance, 3);         // ralentit à la fin
    el.textContent = Math.round(cible * doux) + suite;
    if (avance < 1) requestAnimationFrame(etape);
  }
  requestAnimationFrame(etape);
}
if (!moinsAnimations) {
  const obsCompteurs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { animerCompteur(e.target); obsCompteurs.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll(".stats strong").forEach(el => obsCompteurs.observe(el));
}

/* ---------- 9. Au défilement : barre de progression, menu, frise ---------- */
const barre = document.createElement("div");
barre.className = "progression";
document.body.prepend(barre);

const nav = document.querySelector(".nav");
const frise = document.querySelector(".ledger");
const liensMenu = document.querySelectorAll(".nav nav a");
const sections = Array.from(liensMenu).map(a => document.querySelector(a.getAttribute("href")));

function auDefilement() {
  const y = window.scrollY;
  const hauteur = document.documentElement.scrollHeight - window.innerHeight;

  // Barre de progression de lecture
  barre.style.transform = "scaleX(" + (hauteur > 0 ? y / hauteur : 0) + ")";

  // Menu plus compact et bordé une fois qu'on a défilé
  nav.classList.toggle("defile", y > 20);

  // Lien du menu correspondant à la section visible
  let active = null;
  sections.forEach(function (s, i) { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) active = i; });
  liensMenu.forEach((a, i) => a.classList.toggle("actif", i === active));

  // La ligne de la frise se dessine au fil du défilement
  const r = frise.getBoundingClientRect();
  const trace = (window.innerHeight * 0.7 - r.top) / r.height;
  frise.style.setProperty("--trace", Math.max(0, Math.min(1, trace)));
}
window.addEventListener("scroll", auDefilement, { passive: true });
auDefilement();

/* ---------- 10. Effets de survol ----------
   Volontairement sobres : les survols (cartes, boutons, liens) sont gérés
   en CSS. Pas de curseur personnalisé ni d'effet 3D sur les cartes. */

/* ---------- 11. Rideau d'ouverture ---------- */
const rideau = document.getElementById("rideau");
if (moinsAnimations) rideau.remove();
else setTimeout(function () {
  rideau.classList.add("leve");
  setTimeout(() => rideau.remove(), 1100);
}, 700);

/* ---------- 12. Bandeau d'outils : défilement infini, accéléré par le scroll ---------- */
// La liste des outils est construite à partir de projets.js (sans doublons)
const outils = [...new Set(PROJETS.flatMap(p => p.outils).concat(["PowerShell", "Bash", "Salesforce", "Office 365"]))];
const piste = document.getElementById("bandeau");
// On met la liste deux fois à la suite : quand la 1re moitié est sortie, on revient au début sans que ça se voie
piste.innerHTML = outils.concat(outils).map(o => "<span>" + o + "</span>").join("");
let decalage = 0, vitesse = 0, dernierY = window.scrollY;
(function defiler() {
  const y = window.scrollY;
  vitesse += (Math.abs(y - dernierY) * 0.4 - vitesse) * 0.1;   // plus on scrolle vite, plus il accélère
  dernierY = y;
  if (!moinsAnimations) decalage -= 0.5 + vitesse;
  const moitie = piste.scrollWidth / 2;
  if (-decalage >= moitie) decalage += moitie;
  piste.style.translate = decalage + "px 0";
  requestAnimationFrame(defiler);
})();

/* ---------- 13. Libellés "brouillés" façon terminal ---------- */
// Quand un libellé apparaît, ses lettres défilent au hasard avant de se fixer
const signes = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>_";
function brouiller(el) {
  const final = el.textContent;
  let tour = 0;
  el.classList.add("brouille");
  const minuteur = setInterval(function () {
    el.textContent = final.split("").map(function (c, i) {
      if (c === " " || i < tour) return c;
      return signes[Math.floor(Math.random() * signes.length)];
    }).join("");
    tour += 1;
    if (tour > final.length) { clearInterval(minuteur); el.textContent = final; el.classList.remove("brouille"); }
  }, 28);
}
if (!moinsAnimations) {
  const obsLabels = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (e) {
      if (e.isIntersecting) { brouiller(e.target); obsLabels.unobserve(e.target); }
    });
  }, { threshold: 1 });
  document.querySelectorAll(".label").forEach(el => obsLabels.observe(el));
}

/* ---------- 14. Bouton "retour en haut" ---------- */
const haut = document.createElement("button");
haut.className = "haut";
haut.type = "button";
haut.setAttribute("aria-label", "Revenir en haut de la page");
haut.innerHTML = '<svg viewBox="0 0 48 48"><circle class="piste" cx="24" cy="24" r="22"/><circle class="avance" cx="24" cy="24" r="22"/></svg>↑';
haut.addEventListener("click", () => window.scrollTo({ top: 0 }));
document.body.appendChild(haut);
window.addEventListener("scroll", function () {
  const hauteur = document.documentElement.scrollHeight - window.innerHeight;
  haut.style.setProperty("--p", window.scrollY / hauteur);
  haut.classList.toggle("montre", window.scrollY > 600);
}, { passive: true });

/* =====================================================================
   15. GLOBE RÉSEAU EN 3D
   Des points répartis sur une sphère (les équipements), reliés à leurs
   voisins (les câbles). Des paquets de données circulent sur les liens.
   La sphère tourne seule, suit la souris et accélère quand on scrolle.
   Principe 3D : on fait tourner chaque point (x, y, z) avec un peu de
   trigonométrie, puis on le projette en 2D (perspective : plus un point
   est loin, plus il est petit et proche du centre).
   ===================================================================== */
(function () {
  const zone = document.getElementById("globe");
  const toileArriere = zone.querySelector(".globe-arriere");
  const ctxA = toileArriere.getContext("2d");
  const ctxV = ctxA;   // un seul canvas : tout le globe reste derrière le portrait
  const couleur = getComputedStyle(document.documentElement).getPropertyValue("--indigo").trim();

  // 1. Points sur la sphère (répartition "spirale de Fibonacci" : régulière, sans trou)
  const NB = 80, points = [];
  for (let i = 0; i < NB; i++) {
    const y = 1 - (i / (NB - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const a = i * Math.PI * (3 - Math.sqrt(5));
    points.push({ x: Math.cos(a) * r, y: y, z: Math.sin(a) * r });
  }

  // 2. Liens : chaque point est relié à ses 3 voisins les plus proches
  const liens = [];
  points.forEach(function (p, i) {
    points.map((q, j) => ({ j: j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2 }))
      .filter(o => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 3)
      .forEach(function (o) { if (!liens.some(l => l[0] === o.j && l[1] === i)) liens.push([i, o.j]); });
  });

  // 3. Paquets de données qui voyagent sur les liens
  const paquets = Array.from({ length: 14 }, () => ({ lien: Math.floor(Math.random() * liens.length), t: Math.random() }));

  let taille = 0, rotY = 0, rotX = -0.3, cibleX = -0.3, cibleY = 0, visible = true, dernierScroll = window.scrollY;

  function dimensionner() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    taille = zone.clientWidth;
    toileArriere.width = taille * dpr; toileArriere.height = taille * dpr;
    ctxA.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Rotation 3D puis projection en perspective
  function projeter(p) {
    let x = p.x * Math.cos(rotY) - p.z * Math.sin(rotY);
    let z = p.x * Math.sin(rotY) + p.z * Math.cos(rotY);
    let y = p.y * Math.cos(rotX) - z * Math.sin(rotX);
    z = p.y * Math.sin(rotX) + z * Math.cos(rotX);
    const rayon = taille * 0.46;
    const persp = 3 / (3 + z);              // perspective
    return { x: taille / 2 + x * rayon * persp, y: taille / 2 + y * rayon * persp, z: z, persp: persp };
  }

  function dessiner() {
    if (visible) {
      // La sphère tourne seule + un peu plus vite quand on scrolle
      const y = window.scrollY;
      rotY += 0.003 + Math.abs(y - dernierScroll) * 0.0008;
      dernierScroll = y;
      rotX += (cibleX - rotX) * 0.05;
      rotY += cibleY * 0.02;

      const proj = points.map(projeter);
      ctxA.clearRect(0, 0, taille, taille);

      // z > 0 : point à l'arrière (dessiné derrière la photo) ; z < 0 : à l'avant
      liens.forEach(function (l) {
        const a = proj[l[0]], b = proj[l[1]];
        const ctx = (a.z + b.z) / 2 > 0 ? ctxA : ctxV;
        ctx.strokeStyle = couleur;
        ctx.globalAlpha = 0.06 + (1 - (a.z + b.z) / 2) * 0.1;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      proj.forEach(function (p) {
        const ctx = p.z > 0 ? ctxA : ctxV;
        ctx.globalAlpha = 0.2 + (1 - p.z) * 0.2;
        ctx.fillStyle = couleur;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.2 * p.persp, 0, Math.PI * 2); ctx.fill();
      });
      // Paquets : un petit point lumineux qui avance le long d'un lien
      paquets.forEach(function (pq) {
        pq.t += 0.012;
        if (pq.t > 1) { pq.t = 0; pq.lien = Math.floor(Math.random() * liens.length); }
        const a = proj[liens[pq.lien][0]], b = proj[liens[pq.lien][1]];
        const x = a.x + (b.x - a.x) * pq.t, yy = a.y + (b.y - a.y) * pq.t, z = a.z + (b.z - a.z) * pq.t;
        const ctx = z > 0 ? ctxA : ctxV;
        ctx.globalAlpha = 1;
        ctx.fillStyle = couleur;
        ctx.shadowColor = couleur; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, yy, 2.6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      });
    }
    if (!moinsAnimations) requestAnimationFrame(dessiner);
  }

  // La souris incline le globe
  zone.addEventListener("pointermove", function (e) {
    const r = zone.getBoundingClientRect();
    cibleY = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
    cibleX = -0.3 + ((e.clientY - r.top) / r.height - 0.5) * 0.8;
  });
  zone.addEventListener("pointerleave", function () { cibleY = 0; cibleX = -0.3; });

  // On arrête de dessiner quand le globe n'est plus à l'écran (économie de batterie)
  new IntersectionObserver(e => visible = e[0].isIntersecting).observe(zone);

  dimensionner();
  window.addEventListener("resize", dimensionner);
  dessiner();
})();
