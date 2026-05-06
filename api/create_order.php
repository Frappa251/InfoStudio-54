<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

$input = read_json_input();
$user = current_user();
$numeroTavolo = (int) ($input['numero_tavolo'] ?? 0);
$items = $input['items'] ?? [];

// --- INIZIO CONTROLLO ID VIP ---
$id_utente = $input['id_utente'] ?? null;

if (!$id_utente) {
    json_response(['success' => false, 'message' => 'Inserisci il tuo ID VIP per ordinare.'], 422);
}

// Interroghiamo il database usando la funzione db() del tuo amico
$stmt_check = db()->prepare('SELECT id FROM utenti WHERE id = ?');
$stmt_check->execute([$id_utente]);
$vip_esiste = $stmt_check->fetch();

if (!$vip_esiste) {
    json_response(['success' => false, 'message' => 'ID VIP non trovato. Inserisci un ID valido.'], 404);
}
// --- FINE CONTROLLO ID VIP ---

if ($numeroTavolo < 1 || $numeroTavolo > 30) {
    json_response(['success' => false, 'message' => 'Il numero del tavolo deve essere compreso tra 1 e 30.'], 422);
}

if (!is_array($items) || count($items) === 0) {
    json_response(['success' => false, 'message' => 'Il carrello è vuoto.'], 422);
}

$cleanItems = [];
$total = 0.0;

foreach ($items as $item) {
    $name = clean_string($item['name'] ?? '');
    $option = clean_string($item['option'] ?? '');
    $price = (float) ($item['price'] ?? 0);

    if ($name === '' || $price <= 0) {
        json_response(['success' => false, 'message' => 'Dati del carrello non validi.'], 422);
    }

    $cleanItems[] = [
        'name' => $name,
        'option' => $option,
        'price' => round($price, 2)
    ];
    $total += $price;
}

$stmt = db()->prepare('INSERT INTO ordini_menu (user_id, numero_tavolo, totale, items_json) VALUES (?, ?, ?, ?)');
$stmt->execute([
    $user ? $user['id'] : $id_utente,
    $numeroTavolo,
    round($total, 2),
    json_encode($cleanItems, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
]);

json_response([
    'success' => true,
    'message' => 'Ordine inviato alla cassa.',
    'order_id' => (int) db()->lastInsertId(),
    'total' => round($total, 2)
]);
