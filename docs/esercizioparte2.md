Esercitazione Json-Placeholder Full stack (pt2)
Esercizi — Login, Ruoli e Sicurezza
Esercizi progressivi per aggiungere autenticazione, autorizzazione e sicurezza al Mini JSONPlaceholder. Ogni esercizio indica la difficolta e i file da modificare.
Prerequisiti: avere completato almeno gli esercizi 1–2 di esercizi.md (conoscere la struttura del DB e del frontend).
Esercizio 8 — Password e hashing con bcrypt
Obiettivo
Aggiungere il campo password alla tabella utenti. Le password non vengono MAI salvate in chiaro: si usa bcrypt per generare un hash.
File da modificare
api/package.json — aggiungere la dipendenza:
cd api
npm install bcrypt
​
api/database/schema.sql — aggiungere la colonna:
password VARCHAR(255) NOT NULL
​
api/database/seed.sql — aggiornare gli INSERT con hash pre-generati (vedi suggerimenti).
api/database/queries/utenti.js — nella funzione creaUtente:
Importare bcrypt
Prima di fare l'INSERT, eseguire const hash = await bcrypt.hash(password, 10)
Salvare hash nel DB, mai la password in chiaro
api/database/queries/utenti.js — nelle funzioni trovaUtenti e trovaUtentePerId:
NON restituire mai il campo password nelle risposte
Usare SELECT id, nome, email, citta FROM utenti (senza )
api/routes/utenti.js — nel POST:
Aggiungere password tra i campi obbligatori (min 8 caratteri)
Restituire 400 se manca o e troppo corta
Suggerimenti
Per generare hash di esempio per il seed, create uno script temporaneo api/scripts/genera-hash.js:
import bcrypt from "bcrypt";
const hash = await bcrypt.hash("password123", 10);
console.log(hash);
// → $2b$10$N9qo8uLOickgx2ZMRZoMye...
​
Eseguitelo con node scripts/genera-hash.js e copiate gli hash nel seed.
Perche bcrypt e non SHA256? bcrypt e lento di proposito (parametro 10 = 2^10 iterazioni). Questo rende gli attacchi brute-force impraticabili. SHA256 e velocissimo → pessimo per password.
Cosa e il "salt"? bcrypt aggiunge automaticamente una stringa casuale a ogni password prima di hasharla. Due utenti con la stessa password avranno hash diversi — impedisce gli attacchi con "rainbow tables".
Verifica
In phpMyAdmin, la colonna password contiene stringhe tipo $2b$10$... (mai in chiaro)
GET /api/utenti e GET /api/utenti/:id NON includono il campo password nella risposta
POST /api/utenti senza password → 400
POST /api/utenti con password: "123" → 400 (troppo corta)
POST /api/utenti con password: "password123" → 201, e nel DB la password e hashata
Esercizio 9 — Endpoint di registrazione e login (JWT)
Obiettivo
Creare due nuovi endpoint di autenticazione:
POST /api/auth/registrazione — crea un nuovo utente e restituisce un token
POST /api/auth/login — verifica email + password e restituisce un token
Il token e un JWT (JSON Web Token): una stringa firmata che il client usera per dimostrare la sua identita nelle richieste successive.
File da modificare
api/package.json — aggiungere la dipendenza:
cd api
npm install jsonwebtoken
​
api/.env e api/.env.example — aggiungere:
JWT_SECRET=cambiami-con-una-stringa-lunga-e-casuale
JWT_EXPIRES_IN=1h
​
api/routes/auth.js (nuovo file):
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { creaUtente, trovaUtentePerEmail } from "../database/queries/utenti.js";

const router = Router();

router.post("/registrazione", async (req, res) => {
// validazione + creaUtente + firma token + risposta { token, utente }
});

