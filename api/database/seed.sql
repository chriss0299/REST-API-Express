-- database/seed.sql — Dati iniziali
--
-- Inserisce gli stessi dati che avevamo nel vecchio database.js.
-- Viene eseguito automaticamente da Docker al primo avvio.

INSERT INTO utenti (id, nome, email, citta, codiceFiscale, sesso, dataNascita, telefono) VALUES
    (1, 'Mario Rossi',   'mario@email.com',  'Roma',    'RSSMRA80A01H501A', 'M',     '1980-01-01', '+39 06 1234567'),
    (2, 'Luigi Verdi',   'luigi@email.com',  'Milano',  'VRDLGU75B02F205B', 'M',     '1975-02-02', '+39 02 7654321'),
    (3, 'Peach Bianchi', 'peach@email.com',  'Napoli',  'BNCPCH90C03F839C', 'F',     '1990-03-03', '+39 081 9876543'),
    (4, 'Toad Gialli',   'toad@email.com',   'Torino',  'GLLTDO85D04L219D', 'Altro', '1985-04-04', NULL),
    (5, 'Bowser Neri',   'bowser@email.com', 'Firenze', 'NREBWS70E05D612E', 'M',     '1970-05-05', '+39 055 1122334');

INSERT INTO post (id, userId, titolo, corpo) VALUES
    (1, 1, 'Il mio primo post',          'Ciao a tutti! Questo è il mio primo post sulla piattaforma.'),
    (2, 1, 'Node.js è fantastico',       'Oggi ho imparato a creare un server con Express.js.'),
    (3, 2, 'Ricetta pasta e fagioli',    'Ingredienti: pasta, fagioli, olio, aglio, peperoncino...'),
    (4, 3, 'Viaggio a Parigi',           'La Tour Eiffel è ancora più bella dal vivo di quanto immaginassi.'),
    (5, 3, 'Consigli per lo studio',     'Ecco i miei 5 consigli per studiare programmazione in modo efficace.'),
    (6, 4, 'Recensione: The Last of Us', 'Un capolavoro videoludico che emoziona dall''inizio alla fine.'),
    (7, 5, 'Il futuro dell''AI',         'L''intelligenza artificiale sta cambiando il modo in cui lavoriamo.'),
    (8, 2, 'La mia città preferita',     'Milano non è solo moda e business, ha anche una grande anima culturale.');

INSERT INTO commenti (id, postId, nome, email, corpo) VALUES
    (1,  1, 'Luigi Verdi',   'luigi@email.com',  'Benvenuto nella piattaforma!'),
    (2,  1, 'Peach Bianchi', 'peach@email.com',   'Bel primo post, complimenti!'),
    (3,  2, 'Toad Gialli',   'toad@email.com',    'Anche io sto imparando Node.js, è davvero potente.'),
    (4,  3, 'Mario Rossi',   'mario@email.com',   'Ottima ricetta! La provo stasera.'),
    (5,  4, 'Bowser Neri',   'bowser@email.com',  'Parigi è nella mia bucket list, grazie per il racconto!'),
    (6,  4, 'Luigi Verdi',   'luigi@email.com',   'Ci sono stato l''anno scorso, confermo tutto!'),
    (7,  5, 'Toad Gialli',   'toad@email.com',    'Il consiglio sulla pratica quotidiana è il più importante.'),
    (8,  7, 'Mario Rossi',   'mario@email.com',   'L''AI è un tema affascinante ma anche un po'' spaventoso.'),
    (9,  7, 'Peach Bianchi', 'peach@email.com',   'Sono d''accordo, l''importante è usarla in modo etico.'),
    (10, 6, 'Luigi Verdi',   'luigi@email.com',   'Capolavoro assoluto, lo sto rigiocando per la terza volta.');
