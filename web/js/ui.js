// js/ui.js — Funzioni di rendering DOM

const COLORI_AVATAR = ['#1d9bf0','#7c5cbf','#f06c1d','#2ecc71','#e74c3c','#3498db','#e67e22','#1abc9c'];

function avatarColore(id) {
  return COLORI_AVATAR[(id ?? 0) % COLORI_AVATAR.length];
}

function avatarIni(nome) {
  return (nome ?? '?').split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function avatarEl(nome, id, size = 42) {
  const div = document.createElement('div');
  div.className = 'avatar';
  div.style.background = avatarColore(id);
  div.style.width = size + 'px';
  div.style.height = size + 'px';
  div.style.fontSize = Math.round(size * 0.38) + 'px';
  div.textContent = avatarIni(nome);
  return div;
}

// ============================================================
// Helper
// ============================================================

export function pulisciContenitore(contenitore) {
  contenitore.innerHTML = '';
}

export function mostraErrore(messaggio, contenitore) {
  const div = document.createElement('div');
  div.className = 'errore';
  div.textContent = messaggio;
  contenitore.prepend(div);
  setTimeout(() => div.remove(), 4000);
}

function mostraVuoto(contenitore, testo) {
  contenitore.innerHTML = `<p class="vuoto">${testo}</p>`;
}

// ============================================================
// Utenti — griglia card con avatar
// ============================================================

export function mostraUtenti(utenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (utenti.length === 0) {
    mostraVuoto(contenitore, 'Nessun utente trovato');
    return;
  }

  utenti.forEach((utente) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.appendChild(avatarEl(utente.nome, utente.id, 52));

    const nome = document.createElement('h3');
    nome.textContent = utente.nome;
    card.appendChild(nome);

    const email = document.createElement('p');
    email.textContent = utente.email;
    card.appendChild(email);

    if (utente.citta) {
      const citta = document.createElement('p');
      citta.textContent = '📍 ' + utente.citta;
      card.appendChild(citta);
    }

    if (utente.sesso) {
      const sesso = document.createElement('p');
      sesso.textContent = utente.sesso === 'M' ? '♂ Maschio' : utente.sesso === 'F' ? '♀ Femmina' : utente.sesso;
      card.appendChild(sesso);
    }

    const azioni = document.createElement('div');
    azioni.className = 'azioni';
    azioni.innerHTML = `
      <button class="btn-primario" data-azione="vedi-post">Post</button>
      <button class="btn-secondario" data-azione="modifica">Modifica</button>
      <button class="btn-pericolo" data-azione="elimina">Elimina</button>
    `;
    card.appendChild(azioni);

    card.querySelector('[data-azione="vedi-post"]').addEventListener('click', () => callbacks.onVediPost(utente));
    card.querySelector('[data-azione="modifica"]').addEventListener('click', () => callbacks.onModifica(utente));
    card.querySelector('[data-azione="elimina"]').addEventListener('click', () => callbacks.onElimina(utente.id));

    contenitore.appendChild(card);
  });
}

// ============================================================
// Post — feed card con avatar e stile social
// ============================================================

export function mostraPost(post, contenitore, callbacks, utenteLoggato) {
  pulisciContenitore(contenitore);

  if (post.length === 0) {
    mostraVuoto(contenitore, 'Nessun post trovato');
    return;
  }

  post.forEach((p) => {
    const puoEliminare =
      utenteLoggato &&
      (utenteLoggato.id === p.userId || utenteLoggato.ruolo === 'admin');

    const card = document.createElement('div');
    card.className = 'post-card';

    // Header con avatar
    const header = document.createElement('div');
    header.className = 'post-header';
    header.appendChild(avatarEl('Utente ' + p.userId, p.userId));

    const meta = document.createElement('div');
    meta.className = 'post-meta';
    meta.innerHTML = `
      <div class="post-autore">Utente #${p.userId}</div>
      <div class="post-id">Post #${p.id}</div>
    `;
    header.appendChild(meta);
    card.appendChild(header);

    // Contenuto
    const titolo = document.createElement('div');
    titolo.className = 'post-titolo';
    titolo.textContent = p.titolo;
    card.appendChild(titolo);

    const corpo = document.createElement('div');
    corpo.className = 'post-corpo';
    corpo.textContent = p.corpo;
    card.appendChild(corpo);

    // Footer con azioni
    const footer = document.createElement('div');
    footer.className = 'post-footer';

    const btnCommenti = document.createElement('button');
    btnCommenti.className = 'btn-commenti-post';
    btnCommenti.textContent = '💬 Vedi commenti';
    btnCommenti.addEventListener('click', () => callbacks.onVediCommenti(p));
    footer.appendChild(btnCommenti);

    if (puoEliminare) {
      const btnElimina = document.createElement('button');
      btnElimina.className = 'btn-pericolo';
      btnElimina.textContent = 'Elimina';
      btnElimina.addEventListener('click', () => callbacks.onElimina(p.id));
      footer.appendChild(btnElimina);
    }

    card.appendChild(footer);
    contenitore.appendChild(card);
  });
}

// ============================================================
// Commenti — card con avatar
// ============================================================

export function mostraCommenti(commenti, contenitore, callbacks) {
  pulisciContenitore(contenitore);

  if (commenti.length === 0) {
    mostraVuoto(contenitore, 'Nessun commento trovato');
    return;
  }

  commenti.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'commento-card';

    card.appendChild(avatarEl(c.nome, c.id));

    const body = document.createElement('div');
    body.className = 'commento-body';
    body.innerHTML = `
      <div class="commento-autore">${c.nome}</div>
      <div class="commento-email">${c.email}</div>
      <div class="commento-corpo">${c.corpo}</div>
    `;
    card.appendChild(body);

    const btnElimina = document.createElement('button');
    btnElimina.className = 'btn-pericolo';
    btnElimina.textContent = 'Elimina';
    btnElimina.addEventListener('click', () => callbacks.onElimina(c.id));
    card.appendChild(btnElimina);

    contenitore.appendChild(card);
  });
}
