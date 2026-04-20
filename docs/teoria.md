Registrazione, Login e JWT
Obiettivi: Capire la differenza tra autenticazione e autorizzazione, perché le password non si salvano in chiaro, come funziona l'hashing con bcrypt, cos'è JWT e come implementare registrazione e login in un'API Express.
1.1 — Autenticazione vs Autorizzazione
Due concetti che vengono confusi continuamente, anche da sviluppatori esperti. Chiariamoli una volta per tutte.
Autenticazione = Chi sei?
È il processo di verifica dell'identità. Quando fate login con email e password, il sistema verifica che le credenziali corrispondano a un utente reale. Se sì, siete "autenticati" — il sistema sa chi siete.
Autorizzazione = Cosa puoi fare?
È il processo di verifica dei permessi. Dopo che il sistema sa chi siete, controlla se avete il diritto di fare quello che state chiedendo. Un utente normale può modificare il proprio profilo, ma non può eliminare l'account di un altro. Un admin può fare entrambe le cose.
Analogia: Pensate a un edificio aziendale:
Autenticazione = il badge all'ingresso. Verifica che siete un dipendente e vi fa entrare.
Autorizzazione = le chiavi delle stanze. Il badge vi fa entrare nell'edificio, ma non in tutte le stanze. Solo chi ha la chiave giusta può entrare nel server room o nell'ufficio del CEO.
Aspetto
Autenticazione
Autorizzazione
Domanda
Chi sei?
Cosa puoi fare?
Quando
Al login
Ad ogni richiesta
Come
Email + password, token, biometria
Ruoli, permessi, policy
Errore HTTP
401 Unauthorized ("Non so chi sei")
403 Forbidden ("So chi sei, ma non puoi")
1.2 — Il problema: HTTP è stateless
Nelle lezioni precedenti abbiamo visto che HTTP è stateless — senza stato. Ogni richiesta è indipendente: il server non "ricorda" chi sei tra una richiesta e l'altra.
Ma allora come fa un'applicazione a sapere che siete loggati? Se fate login con una POST, e poi richiedete il vostro profilo con una GET, come fa il server a collegare le due richieste allo stesso utente?
Questo è il problema fondamentale dell'autenticazione web, e nel corso della storia sono state trovate due soluzioni principali.
Soluzione 1: Sessioni lato server (tradizionale)

1. Client: POST /login { email, password }
2. Server: verifica credenziali → OK
3. Server: crea una sessione in memoria
   sessioni["abc123"] = { userId: 42, ruolo: "user" }
4. Server: risponde con un cookie: Set-Cookie: sessionId=abc123
5. Client: salva il cookie automaticamente

6. Client: GET /api/profilo (il browser manda automaticamente il cookie)
   Cookie: sessionId=abc123
7. Server: legge il cookie → cerca sessioni["abc123"] → trova userId: 42
8. Server: restituisce il profilo dell'utente 42
   ​
   Come funziona: Il server salva i dati della sessione in memoria (o in un database come Redis). Ad ogni richiesta, il client manda un cookie con l'ID di sessione, il server lo cerca nel suo archivio.
   Il problema: Il server deve ricordare tutte le sessioni attive. Con un solo server va bene, ma con più server (load balancing)? La sessione creata sul Server A non esiste sul Server B. Servono soluzioni aggiuntive (sessioni condivise su Redis, sticky sessions...).
   Soluzione 2: Token JWT (moderna, la nostra scelta)
9. Client: POST /login { email, password }
10. Server: verifica credenziali → OK
11. Server: genera un TOKEN che contiene le info dell'utente
    token = JWT({ userId: 42, ruolo: "user", exp: "1h" })
12. Server: risponde con il token nel body JSON

13. Client: salva il token (in localStorage, sessionStorage, o in memoria)

14. Client: GET /api/profilo
    Header: Authorization: Bearer eyJhbGciOiJIUz...
