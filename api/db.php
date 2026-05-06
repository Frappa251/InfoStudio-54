<?php
// api/db.php
// Configurazione unica per il backend PHP del progetto InfoStudio-54.
// Per XAMPP, i valori predefiniti sono in genere: host 127.0.0.1, utente root, password vuota.

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Se vuoi sovrascrivere le credenziali senza modificare questo file,
// crea api/config.local.php che definisca DB_HOST, DB_NAME, DB_USER, DB_PASS.
$localConfig = __DIR__ . '/config.local.php';
if (file_exists($localConfig)) {
    require_once $localConfig;
}

defined('DB_HOST') || define('DB_HOST', '127.0.0.1');
defined('DB_NAME') || define('DB_NAME', 'infostudio54');
defined('DB_USER') || define('DB_USER', 'root');
defined('DB_PASS') || define('DB_PASS', '');
defined('DB_CHARSET') || define('DB_CHARSET', 'utf8mb4');

function json_response(array $payload, int $statusCode = 200): never
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function read_json_input(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        json_response([
            'success' => false,
            'message' => 'JSON non valido nella richiesta.'
        ], 400);
    }

    return $decoded;
}

function db(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;

    try {
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    } catch (PDOException $e) {
        json_response([
            'success' => false,
            'message' => 'Connessione al database non riuscita. Controlla api/db.php e importa api/database.sql.',
            'detail' => $e->getMessage()
        ], 500);
    }

    return $pdo;
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = db()->prepare('SELECT id, nome, cognome, telefono, email, created_at FROM utenti WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        json_response([
            'success' => false,
            'authenticated' => false,
            'message' => 'Devi effettuare il login per continuare.'
        ], 401);
    }

    return $user;
}

function clean_string(mixed $value): string
{
    return trim((string) $value);
}
