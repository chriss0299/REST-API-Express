// database/queries/utenti.js — Query SQL per la risorsa Utenti
//
// Ogni funzione esegue una query sul database e restituisce il risultato.
// Queste funzioni sostituiscono le operazioni sugli array del vecchio database.js.
//
// Concetti chiave:
//   pool.query(sql, [valori])  → esegue una query con parametri (previene SQL injection)
//   [righe]                    → destrutturiamo il risultato (il primo elemento è l'array di righe)
//   risultato.insertId         → l'id generato da AUTO_INCREMENT dopo un INSERT
//   risultato.affectedRows     → quante righe sono state modificate da UPDATE/DELETE

import pool from "../connessione.js";
import bcrypt, { hash } from "bcrypt";

// ============================================================
// SELECT — Lettura
// ============================================================

/**
 * Restituisce tutti gli utenti. Se viene passata una città, filtra per quella.
 *
 * SQL senza filtro:  SELECT * FROM utenti
 * SQL con filtro:    SELECT * FROM utenti WHERE LOWER(citta) = LOWER(?)
 */
export async function trovaUtenti(citta) {
  if (citta) {
    const [righe] = await pool.query(
      "SELECT id, nome, email, citta FROM utenti WHERE citta = ?",
      [citta],
    );
    return righe;
  }

  const [righe] = await pool.query("SELECT id, nome, email, citta FROM utenti");
  return righe;
}

/**
 * Cerca un singolo utente per ID.
 * Restituisce l'oggetto utente, oppure undefined se non esiste.
 *
 * SQL: SELECT * FROM utenti WHERE id = ?
 */
export async function trovaUtentePerId(id) {
  const [righe] = await pool.query(
    "SELECT id, nome, email, citta FROM utenti WHERE id = ?",
    [id],
  );
  return righe[0]; // undefined se non trovato
}

export async function trovaUtentePerEmail(email) {
  const [righe] = await pool.query(
    "SELECT id, nome, email, citta, ruolo, password From utenti  WHERE email = ?",
    [email],
  );
  return righe[0];
}

// ============================================================
// INSERT — Creazione
// ============================================================

/**
 * Crea un nuovo utente nel database.
 * MySQL genera l'id automaticamente grazie ad AUTO_INCREMENT.
 *
 * SQL: INSERT INTO utenti (nome, email, citta) VALUES (?, ?, ?)
 */
export async function creaUtente({
  nome,
  email,
  citta,
  codiceFiscale,
  sesso,
  dataNascita,
  telefono,
  password,
}) {
  const hash = await bcrypt.hash(password, 10);
  const [risultato] = await pool.query(
    "INSERT INTO utenti (nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
    [
      nome,
      email,
      citta || "",
      codiceFiscale,
      sesso,
      dataNascita || null,
      telefono || null,
      hash,
    ],
  );
  return {
    id: risultato.insertId,
    nome,
    email,
    citta: citta || "",
    codiceFiscale,
    sesso,
    dataNascita: dataNascita || null,
    telefono: telefono || null,
  };
}

// ============================================================
// UPDATE — Modifica
// ============================================================

/**
 * Sostituisce completamente un utente (PUT).
 * Restituisce l'utente aggiornato, oppure null se non esiste.
 *
 * SQL: UPDATE utenti SET nome = ?, email = ?, citta = ? WHERE id = ?
 */
export async function sostituisciUtente(
  id,
  { nome, email, citta, codiceFiscale, sesso, dataNascita, telefono, password },
) {
  const [risultato] = await pool.query(
    "UPDATE utenti SET nome = ?, email = ?, citta = ?, codiceFiscale = ?, sesso = ?, dataNascita = ?, telefono = ?,password = ? WHERE id = ?",
    [
      nome,
      email,
      citta || "",
      codiceFiscale,
      sesso,
      dataNascita || null,
      telefono || null,
      id,
    ],
  );

  if (risultato.affectedRows === 0) return null;
  return {
    id,
    nome,
    email,
    citta: citta || "",
    codiceFiscale,
    sesso,
    dataNascita: dataNascita || null,
    telefono: telefono || null,
  };
}

/**
 * Aggiorna parzialmente un utente (PATCH).
 * Costruisce la query SQL dinamicamente solo con i campi presenti.
 *
 * SQL dinamico: UPDATE utenti SET <campo> = ?, ... WHERE id = ?
 */
export async function aggiornaUtente(id, dati) {
  const campiPermessi = [
    "nome",
    "email",
    "citta",
    "codiceFiscale",
    "sesso",
    "dataNascita",
    "telefono",
  ];
  const aggiornamenti = [];
  const valori = [];

  for (const campo of campiPermessi) {
    if (dati[campo] !== undefined) {
      aggiornamenti.push(`${campo} = ?`);
      valori.push(dati[campo]);
    }
  }

  if (aggiornamenti.length > 0) {
    valori.push(id);
    await pool.query(
      `UPDATE utenti SET ${aggiornamenti.join(", ")} WHERE id = ?`,
      valori,
    );
  }

  return trovaUtentePerId(id);
}

// ============================================================
// DELETE — Eliminazione
// ============================================================

/**
 * Elimina un utente per ID.
 * Restituisce l'utente eliminato, oppure null se non esisteva.
 *
 * SQL: DELETE FROM utenti WHERE id = ?
 */
export async function eliminaUtente(id) {
  const utente = await trovaUtentePerId(id);
  if (!utente) return null;

  await pool.query("DELETE FROM utenti WHERE id = ?", [id]);
  return utente;
}
