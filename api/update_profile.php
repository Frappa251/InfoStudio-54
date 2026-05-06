<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

$user = require_user();
$input = read_json_input();

$nome = clean_string($input['nome'] ?? '');
$cognome = clean_string($input['cognome'] ?? '');
$telefono = preg_replace('/\s+/', '', clean_string($input['telefono'] ?? ''));

if ($nome === '' || $cognome === '' || $telefono === '') {
    json_response(['success' => false, 'message' => 'Compila nome, cognome e telefono.'], 422);
}

$stmt = db()->prepare('UPDATE utenti SET nome = ?, cognome = ?, telefono = ? WHERE id = ?');
$stmt->execute([$nome, $cognome, $telefono, $user['id']]);

json_response([
    'success' => true,
    'message' => 'Profilo aggiornato.',
    'user' => [
        'id' => (int) $user['id'],
        'nome' => $nome,
        'cognome' => $cognome,
        'telefono' => $telefono,
        'email' => $user['email']
    ]
]);
