<?php
// =====================================================================
// db.php
// File di configurazione condiviso da tutti gli script PHP del backend.
// Si occupa di:
//   - far partire la sessione PHP
//   - aprire la connessione al database MySQL tramite PDO
//   - mettere a disposizione qualche funzione di utilità
// Va incluso in cima ad ogni file PHP con: require_once __DIR__ . '/db.php';
// =====================================================================


// Facciamo partire la sessione PHP se non è già attiva.
// La sessione ci serve per ricordare quale utente è loggato
// (salviamo $_SESSION['user_id'] dopo il login).
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}


// ---------------------------------------------------------------------
// PARAMETRI DI CONNESSIONE AL DATABASE
// Usiamo le costanti (define) così non possono essere cambiate per
// errore dal codice.
//
// Su Windows (XAMPP): PHP si connette via TCP su 127.0.0.1,
//   utente root senza password (default XAMPP).
// Su Linux (Fedora/Ubuntu con MariaDB nativo): MariaDB ascolta su
//   UNIX socket, quindi serve 'localhost' come host.
//   Utente root con password 'root'.
// ---------------------------------------------------------------------
if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
    // Windows — XAMPP: root senza password, connessione TCP
    define('DB_HOST', '127.0.0.1');
    define('DB_USER', 'root');
    define('DB_PASS', '');
} else {
    // Linux — MariaDB nativo: root con password, connessione via socket
    define('DB_HOST', 'localhost');
    define('DB_USER', 'root');
    define('DB_PASS', 'root');
}

define('DB_NAME', 'infostudio54');


// =====================================================================
// FUNZIONE: json_response
// Invia al client una risposta in formato JSON e termina lo script.
// È molto comoda perché ogni endpoint PHP risponde sempre in JSON.
// =====================================================================
function json_response($dati, $codiceStato = 200) {
    // Imposta il codice HTTP (200 = OK, 404 = Not Found, 500 = Server Error, ecc.)
    http_response_code($codiceStato);

    // Diciamo al browser che la risposta è in formato JSON
    header('Content-Type: application/json; charset=utf-8');

    // Convertiamo l'array PHP in una stringa JSON e la stampiamo
    echo json_encode($dati);

    // exit blocca l'esecuzione: nulla viene eseguito dopo questa chiamata
    exit;
}


// =====================================================================
// FUNZIONE: read_json_input
// Legge il corpo della richiesta HTTP (che si aspetta sia in JSON)
// e lo trasforma in un array associativo PHP.
// Si usa per ricevere i dati inviati dai form JavaScript con AJAX.
// =====================================================================
function read_json_input() {
    // php://input è uno "stream" che contiene il body grezzo della richiesta
    $testoGrezzo = file_get_contents('php://input');

    // Se il body è vuoto restituiamo un array vuoto
    if ($testoGrezzo == '') {
        return [];
    }

    // json_decode con secondo parametro true => restituisce un array associativo
    $decodificato = json_decode($testoGrezzo, true);

    // Se il JSON era malformato json_decode restituisce null
    if (!is_array($decodificato)) {
        json_response(['success' => false, 'message' => 'JSON non valido nella richiesta.'], 400);
    }

    return $decodificato;
}


// =====================================================================
// FUNZIONE: db
// Restituisce l'oggetto PDO per parlare con il database.
// La variabile $pdo è "static": viene creata la prima volta che la
// funzione viene chiamata e poi riutilizzata nelle chiamate successive,
// così non apriamo una nuova connessione ad ogni query.
// =====================================================================
function db() {
    static $pdo = null;

    // Se la connessione è già stata creata, la restituiamo direttamente
    if ($pdo != null) {
        return $pdo;
    }

    // Costruiamo la stringa DSN (Data Source Name) richiesta da PDO
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';

    try {
        // Creiamo l'oggetto PDO passandogli DSN, utente e password
        $pdo = new PDO($dsn, DB_USER, DB_PASS);

        // Impostiamo la modalità "Exception": se qualcosa va storto
        // (query sbagliata, connessione persa...) PHP lancia una PDOException
        // che possiamo intercettare con try/catch.
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Impostiamo il fetch mode di default: i risultati delle query
        // ci arriveranno come array associativi (es. $row['nome']).
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

    } catch (PDOException $e) {
        // Se non riusciamo a connetterci, rispondiamo con un errore 500
        json_response([
            'success' => false,
            'message' => 'Errore di connessione al database.'
        ], 500);
    }

    return $pdo;
}


// =====================================================================
// FUNZIONE: current_user
// Se in sessione c'è un user_id, va a cercare l'utente nel database
// e restituisce i suoi dati. Altrimenti restituisce null.
// =====================================================================
function current_user() {
    // Se non c'è nessun id in sessione, l'utente non è loggato
    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    // Prendiamo l'id salvato in sessione al momento del login
    $idUtente = $_SESSION['user_id'];

    // Cerchiamo l'utente nel database usando un prepared statement.
    // Il ? viene sostituito col valore passato a execute(): in questo
    // modo siamo protetti da SQL Injection.
    $sql = 'SELECT id, nome, cognome, telefono, email, created_at FROM utenti WHERE id = ? LIMIT 1';
    $stmt = db()->prepare($sql);
    $stmt->execute([$idUtente]);

    // fetch() restituisce la riga trovata oppure false se non c'è
    $utente = $stmt->fetch();

    if ($utente == false) {
        return null;
    }

    return $utente;
}


// =====================================================================
// FUNZIONE: require_user
// Da usare negli endpoint che richiedono per forza il login.
// Se l'utente non è loggato risponde con errore 401 e termina lo script.
// Se invece è loggato restituisce i suoi dati.
// =====================================================================
function require_user() {
    $utente = current_user();

    if ($utente == null) {
        json_response([
            'success' => false,
            'message' => 'Devi effettuare il login per continuare.'
        ], 401);
    }

    return $utente;
}


// =====================================================================
// FUNZIONE: clean_string
// Piccola funzione che converte il valore in stringa e toglie gli spazi
// iniziali/finali. La usiamo su tutti gli input ricevuti dai form.
// =====================================================================
function clean_string($valore) {
    return trim((string) $valore);
}
