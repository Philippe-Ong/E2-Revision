/* Recherche globale et bascule clair/sombre du site E2-Revision. */
(function () {
  'use strict';
  var bascule = document.querySelector('.bascule');
  if (bascule) {
    var cle = 'e2-revision-theme';
    var enregistre = null;
    try { enregistre = localStorage.getItem(cle); } catch (e) {}
    if (enregistre === 'dark' || enregistre === 'light') {
      document.documentElement.setAttribute('data-theme', enregistre);
    }
    bascule.addEventListener('click', function () {
      var actuel = document.documentElement.getAttribute('data-theme');
      if (actuel !== 'dark' && actuel !== 'light') {
        actuel = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var suivant = actuel === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', suivant);
      try { localStorage.setItem(cle, suivant); } catch (e) {}
    });
  }

  var champ = document.getElementById('recherche');
  var zone = document.getElementById('resultats');
  var accueil = document.getElementById('accueil');
  if (!champ || !zone || !accueil) return;

  fetch('assets/manifeste.json').then(function (r) { return r.json(); }).then(function (donnees) {
    var fiches = [];
    donnees.cours.forEach(function (cours) {
      cours.pages.forEach(function (page) {
        fiches.push({
          titre: page.t, url: cours.code + '/' + page.u, cours: cours.code,
          nom: cours.nom, categorie: page.c, sections: page.s, labos: page.l,
          qcm: page.q, examens: page.e
        });
      });
    });
    var categories = {theorie: 'Théorie', exercices: 'Exercice', concepts: 'Concepts',
                      manuel: 'Manuel', animations: 'Animation', autre: 'Page'};

    function carte(f) {
      var meta = [];
      if (f.sections) meta.push(f.sections + ' sections');
      if (f.labos) meta.push(f.labos + ' laboratoires');
      if (f.qcm) meta.push(f.qcm + ' QCM');
      if (f.examens && f.examens.length) meta.push(f.examens[0]);
      var a = document.createElement('a');
      a.className = 'fiche';
      a.href = f.url;
      var h = document.createElement('h3');
      h.textContent = f.titre;
      a.appendChild(h);
      var p = document.createElement('p');
      p.textContent = f.cours + ' · ' + f.nom + ' — ' + (categories[f.categorie] || f.categorie);
      a.appendChild(p);
      var m = document.createElement('span');
      m.className = 'meta';
      m.textContent = meta.join(' · ');
      a.appendChild(m);
      return a;
    }

    function filtrer() {
      var q = champ.value.trim().toLowerCase();
      zone.innerHTML = '';
      if (!q) {
        zone.hidden = true;
        accueil.hidden = false;
        return;
      }
      accueil.hidden = true;
      zone.hidden = false;
      var trouves = fiches.filter(function (f) {
        return (f.titre + ' ' + f.cours + ' ' + f.nom + ' ' + (f.examens || []).join(' '))
          .toLowerCase().indexOf(q) !== -1;
      });
      var grille = document.createElement('div');
      grille.className = 'grille';
      trouves.forEach(function (f) { grille.appendChild(carte(f)); });
      if (!trouves.length) {
        var p = document.createElement('p');
        p.className = 'suggestions';
        p.textContent = 'Aucune fiche ne correspond à « ' + champ.value.trim() + ' ».';
        zone.appendChild(p);
      } else {
        var n = document.createElement('p');
        n.className = 'suggestions';
        n.textContent = trouves.length + ' fiche' + (trouves.length > 1 ? 's' : '');
        zone.appendChild(n);
        zone.appendChild(grille);
      }
    }
    champ.addEventListener('input', filtrer);
    filtrer();
  });
})();