15. Server: legge il token dall'header → verifica la firma → estrae userId: 42
16. Server: restituisce il profilo dell'utente 42
    ​
    Come funziona: Il server non salva nulla. Tutte le informazioni sono dentro il token. Il server lo genera al login, il client lo manda ad ogni richiesta, e il server lo verifica senza bisogno di un archivio. È stateless — perfetto per le API REST.
    Perché è meglio per le API:
    Il server non deve ricordare nulla → scalabilità orizzontale facile (più server)
    Non dipende dai cookie → funziona con app mobile, SPA, altri server
    Le informazioni dell'utente sono nel token → non serve una query al database ad ogni richiesta
    1.3 — Cos'è JWT
    JWT sta per JSON Web Token. È uno standard aperto (RFC 7519) che definisce un modo compatto e sicuro per trasmettere informazioni tra due parti sotto forma di un oggetto JSON firmato.
    La struttura: tre parti separate da punti
    Un JWT ha questo aspetto:
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyLCJydW9sbyI6InVzZXIiLCJpYXQiOjE3MDUzMTIwMDAsImV4cCI6MTcwNTMxNTYwMH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    ​
    Sembra incomprensibile, ma è formato da tre parti separate da .:
    HEADER.PAYLOAD.FIRMA
    ​
17. Header — dice che tipo di token è e quale algoritmo di firma usa:
    {
    "alg": "HS256",
    "typ": "JWT"
    }
    ​
    Codificato in Base64 diventa: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
18. Payload — contiene i dati (chiamati "claims"):
    {
    "userId": 42,
    "ruolo": "user",
    "iat": 1705312000,
    "exp": 1705315600
    }
    ​
    iat = issued at (quando è stato creato)
    exp = expiration (quando scade)
    Gli altri campi li decidete voi (userId, ruolo, email, ecc.)
    Codificato in Base64 diventa: eyJ1c2VySWQiOjQyLCJydW9sby...
