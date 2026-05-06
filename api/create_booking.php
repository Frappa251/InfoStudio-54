<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}

$user = require_user();
$input = read_json_input();

$tavoloId = (int) ($input['tavolo_id'] ?? 0);
$dataEvento = clean_string($input['data_evento'] ?? '');
$numeroPersone = (int) ($input['numero_persone'] ?? 0);
$nomeContatto = clean_string($input['nome_contatto'] ?? '');
$emailContatto = strtolower(clean_string($input['email_contatto'] ?? $user['email']));
$telefonoContatto = clean_string($input['telefono_contatto'] ?? '');
$note = clean_string($input['note'] ?? '');

$maxPersone = [1 => 5, 2 => 10, 3 => 20];

if (!isset($maxPersone[$tavoloId])) {
    json_response(['success' => false, 'message' => 'Tavolo non valido.'], 422);
}

if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dataEvento) || strtotime($dataEvento) < strtotime(date('Y-m-d'))) {
    json_response(['success' => false, 'message' => 'Data non valida.'], 422);
}

if ($numeroPersone < 1 || $numeroPersone > $maxPersone[$tavoloId]) {
    json_response(['success' => false, 'message' => "Questo tavolo accetta al massimo {$maxPersone[$tavoloId]} persone."], 422);
}

if ($nomeContatto === '' || !filter_var($emailContatto, FILTER_VALIDATE_EMAIL) || $telefonoContatto === '') {
    json_response(['success' => false, 'message' => 'Dati di contatto non validi.'], 422);
}

try {
    $stmt = db()->prepare(
        'INSERT INTO prenotazioni (user_id, tavolo_id, data_evento, numero_persone, nome_contatto, email_contatto, telefono_contatto, note)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->execute([
        $user['id'],
        $tavoloId,
        $dataEvento,
        $numeroPersone,
        $nomeContatto,
        $emailContatto,
        $telefonoContatto,
        $note !== '' ? $note : null
    ]);

    json_response([
        'success' => true,
        'message' => 'Prenotazione salvata correttamente.',
        'booking_id' => (int) db()->lastInsertId()
    ]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        json_response([
            'success' => false,
            'message' => 'Spiacenti, questo tavolo è già stato prenotato per questa data. Seleziona un’altra data o un altro tavolo.'
        ], 409);
    }

    json_response(['success' => false, 'message' => 'Errore durante il salvataggio della prenotazione.', 'detail' => $e->getMessage()], 500);
}
