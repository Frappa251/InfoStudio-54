<?php
// =====================================================================
// register.php
// Riceve i dati di registrazione dal form (in formato JSON) e li salva
// nella tabella "utenti". Restituisce sempre una risposta in JSON
// =====================================================================

// Includiamo il file di configurazione che contiene la connessione PDO
// e altre funzione di utilità (json_response, db, clean_string ecc.)
require_once __DIR__ . '/db.php';

// Controlliamo che la richiesta sia stata inviata col metodo POST
// In caso contrario rispondiamo con un errore 405 (Method Not Allowed)
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

// Leggiamo il corpo JSON della richiesta e prendiamo i singoli campi
// L'operatore ?? assegna una stringa vuota se il campo non è stato inviato
$input = read_json_input();

$nome     = clean_string($input['nome']     ?? '');
$cognome  = clean_string($input['cognome']  ?? '');
$telefono = clean_string($input['telefono'] ?? '');
$email    = clean_string($input['email']    ?? '');
$password = $input['password'] ?? '';

// Mettiamo l'email tutta in minuscolo per evitare duplicati
$email = strtolower($email);

// Togliamo eventuali spazi nel numero di telefono
$telefono = str_replace(' ', '', $telefono);


// ---------------------------------------------------------------------
// VALIDAZIONE LATO SERVER
// Anche se il form HTML controlla già i campi, dobbiamo SEMPRE
// ricontrollare lato server: un utente malintenzionato potrebbe
// aggirare i controlli del browser
// ---------------------------------------------------------------------

// 1) Tutti i campi devono essere stati compilati
if ($nome == '' || $cognome == '' || $telefono == '' || $email == '' || $password == '') {
    json_response(['success' => false, 'message' => 'Compila tutti i campi.'], 422);
}

// 2) L'email deve essere in un formato valido
//    filter_var con FILTER_VALIDATE_EMAIL è la funzione standard di PHP
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Email non valida.'], 422);
}

// 3) La password deve essere lunga almeno 6 caratteri
if (strlen($password) < 6) {
    json_response(['success' => false, 'message' => 'La password deve contenere almeno 6 caratteri.'], 422);
}

// 4) Il telefono deve essere lungo almeno 8 cifre
if (strlen($telefono) < 8) {
    json_response(['success' => false, 'message' => 'Numero di telefono non valido.'], 422);
}


// ---------------------------------------------------------------------
// SALVATAGGIO NEL DATABASE
// Usiamo i Prepared Statement di PDO per evitare SQL Injection:
// i valori inseriti dall'utente NON vengono concatenati nella query
// ma passati separatamente tramite execute()
// ---------------------------------------------------------------------
try {

    // password_hash() trasforma la password in chiaro in un hash sicuro
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Prepariamo la query con i punti interrogativi al posto dei valori
    $sql = 'INSERT INTO utenti (nome, cognome, telefono, email, password_hash) VALUES (?, ?, ?, ?, ?)';
    $stmt = db()->prepare($sql);

    // Eseguiamo la query passando i valori nell'ordine dei "?"
    $stmt->execute([$nome, $cognome, $telefono, $email, $passwordHash]);

    // Recuperiamo l'id appena generato dal DB e lo salviamo in sessione
    // così l'utente risulta già "loggato" dopo la registrazione
    $nuovoId = (int) db()->lastInsertId();
    $_SESSION['user_id'] = $nuovoId;

    // Rispondiamo al client con i dati appena salvati
    json_response([
        'success' => true,
        'message' => 'Registrazione completata.',
        'user' => [
            'id'       => $nuovoId,
            'nome'     => $nome,
            'cognome'  => $cognome,
            'telefono' => $telefono,
            'email'    => $email
        ]
    ]);

} catch (PDOException $e) {

    // Il codice SQLSTATE '23000' indica violazione di un vincolo:
    // nel nostro caso significa che l'email è già stata usata
    // (la colonna email ha il vincolo UNIQUE nella tabella utenti).
    if ($e->getCode() == '23000') {
        json_response(['success' => false, 'message' => 'Esiste già un account con questa email.'], 409);
    }

    // Per ogni altro errore restituiamo un messaggio generico
    json_response(['success' => false, 'message' => 'Errore durante la registrazione.'], 500);
}
