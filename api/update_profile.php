<?php
// =====================================================================
// update_profile.php
// Aggiorna nome, cognome e telefono dell'utente loggato
// L'email non si può modificare perché è la "chiave" usata per il login
// =====================================================================

require_once __DIR__ . '/db.php';

// le richieste che modificano dati lato server
// sono sempre POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}


// require_user() controlla che ci sia un utente loggato in sessione
// Se non c'è, risponde 401 e termina lo script automaticamente
$utente = require_user();


// Leggiamo i nuovi valori inviati dal form
$input = read_json_input();

$nome     = clean_string($input['nome']     ?? '');
$cognome  = clean_string($input['cognome']  ?? '');
$telefono = clean_string($input['telefono'] ?? '');

// Togliamo gli spazi dal telefono
$telefono = str_replace(' ', '', $telefono);


// Validazione: tutti e tre i campi devono essere stati compilati
if ($nome == '' || $cognome == '' || $telefono == '') {
    json_response(['success' => false, 'message' => 'Compila nome, cognome e telefono.'], 422);
}


// ---------------------------------------------------------------------
// AGGIORNAMENTO NEL DATABASE
// Usiamo i prepared statements come per tutte le altre query
// L'ultimo "?" è l'id dell'utente: viene preso dalla sessione
// In questo modo un utente non può modificare il profilo di qualcun altro 
// semplicemente cambiando un id nel JSON
// ---------------------------------------------------------------------
$sql = 'UPDATE utenti SET nome = ?, cognome = ?, telefono = ? WHERE id = ?';
$stmt = db()->prepare($sql);
$stmt->execute([$nome, $cognome, $telefono, $utente['id']]);


// Rispondiamo con i dati aggiornati così il frontend aggiorna la UI
json_response([
    'success' => true,
    'message' => 'Profilo aggiornato.',
    'user' => [
        'id'       => (int) $utente['id'],
        'nome'     => $nome,
        'cognome'  => $cognome,
        'telefono' => $telefono,
        'email'    => $utente['email']
    ]
]);
