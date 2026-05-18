<?php
// =====================================================================
// login.php
// Riceve email e password (in formato JSON), controlla che corrispondano
// ad un utente nel database e, se ok, salva l'id in sessione
// =====================================================================

require_once __DIR__ . '/db.php';

// Accettiamo solo richieste POST: il login non va fatto in GET
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

// Leggiamo email e password dal body JSON
$input = read_json_input();

$email    = clean_string($input['email'] ?? '');
$password = $input['password'] ?? '';

// Normalizziamo l'email in minuscolo
$email = strtolower($email);

// Controllo base: entrambi i campi devono essere stati compilati
if ($email == '' || $password == '') {
    json_response(['success' => false, 'message' => 'Inserisci email e password.'], 422);
}


// ---------------------------------------------------------------------
// CERCHIAMO L'UTENTE NEL DATABASE
// Usiamo un prepared statement con il punto interrogativo:
// la variabile $email viene passata separatamente a execute(),
// così non c'è rischio di SQL Injection
// ---------------------------------------------------------------------
$sql = 'SELECT id, nome, cognome, telefono, email, password_hash FROM utenti WHERE email = ? LIMIT 1';
$stmt = db()->prepare($sql);
$stmt->execute([$email]);

$utente = $stmt->fetch();


// ---------------------------------------------------------------------
// CONTROLLO PASSWORD
// password_verify confronta la password in chiaro inserita dall'utente
// con l'hash salvato nel database (creato in fase di registrazione con
// password_hash). Restituisce true se corrispondono
// ---------------------------------------------------------------------
if ($utente == false || !password_verify($password, $utente['password_hash'])) {
    // Diamo lo stesso messaggio sia che l'email non esista
    // sia che la password sia sbagliata. In questo modo non aiutiamo
    // un eventuale attaccante a capire quali email sono registrate
    json_response(['success' => false, 'message' => 'Credenziali non valide.'], 401);
}


// ---------------------------------------------------------------------
// LOGIN RIUSCITO
// session_regenerate_id cambia l'id di sessione: è una protezione
// contro il "Session Fixation" (un attacco in cui un malintenzionato
// forza un id di sessione noto sull'utente prima del login)
// ---------------------------------------------------------------------
session_regenerate_id(true);

// Salviamo l'id dell'utente in sessione. Finché la connessione è attiva,
// current_user() troverà i suoi dati
$_SESSION['user_id'] = (int) $utente['id'];

// Rispondiamo con i dati dell'utente così il
// frontend può mostrare il nome nella navbar
json_response([
    'success' => true,
    'message' => 'Login effettuato.',
    'user' => [
        'id'       => (int) $utente['id'],
        'nome'     => $utente['nome'],
        'cognome'  => $utente['cognome'],
        'telefono' => $utente['telefono'],
        'email'    => $utente['email']
    ]
]);
