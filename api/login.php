<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

$input = read_json_input();
$email = strtolower(clean_string($input['email'] ?? ''));
$password = (string) ($input['password'] ?? '');

if ($email === '' || $password === '') {
    json_response(['success' => false, 'message' => 'Inserisci email e password.'], 422);
}

$stmt = db()->prepare('SELECT * FROM utenti WHERE email = ? LIMIT 1');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['success' => false, 'message' => 'Credenziali non valide.'], 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int) $user['id'];

json_response([
    'success' => true,
    'message' => 'Login effettuato.',
    'user' => [
        'id' => (int) $user['id'],
        'nome' => $user['nome'],
        'cognome' => $user['cognome'],
        'telefono' => $user['telefono'],
        'email' => $user['email']
    ]
]);
