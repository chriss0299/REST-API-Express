// js/app.js — Modulo principale
//
// Importa api.js e ui.js, gestisce navigazione, form e drill-down.

import * as api from "./api.js";
import * as ui from "./ui.js";

// ============================================================
// Stato drill-down
// ============================================================

let utenteSelezionato = null; // { id, nome }
let postSelezionato = null; // { id, titolo }
let utenteInModifica = null; // {uttente selezionato per la modifica}
let paginaAttuale = 1;
const LIMITE_POST = 5;

// ============================================================
// Riferimenti DOM
// ============================================================

const sezioni = {
  utenti: document.getElementById("sezione-utenti"),
  post: document.getElementById("sezione-post"),
  commenti: document.getElementById("sezione-commenti"),
};

const navBottoni = {
  utenti: document.getElementById("nav-utenti"),
  post: document.getElementById("nav-post"),
  commenti: document.getElementById("nav-commenti"),
};

const liste = {
  utenti: document.getElementById("lista-utenti"),
  post: document.getElementById("lista-post"),
  commenti: document.getElementById("lista-commenti"),
};

const breadcrumbs = {
  post: document.getElementById("breadcrumb-post"),
  commenti: document.getElementById("breadcrumb-commenti"),
};

const titoli = {
  post: document.getElementById("titolo-post"),
  commenti: document.getElementById("titolo-commenti"),
};

// ============================================================
// Navigazione
// ============================================================

function mostraSezione(nome) {
  for (const [chiave, sezione] of Object.entries(sezioni)) {
    sezione.classList.toggle("nascosta", chiave !== nome);
    navBottoni[chiave].classList.toggle("attivo", chiave === nome);
  }
}

navBottoni.utenti.addEventListener("click", async () => {
  utenteSelezionato = null;
  mostraSezione("utenti");
  await caricaUtenti();
});

navBottoni.post.addEventListener("click", async () => {
  utenteSelezionato = null;
  breadcrumbs.post.innerHTML = "";
  titoli.post.textContent = "Post";
  document.getElementById("post-userId").value = "";
  mostraSezione("post");
  await caricaPost(undefined, 1);
});

navBottoni.commenti.addEventListener("click", async () => {
  postSelezionato = null;
  breadcrumbs.commenti.innerHTML = "";
  titoli.commenti.textContent = "Commenti";
  document.getElementById("commento-postId").value = "";
  mostraSezione("commenti");
  await caricaCommenti();
});

// ============================================================
// Caricamento dati
// ============================================================

