-- database/schema.sql — Struttura delle tabelle
--
-- Questo file crea le tabelle del nostro database.
-- Viene eseguito automaticamente da Docker al primo avvio.
--
-- Concetti chiave:
--   AUTO_INCREMENT  → MySQL genera l'id automaticamente (come prossimoId)
--   NOT NULL        → il campo è obbligatorio
--   DEFAULT ''      → valore predefinito se non specificato
--   FOREIGN KEY     → collega una tabella a un'altra
--   ON DELETE CASCADE → se elimini un utente, i suoi post vengono eliminati automaticamente

CREATE TABLE IF NOT EXISTS utenti (
    id      INT           NOT NULL AUTO_INCREMENT,
    nome    VARCHAR(100)  NOT NULL,
    email   VARCHAR(100)  NOT NULL,
    citta     VARCHAR(100)  NOT NULL DEFAULT '',
    creatoIl  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    codiceFiscale	CHAR(16) DEFAULT NULL,
    sesso   ENUM('M','F','Altro') DEFAULT NULL,
    dataNascita DATE DEFAULT NULL,
    telefono VARCHAR(20)  DEFAULT NULL,
    password VARCHAR(255) NOT NULL,
    ruolo  ENUM('utente','admin') DEFAULT 'utente',
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post (
    id      INT           NOT NULL AUTO_INCREMENT,
    userId  INT           NOT NULL,
    titolo  VARCHAR(255)  NOT NULL,
    corpo     TEXT          NOT NULL,
    creatoIl  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES utenti(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS commenti (
    id      INT           NOT NULL AUTO_INCREMENT,
    postId  INT           NOT NULL,
    nome    VARCHAR(100)  NOT NULL,
    email   VARCHAR(100)  NOT NULL,
    corpo     TEXT          NOT NULL,
    creatoIl  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE refresh_token (
    id INT AUTO_INCREMENT PRIMARY KEY,
    utenteId INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    scadenza DATETIME NOT NULL,
    FOREIGN KEY (utenteId) REFERENCES utenti(id) ON DELETE CASCADE
);