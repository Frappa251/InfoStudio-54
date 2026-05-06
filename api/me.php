<?php
require_once __DIR__ . '/db.php';

$user = current_user();

if (!$user) {
    json_response([
        'success' => true,
        'authenticated' => false,
        'user' => null
    ]);
}

json_response([
    'success' => true,
    'authenticated' => true,
    'user' => [
        'id' => (int) $user['id'],
        'nome' => $user['nome'],
        'cognome' => $user['cognome'],
        'telefono' => $user['telefono'],
        'email' => $user['email'],
        'created_at' => $user['created_at']
    ]
]);
