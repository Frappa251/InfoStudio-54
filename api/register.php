<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

$input = read_json_input();
$nome = clean_string($input['nome'] ?? '');
$cognome = clean_string($input['cognome'] ?? '');
$telefono = preg_replace('/\s+/', '', clean_string($input['telefono'] ?? ''));
$email = strtolower(clean_string($input['email'] ?? ''));
$password = (string) ($input['password'] ?? '');

if ($nome === '' || $cognome === '' || $telefono === '' || $email === '' || $password === '') {
    json_response(['success' => false, 'message' => 'Compila tutti i campi.'], 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Email non valida.'], 422);
}

if (strlen($password) < 6) {
    json_response(['success' => false, 'message' => 'La password deve contenere almeno 6 caratteri.'], 422);
}

if (!preg_match('/^[0-9+\-]{8,20}$/', $telefono)) {
    json_response(['success' => false, 'message' => 'Numero di telefono non valido.'], 422);
}

try {
    $stmt = db()->prepare('INSERT INTO utenti (nome, cognome, telefono, email, password_hash) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $nome,
        $cognome,
        $telefono,
        $email,
        password_hash($password, PASSWORD_DEFAULT)
    ]);

    $_SESSION['user_id'] = (int) db()->lastInsertId();

    json_response([
        'success' => true,
        'message' => 'Registrazione completata.',
        'user' => [
            'id' => $_SESSION['user_id'],
            'nome' => $nome,
            'cognome' => $cognome,
            'telefono' => $telefono,
            'email' => $email
        ]
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_response(['success' => false, 'message' => 'Esiste già un account con questa email.'], 409);
    }

    json_response(['success' => false, 'message' => 'Errore durante la registrazione.', 'detail' => $e->getMessage()], 500);
}
