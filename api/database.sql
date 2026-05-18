-- =====================================================================
-- database.sql
-- Script di creazione del database "infostudio54" e delle sue tabelle.
-- Da eseguire una sola volta, ad esempio dalla console di phpMyAdmin
-- (XAMPP) oppure col comando:
--     mysql -u root -p < database.sql
-- =====================================================================


-- Creiamo il database se non esiste già.
-- Usiamo utf8mb4 per supportare bene caratteri accentati ed emoji.
CREATE DATABASE IF NOT EXISTS infostudio54
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Selezioniamo il database appena creato per i comandi successivi
USE infostudio54;


-- ---------------------------------------------------------------------
-- TABELLA: utenti
-- Contiene gli account registrati sul sito.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utenti (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(80)  NOT NULL,
    cognome         VARCHAR(80)  NOT NULL,
    telefono        VARCHAR(30)  NOT NULL,
    email           VARCHAR(190) NOT NULL UNIQUE,
    -- NB: nel database NON salviamo mai la password in chiaro!
    --     Salviamo solo l'hash generato in PHP con password_hash().
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ---------------------------------------------------------------------
-- TABELLA: prenotazioni
-- Contiene le prenotazioni dei tavoli per le serate evento.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prenotazioni (
    id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id             INT UNSIGNED NOT NULL,
    tavolo_id           TINYINT UNSIGNED NOT NULL,
    data_evento         DATE NOT NULL,
    numero_persone      TINYINT UNSIGNED NOT NULL,
    nome_contatto       VARCHAR(160) NOT NULL,
    email_contatto      VARCHAR(190) NOT NULL,
    telefono_contatto   VARCHAR(40)  NOT NULL,
    note                TEXT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Chiave esterna verso la tabella utenti:
    -- se un utente viene eliminato, vengono cancellate anche
    -- le sue prenotazioni (ON DELETE CASCADE).
    CONSTRAINT fk_prenotazioni_utenti
        FOREIGN KEY (user_id) REFERENCES utenti(id)
        ON DELETE CASCADE,

    -- Vincolo di unicità:
    -- non si può prenotare lo stesso tavolo nella stessa data
    -- (questo evita di vendere due volte lo stesso posto).
    CONSTRAINT unq_tavolo_data UNIQUE (tavolo_id, data_evento)
);


-- ---------------------------------------------------------------------
-- TABELLA: ordini_menu
-- Contiene gli ordini di drink/bottiglie fatti al tavolo.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordini_menu (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         INT UNSIGNED NULL,
    numero_tavolo   TINYINT UNSIGNED NOT NULL,
    totale          DECIMAL(8,2) NOT NULL,
    -- items_json contiene la lista degli articoli ordinati in formato JSON,
    -- es: [{"name":"Mojito","option":"Bacardi","price":10.0}, ...]
    items_json      JSON NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Chiave esterna verso utenti.
    -- ON DELETE SET NULL: se l'utente viene cancellato, l'ordine resta
    -- (utile per le statistiche) ma con user_id = NULL.
    CONSTRAINT fk_ordini_utenti
        FOREIGN KEY (user_id) REFERENCES utenti(id)
        ON DELETE SET NULL
);
