<?php
// =====================================================================
// me.php
// Endpoint che restituisce i dati dell'utente attualmente loggato.
// È utile al frontend per sapere "chi sono io?" senza dover memorizzare
// i dati lato client.
// =====================================================================

require_once __DIR__ . '/db.php';

// Proviamo a recuperare l'utente dalla sessione.
// La funzione current_user() è definita in db.php:
//   - se c'è un user_id valido in sessione restituisce i suoi dati
//   - altrimenti restituisce null
$utente = current_user();


// CASO 1: nessuno è loggato
// Restituiamo una risposta "ok" ma col flag authenticated a false.
// Il frontend userà questo per capire se mostrare "Accedi" o il nome utente.
if ($utente == null) {
    json_response([
        'success'       => true,
        'authenticated' => false,
        'user'          => null
    ]);
}


// CASO 2: utente loggato
// Restituiamo i dati principali (mai la password o l'hash!)
json_response([
    'success'       => true,
    'authenticated' => true,
    'user' => [
        'id'         => (int) $utente['id'],
        'nome'       => $utente['nome'],
        'cognome'    => $utente['cognome'],
        'telefono'   => $utente['telefono'],
        'email'      => $utente['email'],
        'created_at' => $utente['created_at']
    ]
]);
