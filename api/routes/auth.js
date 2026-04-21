import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  creaUtente,
  trovaUtentePerEmail,
  trovaUtentePerId,
} from "../database/queries/utenti.js";
import crypto from "crypto";
import {
  salvaRefreshToken,
  trovaRefreshToken,
  eliminaRefreshToken,
} from "../database/queries/refreshToken.js";

const router = Router();

router.post("/registrazione", async (req, res) => {
  // validazione + creaUtente + firma token + risposta { token, utente }
  try {
    const { nome, email, password, citta } = req.body;
    if (!nome || !email || !password) {
      return res
        .status(400)
        .json({ errore: "Nome, email e password sono obbligatori" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ errore: "La password deve avere almeno 8 caratteri" });
    }
    // 2. Verifica che l'email non sia già registrata
    const esistente = await trovaUtentePerEmail(email);
    if (esistente) {
      return res
        .status(409)
        .json({ errore: "Un utente con questa email è già registrato" });
    }
    const creautente = await creaUtente({ nome, email, citta, password });
    const token = jwt.sign(
      { id: creautente.id, email: creautente.email, ruolo: creautente.ruolo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.status(201).json({
      token,
      utente: {
        id: creautente.id,
        nome: creautente.nome,
        email: creautente.email,
      },
    });
  } catch (errore) {
    console.error("Errore PUT /api/utenti/:id:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const utente = await trovaUtentePerEmail(email);
    if (!utente)
      return res.status(401).json({ errore: "Credenziali non valide" });

    const valida = await bcrypt.compare(password, utente.password);
    if (!valida)
      return res.status(401).json({ errore: "Credenziali non valide" });

    const accessToken = jwt.sign(
      { id: utente.id, email: utente.email, ruolo: utente.ruolo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    const refreshToken = crypto.randomUUID();
    const scadenza = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await salvaRefreshToken(utente.id, refreshToken, scadenza);

    res.json({
      accessToken,
      refreshToken,
      utente: {
        id: utente.id,
        nome: utente.nome,
        email: utente.email,
        ruolo: utente.ruolo,
      },
    });
  } catch (errore) {
    console.error("Errore PUT /api/utenti/:id:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const record = await trovaRefreshToken(refreshToken);
    if (!record || new Date(record.scadenza) < new Date()) {
      return res
        .status(401)
        .json({ errore: "Refresh token non valido o scaduto" });
    }
    const utente = await trovaUtentePerId(record.utenteId);
    const accessToken = jwt.sign(
      { id: utente.id, email: utente.email, ruolo: utente.ruolo },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.json({ accessToken });
  } catch (errore) {
    console.error("Errore PUT /api/utenti/:id:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});
router.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    await eliminaRefreshToken(refreshToken);
    res.json({ messaggio: "Logout effettuato" });
  } catch (errore) {
    console.error("Errore PUT /api/utenti/:id:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

export default router;