async function caricaUtenti() {
  try {
    const utenti = await api.ottieniUtenti();
    ui.mostraUtenti(utenti, liste.utenti, {
      onVediPost: vediPostDiUtente,
      onElimina: eliminaUtente,
      onModifica: avviaModificaUtente,
    });
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
}

async function caricaPost(userId, pagina = 1) {
  paginaAttuale = pagina;
  try {
    const risposta = await api.ottieniPost(userId, pagina, LIMITE_POST);
    const post = risposta.dati ?? risposta;
    ui.mostraPost(post, liste.post, {
      onVediCommenti: vediCommentiDiPost,
      onElimina: eliminaPost,
    });
    aggiornaPaginazione(risposta.meta, userId);
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
}

function aggiornaPaginazione(meta, userId) {
  const contenitore = document.getElementById("paginazione-post");
  contenitore.innerHTML = "";

  if (!meta || meta.pagine <= 1) return;

  const btnPrec = document.createElement("button");
  btnPrec.textContent = "← Precedente";
  btnPrec.disabled = meta.pagina <= 1;
  btnPrec.addEventListener("click", () => caricaPost(userId, meta.pagina - 1));

  const info = document.createElement("span");
  info.textContent = `Pagina ${meta.pagina} di ${meta.pagine}`;

  const btnSucc = document.createElement("button");
  btnSucc.textContent = "Successiva →";
  btnSucc.disabled = meta.pagina >= meta.pagine;
  btnSucc.addEventListener("click", () => caricaPost(userId, meta.pagina + 1));

  contenitore.append(btnPrec, info, btnSucc);
}

async function caricaCommenti(postId) {
  try {
    const commenti = await api.ottieniCommenti(postId);
    ui.mostraCommenti(commenti, liste.commenti, {
      onElimina: eliminaCommento,
    });
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
}

async function aggiornaStatistiche() {
  const [utenti, postRisposta, commenti] = await Promise.all([
    api.ottieniUtenti(),
    api.ottieniPost(),
    api.ottieniCommenti(),
  ]);

  const postTotale = postRisposta.meta?.totale ?? postRisposta.length;

  document.getElementById("statistiche").textContent =
    `Utenti: ${utenti.length} | Post: ${postTotale} | Commenti: ${commenti.length}`;
}

// ============================================================
// Drill-down
// ============================================================

async function vediPostDiUtente(utente) {
  utenteSelezionato = { id: utente.id, nome: utente.nome };
  titoli.post.textContent = `Post di ${utente.nome}`;
  breadcrumbs.post.innerHTML = `<a id="torna-utenti">Utenti</a> &rarr; Post di ${utente.nome}`;
  document.getElementById("post-userId").value = utente.id;

  document
    .getElementById("torna-utenti")
    .addEventListener("click", async () => {
      utenteSelezionato = null;
      mostraSezione("utenti");
      await caricaUtenti();
    });

  mostraSezione("post");
  await caricaPost(utente.id, 1);
}

async function vediCommentiDiPost(post) {
  postSelezionato = { id: post.id, titolo: post.titolo };
  titoli.commenti.textContent = `Commenti al post: ${post.titolo}`;
  breadcrumbs.commenti.innerHTML = `<a id="torna-post">Post</a> &rarr; Commenti`;
  document.getElementById("commento-postId").value = post.id;

  document.getElementById("torna-post").addEventListener("click", async () => {
    postSelezionato = null;
    mostraSezione("post");
    if (utenteSelezionato) {
      await caricaPost(utenteSelezionato.id, paginaAttuale);
    } else {
      breadcrumbs.post.innerHTML = "";
      titoli.post.textContent = "Post";
      await caricaPost(undefined, paginaAttuale);
    }
  });

  mostraSezione("commenti");
  await caricaCommenti(post.id);
}

// ============================================================
// Eliminazione
// ============================================================

async function eliminaUtente(id) {
  if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;
  try {
    await api.eliminaUtente(id);
    await caricaUtenti();
    await aggiornaStatistiche();
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
}

async function eliminaPost(id) {
  if (!confirm("Sei sicuro di voler eliminare questo post?")) return;
  try {
    await api.eliminaPost(id);
    await caricaPost(utenteSelezionato?.id, 1);
    await aggiornaStatistiche();
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
}

async function eliminaCommento(id) {
  if (!confirm("Sei sicuro di voler eliminare questo commento?")) return;
  try {
    await api.eliminaCommento(id);
    await caricaCommenti(postSelezionato?.id);
    await aggiornaStatistiche();
  } catch (err) {
    ui.mostraErrore(err.message, liste.commenti);
  }
}

// ============================================================
// Form — Creazione
// ============================================================

document.getElementById("form-utente").addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("utente-nome").value.trim();
  const email = document.getElementById("utente-email").value.trim();
  const citta = document.getElementById("utente-citta").value.trim();
  const codiceFiscale = document
    .getElementById("utente-cf")
    .value.trim()
    .toUpperCase();
  const sesso = document.getElementById("utente-sesso").value;
  const dataNascita =
    document.getElementById("utente-data-nascita").value || null;
  const telefono =
    document.getElementById("utente-telefono").value.trim() || null;

  const regexCF = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
  if (!regexCF.test(codiceFiscale)) {
    ui.mostraErrore("Codice fiscale non valido", liste.utenti);
    return;
  }

  try {
    if (utenteInModifica) {
      await api.aggiornaUtente(utenteInModifica.id, {
        nome,
        email,
        citta,
        codiceFiscale,
        sesso,
        dataNascita,
        telefono,
      });
    } else {
      await api.creaUtente({
        nome,
        email,
        citta,
        codiceFiscale,
        sesso,
        dataNascita,
        telefono,
      });
    }
    e.target.reset();
    resetFormUtente();
    await caricaUtenti();
    await aggiornaStatistiche();
  } catch (err) {
    ui.mostraErrore(err.message, liste.utenti);
  }
});

document.getElementById("form-post").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userId = parseInt(document.getElementById("post-userId").value);
  const titolo = document.getElementById("post-titolo").value.trim();
  const corpo = document.getElementById("post-corpo").value.trim();

  try {
    await api.creaPost({ userId, titolo, corpo });
    e.target.reset();
    // Mantieni il userId pre-compilato se in drill-down
    if (utenteSelezionato) {
      document.getElementById("post-userId").value = utenteSelezionato.id;
    }
    await caricaPost(utenteSelezionato?.id, 1);
    await aggiornaStatistiche();
  } catch (err) {
    ui.mostraErrore(err.message, liste.post);
  }
});

document
  .getElementById("form-commento")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const postId = parseInt(document.getElementById("commento-postId").value);
    const nome = document.getElementById("commento-nome").value.trim();
    const email = document.getElementById("commento-email").value.trim();
    const corpo = document.getElementById("commento-corpo").value.trim();

    try {
      await api.creaCommento({ postId, nome, email, corpo });
      e.target.reset();
      // Mantieni il postId pre-compilato se in drill-down
      if (postSelezionato) {
        document.getElementById("commento-postId").value = postSelezionato.id;
      }
      await caricaCommenti(postSelezionato?.id);
      await aggiornaStatistiche();
    } catch (err) {
      ui.mostraErrore(err.message, liste.commenti);
    }
  });

document.getElementById("ricerca-utenti").addEventListener("input", (e) => {
  let ricerca = e.target.value.toLowerCase();

  const cards = document.querySelectorAll("#lista-utenti .card");
  cards.forEach((card) => {
    if (card.textContent.toLowerCase().includes(ricerca)) {
      card.style.display = "";
    } else {
      card.style.display = "none";
    }
  });
});

// ============================================================
// Modifica Utente
// ============================================================
function avviaModificaUtente(utente) {
  utenteInModifica = utente;
  document.getElementById("utente-nome").value = utente.nome;
  document.getElementById("utente-email").value = utente.email;
  document.getElementById("utente-citta").value = utente.citta;
  document.querySelector("#form-utente h3").textContent = "Modifica Utente";
  document.querySelector("#form-utente button[type='submit']").textContent =
    "Salva Modifiche";
  document.getElementById("btn-annulla-modifica").style.display = "";
}

function resetFormUtente() {
  utenteInModifica = null;
  document.querySelector("#form-utente h3").textContent = "Nuovo Utente";
  document.querySelector("#form-utente button[type='submit']").textContent =
    "Crea Utente";
  document.getElementById("btn-annulla-modifica").style.display = "none";
  document.getElementById("form-utente").reset();
}
document
  .getElementById("btn-annulla-modifica")
  .addEventListener("click", () => {
    resetFormUtente();
  });

// ============================================================
// Avvio — Carica la lista utenti all'apertura
// ============================================================

caricaUtenti();
aggiornaStatistiche();