19. Firma — la parte che garantisce l'integrità:
    HMACSHA256(
    base64(header) + "." + base64(payload),
    "la-vostra-chiave-segreta"
    )
    ​
    La firma viene calcolata usando l'header, il payload, e una chiave segreta che solo il server conosce.
    Perché la firma è fondamentale
    Il payload è codificato in Base64, non crittografato. Chiunque può decodificarlo e leggere il contenuto (provate su https://jwt.io). Ma nessuno può modificarlo senza invalidare la firma.
    Se un malintenzionato prova a cambiare "ruolo": "user" in "ruolo": "admin", il payload cambia → la firma non corrisponde più → il server rifiuta il token.
    Cosa NON mettere nel JWT
    Dato che il payload è leggibile da chiunque, non metteteci dati sensibili:
    Password
    Numeri di carta di credito
    Informazioni mediche
    userId, ruolo, email, nome — dati che il client già conosce
    Come funziona l'hashing
    L'hashing è una funzione unidirezionale: trasforma un input in un output di lunghezza fissa, e non è possibile risalire dall'output all'input.
    "password123" → hash() → "$2b$10$K7L1OJ45/4Y2nIvhR..."
    (non si può tornare indietro!)
    ​
    A differenza della crittografia (dove puoi decifrare con la chiave), l'hash è irreversibile. Non esiste un modo matematico per risalire dalla stringa hash alla password originale.
    Perché non basta un hash semplice (SHA-256)
    Se due utenti hanno la stessa password, hanno lo stesso hash:
    "password123" → SHA-256 → "ef92b778bafe771..."
    "password123" → SHA-256 → "ef92b778bafe771..." (identico!)
    ​
    Un attaccante può precalcolare gli hash delle password più comuni ("password123", "123456", "qwerty"...) in una rainbow table e confrontarli con il database rubato. È come avere un dizionario: cerchi l'hash, trovi la password.
    La soluzione: salt + bcrypt
    Salt: Una stringa casuale unica generata per ogni utente, aggiunta alla password prima dell'hashing:
    Utente A: "password123" + "x7kM9pQ2" → hash → "$2b$10$x7kM9pQ2..."
    Utente B: "password123" + "aB3nR5wY" → hash → "$2b$10$aB3nR5wY..."
    (diversi!)
    ​
    Anche se due utenti hanno la stessa password, gli hash sono diversi. Le rainbow table diventano inutili perché dovrebbero precalcolare gli hash per ogni possibile salt.
    bcrypt: Un algoritmo di hashing progettato specificamente per le password. Le sue caratteristiche:
    Include il salt automaticamente (non dovete generarlo voi)
    È volutamente lento — impiega circa 100ms per hash. Per un utente che fa login una volta è impercettibile. Per un attaccante che prova milioni di password, è devastante
    Ha un parametro di costo (salt rounds) che lo rende più lento nel tempo, man mano che i computer diventano più veloci
    bcrypt("password123", 10) → "$2b$10$K7L1OJ45/4Y2nIvhRVpMWOGxkdQ1N..."
    │ │
    │ └── 10 salt rounds (il "costo")
    └── versione bcrypt
    ​
    Perché bcrypt e non SHA-256? SHA-256 è progettato per essere veloce (serve per firme digitali, checksum di file). Una GPU moderna può calcolare miliardi di SHA-256 al secondo. bcrypt è progettato per essere lento — con 10 salt rounds, un attaccante può provare solo ~100 password al secondo sulla stessa GPU. La lentezza è una feature, non un bug.
    1.5 — Implementazione: setup del progetto
    Installiamo i pacchetti necessari:
    npm i bcrypt jsonwebtoken
    ​
    bcrypt — per l'hashing delle password
    jsonwebtoken — per generare e verificare i token JWT
    La tabella utenti aggiornata
    Aggiungete la colonna password e ruolo alla tabella utenti:
    ALTER TABLE utenti
    ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN ruolo ENUM('user', 'admin') DEFAULT 'user';
    ​
    Oppure, se partite da zero:
    CREATE TABLE utenti (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    citta VARCHAR(100) DEFAULT '',
    ruolo ENUM('user', 'admin') DEFAULT 'user',
    data_registrazione DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    ​
    password è VARCHAR(255): Gli hash bcrypt sono lunghi circa 60 caratteri. 255 è il margine sicuro.
    1.6 — Registrazione: creare un account
    // services/authService.js

import bcrypt from "bcrypt";
import \* as utenteRepo from "../repositories/utenteRepository.js";
import { ValidationError, ConflictError } from "../errori.js";

const SALT_ROUNDS = 10;

export async function registra({ nome, email, password, citta }) {
// 1. Validazione
if (!nome || !email || !password) {
throw new ValidationError("Nome, email e password sono obbligatori");
}

    if (password.length < 8) {
        throw new ValidationError("La password deve avere almeno 8 caratteri");
    }

    // 2. Verifica che l'email non sia già registrata
    const esistente = await utenteRepo.findByEmail(email);
    if (esistente) {
        throw new ConflictError("Un utente con questa email è già registrato");
    }

    // 3. Hash della password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 4. Salva l'utente (con la password hashata, MAI quella in chiaro)
    const nuovoUtente = await utenteRepo.create({
        nome,
        email,
        password: passwordHash,
        citta: citta || ""
    });

    // 5. Restituisci l'utente SENZA la password
    const { password: "_", ...utenteSenzaPassword } = nuovoUtente;
    return utenteSenzaPassword;

}
​
Notate tre cose importanti:
La password in chiaro non viene mai salvata — solo l'hash
bcrypt.hash(password, SALT*ROUNDS) genera il salt automaticamente e lo include nell'hash
Il risultato restituito non contiene la password — la destrutturazione { password: *, ...rest } la rimuove
1.7 — Login: verificare le credenziali e generare il JWT
// services/authService.js (continua)

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "24h";

export async function login({ email, password }) {
// 1. Validazione
if (!email || !password) {
throw new ValidationError("Email e password sono obbligatori");
}

    // 2. Cerca l'utente per email
    const utente = await utenteRepo.findByEmail(email);
    if (!utente) {
        // ⚠️ Messaggio generico per sicurezza — non dire "email non trovata"
        throw new ValidationError("Credenziali non valide");
    }

    // 3. Confronta la password con l'hash salvato
    const passwordCorretta = await bcrypt.compare(password, utente.password);
    if (!passwordCorretta) {
        // ⚠️ Stesso messaggio generico — non dire "password sbagliata"
        throw new ValidationError("Credenziali non valide");
    }

    // 4. Genera il token JWT
    const token = jwt.sign(
        {
            userId: utente.id,
            email: utente.email,
            ruolo: utente.ruolo
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // 5. Restituisci il token e i dati utente (senza password)
    const { password: _, ...utenteSenzaPassword } = utente;

    return {
        token,
        utente: utenteSenzaPassword
    };

}
​
"Credenziali non valide": Il messaggio di errore è volutamente generico sia per email non trovata che per password sbagliata. Se dicessimo "Email non trovata", un attaccante potrebbe enumerare le email registrate. Se dicessimo "Password sbagliata", confermeremmo che l'email esiste. "Credenziali non valide" non rivela nulla.
JWT_SECRET: La chiave segreta deve essere lunga, casuale, e mai nel codice sorgente. In produzione viene da una variabile d'ambiente (process.env.JWT_SECRET). Per riferimento su NodeJS:, cerca dotenv.
Come funziona bcrypt.compare
// bcrypt.compare NON decifra l'hash (è impossibile).
// Prende la password in chiaro, la hasha con lo STESSO salt
// (che è incorporato nell'hash salvato), e confronta i risultati.

const hashSalvato = "$2b$10$K7L1OJ45/4Y2nIvhR..."; // Dal database

bcrypt.compare("password123", hashSalvato); // → true (stessa password)
bcrypt.compare("password456", hashSalvato); // → false (password diversa)
​
1.8 — Le route di autenticazione
// routes/auth.js

import { Router } from "express";
import { body } from "express-validator";
import { gestisciValidazione } from "../middleware/validazione.js";
import \* as authController from "../controllers/authController.js";

const router = Router();

// Validazione registrazione
const regoleRegistrazione = [
body("nome")
.notEmpty().withMessage("Il nome è obbligatorio")
.trim()
.isLength({ min: 2, max: 100 }),
body("email")
.notEmpty().withMessage("L'email è obbligatoria")
.isEmail().withMessage("Formato email non valido")
.normalizeEmail(),
body("password")
.notEmpty().withMessage("La password è obbligatoria")
.isLength({ min: 8 }).withMessage("La password deve avere almeno 8 caratteri"),
body("citta")
.optional().trim()
];

// Validazione login
const regoleLogin = [
body("email")
.notEmpty().withMessage("L'email è obbligatoria")
.isEmail().withMessage("Formato email non valido")
.normalizeEmail(),
body("password")
.notEmpty().withMessage("La password è obbligatoria")
];

router.post("/registrazione", regoleRegistrazione, gestisciValidazione, authController.registrazione);
router.post("/login", regoleLogin, gestisciValidazione, authController.login);

export default router;
​
// controllers/authController.js

import { asyncHandler } from "../middleware/asyncHandler.js";
import \* as authService from "../services/authService.js";

export const registrazione = asyncHandler(async (req, res) => {
const utente = await authService.registra(req.body);
res.status(201).json({
messaggio: "Registrazione completata con successo",
utente
});
});

export const login = asyncHandler(async (req, res) => {
const risultato = await authService.login(req.body);
res.json({
messaggio: "Login effettuato con successo",
token: risultato.token,
utente: risultato.utente
});
});
​
// server.js — Montare le route di autenticazione
import routeAuth from "./routes/auth.js";

app.use("/api/auth", routeAuth);
// → POST /api/auth/registrazione
// → POST /api/auth/login
​
1.9 — Testare il flusso completo

1. Registrazione
   POST http://localhost:3000/api/auth/registrazione
   Body:
   {
   "nome": "Mario Rossi",
   "email": "mario@email.com",
   "password": "miaPassword123",
   "citta": "Roma"
   }

Risposta (201):
{
"messaggio": "Registrazione completata con successo",
"utente": {
"id": 1,
"nome": "Mario Rossi",
"email": "mario@email.com",
"citta": "Roma",
"ruolo": "user",
"data_registrazione": "2025-01-15T10:30:00.000Z"
}
}
​
Notate: nella risposta non c'è la password (né in chiaro né l'hash). 2. Registrazione duplicata
POST http://localhost:3000/api/auth/registrazione
Body: { stessi dati }

Risposta (409):
{
"errore": "Un utente con questa email è già registrato"
}
​ 3. Login
POST http://localhost:3000/api/auth/login
Body:
{
"email": "mario@email.com",
"password": "miaPassword123"
}

Risposta (200):
{
"messaggio": "Login effettuato con successo",
"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoibWFyaW9AZW1haWwuY29tIiwicnVvbG8iOiJ1c2VyIiwiaWF0IjoxNzA1MzEyMDAwLCJleHAiOjE3MDUzOTg0MDB9.abc123...",
"utente": {
"id": 1,
"nome": "Mario Rossi",
"email": "mario@email.com",
"ruolo": "user"
}
}
​ 4. Usare il token
Il client salva il token e lo include nell'header Authorization di ogni richiesta successiva:
GET http://localhost:3000/api/profilo
Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
​
In Thunder Client: nella tab Headers, aggiungete:
Key: Authorization
Value: Bearer <incollate il token qui>
Nella prossima lezione implementeremo il middleware che verifica questo token e protegge le route.
1.10 — Cosa succede al token: il ciclo di vita

1. REGISTRAZIONE
   Client → POST /api/auth/registrazione { nome, email, password }
   Server → hash password → salva in DB → risponde 201
   (Non genera ancora un token — l'utente deve fare login)

2. LOGIN
   Client → POST /api/auth/login { email, password }
   Server → trova utente per email → bcrypt.compare → OK
   Server → jwt.sign({ userId, ruolo }, secret, { expiresIn }) → TOKEN
   Server → risponde con { token, utente }

3. RICHIESTE AUTENTICATE
   Client → GET /api/profilo
   Authorization: Bearer <token>
   Server → legge header → jwt.verify(token, secret) → estrae payload
   Server → req.user = { userId: 42, ruolo: "user" }
   Server → esegue la route con le info dell'utente

4. TOKEN SCADUTO (dopo 24h)
   Client → GET /api/profilo
   Authorization: Bearer <token scaduto>
   Server → jwt.verify → "TokenExpiredError"
   Server → 401 "Token scaduto, effettua nuovamente il login"

5. TOKEN INVALIDO (modificato o inventato)
   Client → GET /api/profilo
   Authorization: Bearer <token falso>
   Server → jwt.verify → "JsonWebTokenError"
   Server → 401 "Token non valido"
   ​
   1.11 — Riepilogo della lezione
   Concetto
   Cosa abbiamo imparato
   Autenticazione
   "Chi sei?" — verifica dell'identità (login)
   Autorizzazione
   "Cosa puoi fare?" — verifica dei permessi (ruoli)
   401 vs 403
   401 = non autenticato, 403 = autenticato ma senza permessi
   Statelessness
   HTTP non ricorda chi sei tra una richiesta e l'altra
   Sessioni
   Il server salva lo stato — funziona ma non scala bene
   JWT
   Token con le info dell'utente + firma — stateless e scalabile
   Header.Payload.Firma
   Le tre parti del JWT separate da punti
   La firma
   Garantisce che nessuno ha modificato il token
   Hashing
   Funzione unidirezionale: password → hash (irreversibile)
   Salt
   Stringa casuale unica per utente, previene le rainbow table
   bcrypt
   Algoritmo lento per le password, con salt automatico
   bcrypt.hash()
   Genera l'hash della password (registrazione)
   bcrypt.compare()
   Confronta password in chiaro con hash salvato (login)
   jwt.sign()
   Genera il token (login)
   jwt.verify()
   Verifica e decodifica il token (middleware, lezione 13)
   JWT_SECRET
   Chiave segreta per firmare i token — mai nel codice sorgente