router.post("/login", async (req, res) => {
const { email, password } = req.body;
const utente = await trovaUtentePerEmail(email);
if (!utente) return res.status(401).json({ errore: "Credenziali non valide" });

    const valida = await bcrypt.compare(password, utente.password);
    if (!valida) return res.status(401).json({ errore: "Credenziali non valide" });

    const token = jwt.sign(
        { id: utente.id, email: utente.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    res.json({ token, utente: { id: utente.id, nome: utente.nome, email: utente.email } });

});

export default router;
​
api/database/queries/utenti.js — aggiungere trovaUtentePerEmail(email) che restituisce ANCHE il campo password (serve per il confronto — e l'UNICA query che lo include).
api/server.js — montare il router:
import authRouter from "./routes/auth.js";
app.use("/api/auth", authRouter);
​
Suggerimenti
Anatomia di un JWT:
eyJhbGciOiJIUzI1NiIs... . eyJpZCI6MSwiZW1haWwiOiJt... . SflKxwRJSMeKKF2QT4fwp...
HEADER PAYLOAD SIGNATURE
​
Header: algoritmo di firma (es. HS256)
Payload: i dati (id, email, scadenza) — leggibili da chiunque, NON criptati
Signature: firma HMAC con JWT_SECRET — garantisce che il payload non sia stato modificato
Mai mettere dati sensibili nel payload (tipo la password hashata). Il JWT va pensato come una "patente": chiunque puo leggerla, ma solo il server puo emetterla.
Messaggio di errore generico: rispondete sempre "Credenziali non valide" sia se l'email non esiste sia se la password e sbagliata. In caso contrario un attaccante potrebbe enumerare gli account validi.
Verifica
POST /api/auth/registrazione con dati validi → 201 con { token, utente }
POST /api/auth/login con credenziali valide → 200 con { token, utente }
POST /api/auth/login con password sbagliata → 401 con { errore: "Credenziali non valide" }
POST /api/auth/login con email inesistente → 401 (stesso messaggio)
Copiate il token su jwt.io → dovete vedere il payload decodificato
Esercizio 10 — Middleware di autenticazione
Obiettivo
Proteggere le route di scrittura (POST, PUT, PATCH, DELETE) richiedendo un token JWT valido. Le GET restano pubbliche.
File da modificare
api/middleware/autenticazione.js (nuovo file):
import jwt from "jsonwebtoken";

export function richiediAutenticazione(req, res, next) {
const header = req.headers.authorization;
if (!header || !header.startsWith("Bearer ")) {
return res.status(401).json({ errore: "Token mancante" });
}

    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.utente = payload;
        next();
    } catch (errore) {
        return res.status(401).json({ errore: "Token non valido o scaduto" });
    }

}
​
api/routes/post.js — applicare il middleware alle route di scrittura:
import { richiediAutenticazione } from "../middleware/autenticazione.js";

router.post("/", richiediAutenticazione, async (req, res) => { ... });
router.put("/:id", richiediAutenticazione, async (req, res) => { ... });
router.patch("/:id", richiediAutenticazione, async (req, res) => { ... });
router.delete("/:id", richiediAutenticazione, async (req, res) => { ... });
​
api/routes/commenti.js — stesso trattamento.
api/routes/utenti.js — proteggere PUT/PATCH/DELETE; la POST resta pubblica (e la registrazione).
Suggerimenti
Come funziona next()? Un middleware Express puo fare 3 cose:
Chiamare next() → passa al middleware/handler successivo
Rispondere con res.json() / res.status() → la catena si ferma
Chiamare next(errore) → salta all'error handler
Perche 401 e non 403?
401 Unauthorized = "non so chi sei" (token mancante/invalido)
403 Forbidden = "so chi sei ma non puoi fare questo" (mancano i permessi — vedremo nell'Es. 12)
Testare da terminale:

# Senza token → 401

curl -X POST <http://localhost:3000/api/post> -H "Content-Type: application/json" -d '{...}'

# Con token → 201

curl -X POST <http://localhost:3000/api/post> \\
-H "Authorization: Bearer IL_TUO_TOKEN" \\
-H "Content-Type: application/json" \\
-d '{"userId":1,"titolo":"Test","corpo":"..."}'
​
Verifica
GET /api/post senza token → 200 (route pubblica)
POST /api/post senza token → 401 con { errore: "Token mancante" }
POST /api/post con token inventato → 401 con { errore: "Token non valido o scaduto" }
POST /api/post con token valido → 201
Modificate JWT_SECRET nel .env e riavviate il server → i token vecchi diventano invalidi
Esercizio 11 — Login nel frontend e gestione token
Obiettivo
Aggiungere un form di login nel frontend. Al login corretto, il token viene salvato in localStorage e inserito automaticamente nell'header Authorization di ogni richiesta successiva.
File da modificare
web/index.html — aggiungere una nuova sezione prima di #sezione-utenti:

<section id="sezione-login">
    <h2>Login</h2>
    <form id="form-login">
        <input type="email" id="login-email" placeholder="Email" required>
        <input type="password" id="login-password" placeholder="Password" required>
        <button type="submit">Accedi</button>
    </form>
    <p id="stato-login">Non sei autenticato</p>
</section>
​
E un bottone "Logout" nella nav.
web/js/api.js — modificare chiamataApi():
async function chiamataApi(percorso, opzioni = {}) {
    const token = localStorage.getItem("token");
    const headers = {
        "Content-Type": "application/json",
        ...opzioni.headers,
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const risposta = await fetch(`${BASE_URL}${percorso}`, { ...opzioni, headers });
    if (!risposta.ok) throw new Error((await risposta.json()).errore);
    return risposta.json();

}

export async function login(email, password) {
return chiamataApi("/auth/login", {
method: "POST",
body: JSON.stringify({ email, password }),
});
}
​
web/js/app.js — gestire il form di login:
document.getElementById("form-login").addEventListener("submit", async (e) => {
e.preventDefault();
const email = document.getElementById("login-email").value;
const password = document.getElementById("login-password").value;
try {
const { token, utente } = await api.login(email, password);
localStorage.setItem("token", token);
localStorage.setItem("utente", JSON.stringify(utente));
aggiornaStatoLogin();
} catch (errore) {
alert("Login fallito: " + errore.message);
}
});

function logout() {
localStorage.removeItem("token");
localStorage.removeItem("utente");
aggiornaStatoLogin();
}

function aggiornaStatoLogin() {
const utente = JSON.parse(localStorage.getItem("utente") || "null");
document.getElementById("stato-login").textContent = utente
? `Loggato come ${utente.nome}`
: "Non sei autenticato";
}
​
web/stile.css — stilare la sezione login in modo coerente col resto.
Suggerimenti
Perche localStorage e non un cookie? Per semplicita didattica: localStorage e trasparente (potete ispezionarlo dal DevTools → Application → Local Storage). In produzione un cookie httpOnly e piu sicuro perche non e leggibile da JavaScript e quindi immune agli attacchi XSS.
Attenzione agli XSS: se un attaccante riesce a iniettare JavaScript nel vostro sito, puo rubare il token da localStorage. Per questo e importante non usare mai innerHTML con dati non sanitizzati.
Verifica
Con credenziali valide → il testo cambia in "Loggato come Mario"
DevTools → Application → Local Storage → vedete token e utente
Provate a creare un post → funziona (il token viene inviato automaticamente)
Cliccate Logout → localStorage si svuota, il POST torna a fallire con 401
Ricaricate la pagina → lo stato "loggato" persiste (grazie a localStorage)
Esercizio 12 — Ruoli utente (utente / admin)
Obiettivo
Aggiungere il campo ruolo alla tabella utenti. Alcune azioni (es. eliminare un utente, eliminare post altrui) sono riservate agli admin. Ogni utente puo modificare solo le proprie risorse.
File da modificare
api/database/schema.sql:
ruolo ENUM('utente', 'admin') NOT NULL DEFAULT 'utente'
​
api/database/seed.sql — marcare almeno un utente come admin.
api/routes/auth.js — includere il ruolo nel payload JWT:
const token = jwt.sign(
{ id: utente.id, email: utente.email, ruolo: utente.ruolo },
process.env.JWT_SECRET,
{ expiresIn: process.env.JWT_EXPIRES_IN }
);
​
api/middleware/autenticazione.js — aggiungere un nuovo middleware:
export function richiediRuolo(...ruoliPermessi) {
return (req, res, next) => {
if (!req.utente || !ruoliPermessi.includes(req.utente.ruolo)) {
return res.status(403).json({ errore: "Permessi insufficienti" });
}
next();
};
}
​
api/routes/utenti.js — applicare richiediRuolo("admin") su DELETE.
api/routes/post.js — per PUT/PATCH/DELETE, aggiungere un controllo di ownership:
router.delete("/:id", richiediAutenticazione, async (req, res) => {
const post = await trovaPostPerId(req.params.id);
if (!post) return res.status(404).json({ errore: "Post non trovato" });

    const isAutore = post.userId === req.utente.id;
    const isAdmin = req.utente.ruolo === "admin";
    if (!isAutore && !isAdmin) {
        return res.status(403).json({ errore: "Puoi modificare solo i tuoi post" });
    }

    await eliminaPost(req.params.id);
    res.json({ messaggio: "Post eliminato", post });

});
​
Suggerimenti
Autenticazione vs Autorizzazione:
Autenticazione = "chi sei?" → verifica del token (Es. 10)
Autorizzazione = "cosa puoi fare?" → controllo ruolo/ownership (questo esercizio)
Sono due cose distinte. Un utente puo essere autenticato ma NON autorizzato a una specifica azione.
Principio del minimo privilegio: per default, un nuovo utente e utente. Il ruolo admin si assegna manualmente solo a chi ne ha davvero bisogno.
Verifica
Login come utente normale, DELETE /api/utenti/1 → 403
Login come admin, DELETE /api/utenti/1 → 200
Utente 2 prova a eliminare un post dell'utente 1 → 403
Utente 1 elimina il proprio post → 200
Admin elimina il post di chiunque → 200
Esercizio 13 — UI condizionale in base al ruolo
Obiettivo
Mostrare/nascondere bottoni e sezioni in base al ruolo dell'utente loggato. Un utente non-admin non deve vedere il bottone "Elimina utente"; un utente loggato vede il bottone "Elimina post" solo sui propri post.
File da modificare
web/js/app.js — aggiungere un helper per leggere l'utente loggato:
function getUtenteLoggato() {
const raw = localStorage.getItem("utente");
return raw ? JSON.parse(raw) : null;
}
​
web/js/ui.js — mostraPost() e mostraUtenti() ricevono un parametro utenteLoggato e decidono se mostrare i bottoni:
export function mostraPost(post, container, callbacks, utenteLoggato) {
container.innerHTML = post.map(p => {
const puoEliminare = utenteLoggato && (
utenteLoggato.id === p.userId || utenteLoggato.ruolo === "admin"
);
return `            <article class="card">
                <h3>${p.titolo}</h3>
                <p>${p.corpo}</p>
                ${puoEliminare ?`<button data-id="${p.id}" data-azione="elimina">Elimina</button>`: ""}
            </article>
       `;
}).join("");
// ... listener ...
}
​
web/js/app.js — nascondere la sezione "Nuovo Utente" se non si e admin:
const utente = getUtenteLoggato();
const formNuovoUtente = document.getElementById("form-utente");
formNuovoUtente.style.display = utente?.ruolo === "admin" ? "" : "none";
​
Suggerimenti
La sicurezza rimane SEMPRE lato server. Nascondere un bottone non protegge l'API. Se un utente malizioso apre i DevTools e chiama fetch() direttamente, e il server che deve rifiutare la richiesta (Es. 12). L'UI condizionale serve solo per l'esperienza utente — non mostrare bottoni che non funzionerebbero comunque.
Non fidarsi mai del payload JWT lato client. Il frontend puo leggerlo per decidere cosa mostrare, ma un utente malintenzionato potrebbe modificarlo nel suo localStorage (es. mettere ruolo: "admin" a mano). Non fa niente: il server verifica la firma e ignorera il token modificato.
Verifica
Loggato come utente normale: niente bottone "Elimina" sui post altrui, niente form "Nuovo Utente"
Loggato come admin: tutti i bottoni sono visibili
Non loggato: niente bottoni di scrittura da nessuna parte
Modificate a mano localStorage.utente mettendo ruolo: "admin" → il frontend "crede" di essere admin, ma tutte le richieste al server falliscono con 401 (firma non valida)
Esercizio 14 — Scadenza token e refresh
Obiettivo
Gestire la scadenza del token JWT. Invece di costringere l'utente a fare login ogni ora, usare due token:
Access token (breve: 15 min) — inviato ad ogni richiesta
Refresh token (lungo: 7 giorni) — usato solo per ottenere un nuovo access token
Il refresh token viene salvato nel DB (in una tabella dedicata) cosi puo essere revocato.
File da modificare
api/database/schema.sql — nuova tabella:
CREATE TABLE refresh_token (
id INT AUTO_INCREMENT PRIMARY KEY,
utenteId INT NOT NULL,
token VARCHAR(255) NOT NULL UNIQUE,
scadenza DATETIME NOT NULL,
FOREIGN KEY (utenteId) REFERENCES utenti(id) ON DELETE CASCADE
);
​
api/.env — aggiungere:
JWT_EXPIRES_IN=15m
REFRESH_EXPIRES_IN=7d
​
api/routes/auth.js — modificare /login per restituire entrambi i token:
const accessToken = jwt.sign({ ... }, JWT_SECRET, { expiresIn: "15m" });
const refreshToken = crypto.randomUUID();
await salvaRefreshToken(utente.id, refreshToken, scadenza7giorni);
res.json({ accessToken, refreshToken, utente });
​
api/routes/auth.js — nuovo endpoint /refresh:
router.post("/refresh", async (req, res) => {
const { refreshToken } = req.body;
const record = await trovaRefreshToken(refreshToken);
if (!record || new Date(record.scadenza) < new Date()) {
return res.status(401).json({ errore: "Refresh token non valido o scaduto" });
}
const utente = await trovaUtentePerId(record.utenteId);
const accessToken = jwt.sign({ id: utente.id, ... }, JWT_SECRET, { expiresIn: "15m" });
res.json({ accessToken });
});
​
api/routes/auth.js — nuovo endpoint /logout che cancella il refresh token dal DB.
web/js/api.js — intercettare i 401, tentare il refresh, ritentare la richiesta:
async function chiamataApi(percorso, opzioni = {}, tentativo = 1) {
// ... chiamata normale ...
if (risposta.status === 401 && tentativo === 1) {
const ok = await tentaRefresh();
if (ok) return chiamataApi(percorso, opzioni, 2);
}
// ...
}
​
Suggerimenti
Perche due token invece di uno lungo?
Un access token di 7 giorni viaggia ad OGNI richiesta → piu occasioni di essere intercettato
Un access token di 15 min, se rubato, scade velocemente
Il refresh token viaggia solo quando serve rinnovare → molto meno esposto
Il refresh token e nel DB → l'admin puo revocarlo istantaneamente (logout forzato)
Il refresh token NON e un JWT. E solo una stringa casuale. Non ha senso firmarlo: la validita si verifica cercandolo nel DB.
Verifica
Login → ricevete accessToken e refreshToken
Aspettate 15 minuti (o abbassate JWT_EXPIRES_IN=30s per testare)
La prossima richiesta da 401 → il frontend chiama /refresh automaticamente → ottiene un nuovo access token → ritenta → 200
Logout → il refresh token viene cancellato dal DB
Dopo il logout, anche chi avesse rubato il refresh token non puo piu usarlo
Esercizio 15 — Hardening: rate limiting, helmet, CORS
Obiettivo
Proteggere l'API dai principali attacchi "a costo zero":
Brute force sul login → express-rate-limit
Header HTTP mancanti o pericolosi → helmet
CORS troppo permissivo → configurare origin specifica
File da modificare
api/package.json — aggiungere le dipendenze:
cd api
npm install helmet express-rate-limit
​
api/.env e api/.env.example:
CORS_ORIGIN=http://localhost:8080
​
api/server.js:
import helmet from "helmet";
import rateLimit from "express-rate-limit";

app.use(helmet());

app.use(cors({
origin: process.env.CORS_ORIGIN,
credentials: true,
}));

const loginLimiter = rateLimit({
windowMs: 15 _ 60 _ 1000,
max: 5,
message: { errore: "Troppi tentativi, riprova tra 15 minuti" },
});
app.use("/api/auth/login", loginLimiter);
​
Suggerimenti
Cosa fa helmet? Imposta una dozzina di header HTTP di sicurezza:
X-Content-Type-Options: nosniff — impedisce al browser di "indovinare" il content-type
Strict-Transport-Security — forza HTTPS (in produzione)
X-Frame-Options: DENY — impedisce di caricare il sito in un <iframe> (anti-clickjacking)
...
Perche limitare il login a 5/15min? Se un attaccante indovina 5 password al minuto per un anno, fa 2.6 milioni di tentativi. Con il limite, solo 175.000. Con bcrypt (Es. 8) ogni tentativo e gia lento → il limite aggiunge un'ulteriore barriera.
CORS restretta: con origin: "\*" qualsiasi sito puo chiamare la vostra API dal browser di un utente loggato. Limitandola all'URL del frontend, il browser blocca le richieste da origini non autorizzate.
Verifica
Con DevTools → Network, ispezionate le risposte: dovete vedere header come X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security
Fate 6 login falliti in 15 minuti → il sesto restituisce 429 Too Many Requests
Aprite http://127.0.0.1:8080 (diverso da localhost:8080) → il browser blocca la chiamata per CORS
Riportate CORS_ORIGIN a http://localhost:8080 → torna a funzionare
Ordine consigliato
Esercizio 8 (Password + bcrypt) — base per tutto il resto
Esercizio 9 (JWT + login) — l'endpoint di autenticazione
Esercizio 10 (Middleware auth) — protezione route
Esercizio 11 (Login frontend) — il client diventa usabile
Esercizio 12 (Ruoli) — autorizzazione lato server
Esercizio 13 (UI condizionale) — autorizzazione lato client
Esercizio 15 (Hardening) — difese generiche (puo venire anche prima)
Esercizio 14 (Refresh token) — il piu avanzato, opzionale
Ogni esercizio costruisce sulle competenze del precedente. Esercizio 14 e marcato come ultimo perche e il piu astratto: si puo saltare senza pregiudicare il resto.
Concetti chiave introdotti
Esercizio
Concetti
8
Hashing, salt, bcrypt, differenza hash/cifratura
9
JWT, firma HMAC, payload, scadenza, segreto
10
Middleware Express, header Authorization, 401 vs 403
11
localStorage, header personalizzati, flusso login client
12
Autenticazione vs autorizzazione, ownership, minimo privilegio
13
Sicurezza client vs server, fidarsi solo del backend
14
Access/refresh token, revocabilita, rotazione
15
Rate limiting, header di sicurezza, CORS, OWASP basics
