<?php
// =====================================================================
// logout.php
// Cancella i dati di sessione e distrugge la sessione PHP, così l'utente
// non risulta più loggato.
// =====================================================================

require_once __DIR__ . '/db.php';

// Svuotiamo la variabile $_SESSION (toglie tutti i dati salvati in sessione)
$_SESSION = [];


// Se PHP è configurato per usare i cookie di sessione (caso quasi sempre vero),
// cancelliamo anche il cookie nel browser dell'utente impostandone la scadenza
// nel passato. In questo modo al prossimo accesso PHP creerà una sessione nuova.
if (ini_get('session.use_cookies')) {
    $parametri = session_get_cookie_params();

    setcookie(
        session_name(),     // nome del cookie (di default "PHPSESSID")
        '',                 // valore vuoto
        time() - 3600,      // scadenza un'ora nel passato (cookie eliminato)
        $parametri['path'],
        $parametri['domain'],
        $parametri['secure'],
        $parametri['httponly']
    );
}


// session_destroy() cancella il file della sessione lato server.
// A questo punto l'utente è completamente disconnesso.
session_destroy();


// Rispondiamo al client con un messaggio di conferma
json_response([
    'success' => true,
    'message' => 'Logout effettuato.'
]);
