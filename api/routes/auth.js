import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";

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
      { id: creautente.id, email: creautente.email },
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

    const token = jwt.sign(
      { id: utente.id, email: utente.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );
    res.json({
      token,
      utente: { id: utente.id, nome: utente.nome, email: utente.email },
    });
  } catch (errore) {
    console.error("Errore PUT /api/utenti/:id:", errore);
    res.status(500).json({ errore: "Errore interno del server" });
  }
});

export default router;
