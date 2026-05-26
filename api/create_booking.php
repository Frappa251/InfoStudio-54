<?php
// =====================================================================
// create_booking.php
// Riceve i dati di una prenotazione e li salva nella tabella
// "prenotazioni". L'utente DEVE essere loggato per poter prenotare
// =====================================================================

require_once __DIR__ . '/db.php';

// Accettiamo solo richieste POST
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}


// L'utente deve essere loggato: se non lo è require_user risponde 401 e basta
$utente = require_user();


// Leggiamo i dati della prenotazione dal body JSON
$input = read_json_input();

// (int) e clean_string ci servono per essere sicuri di lavorare con tipi
// "puliti" anche se il client invia valori strani
$tavoloId         = (int) ($input['tavolo_id']         ?? 0);
$dataEvento       = clean_string($input['data_evento'] ?? '');
$numeroPersone    = (int) ($input['numero_persone']    ?? 0);
$nomeContatto     = clean_string($input['nome_contatto']     ?? '');
$emailContatto    = clean_string($input['email_contatto']    ?? '');
$telefonoContatto = clean_string($input['telefono_contatto'] ?? '');
$note             = clean_string($input['note'] ?? '');

// Se l'email di contatto non è stata indicata, usiamo quella dell'utente loggato
if ($emailContatto == '') {
    $emailContatto = $utente['email'];
}
$emailContatto = strtolower($emailContatto);


// ---------------------------------------------------------------------
// VALIDAZIONE DEI DATI
// ---------------------------------------------------------------------

// 1) Il tavolo può essere solo 1 (Standard), 2 (Premium) o 3 (VIP)
//    Per ogni tipo c'è anche un numero massimo di persone consentito
//    Usiamo un array associativo per legare tavolo -> massimo persone
$maxPersonePerTavolo = [
    1 => 4,
    2 => 8,
    3 => 12
];

if (!isset($maxPersonePerTavolo[$tavoloId])) {
    json_response(['success' => false, 'message' => 'Tavolo non valido.'], 422);
}


// 2) La data deve essere in formato YYYY-MM-DD e non può essere nel passato
//    strtotime trasforma la stringa in timestamp UNIX così possiamo confrontare
$timestampData = strtotime($dataEvento);
$timestampOggi = strtotime(date('Y-m-d'));

if ($timestampData == false || $timestampData < $timestampOggi) {
    json_response(['success' => false, 'message' => 'Data non valida.'], 422);
}


// 3) Il numero di persone deve essere compreso tra 1 e il massimo del tavolo scelto
$massimoConsentito = $maxPersonePerTavolo[$tavoloId];

if ($numeroPersone < 1 || $numeroPersone > $massimoConsentito) {
    json_response([
        'success' => false,
        'message' => 'Questo tavolo accetta al massimo ' . $massimoConsentito . ' persone.'
    ], 422);
}


// 4) Dati di contatto: il nome non deve essere vuoto, l'email deve essere
//    valida e il telefono non vuoto
if ($nomeContatto == '') {
    json_response(['success' => false, 'message' => 'Dati di contatto non validi.'], 422);
}

if (!filter_var($emailContatto, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'message' => 'Dati di contatto non validi.'], 422);
}

if ($telefonoContatto == '') {
    json_response(['success' => false, 'message' => 'Dati di contatto non validi.'], 422);
}


// Se non sono state scritte note, salviamo null nel database invece di stringa vuota
if ($note == '') {
    $note = null;
}


// ---------------------------------------------------------------------
// SALVATAGGIO NEL DATABASE
// La tabella prenotazioni ha un vincolo UNIQUE su (tavolo_id, data_evento):
// vuol dire che non si può prenotare lo stesso tavolo nella stessa data
// due volte. Se ci provassimo il database lancia un errore di duplicato
// (codice SQLSTATE 23000) che catturiamo nel catch
// ---------------------------------------------------------------------
try {

    $sql = 'INSERT INTO prenotazioni
            (user_id, tavolo_id, data_evento, numero_persone,
             nome_contatto, email_contatto, telefono_contatto, note)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

    $stmt = db()->prepare($sql);
    $stmt->execute([
        $utente['id'],
        $tavoloId,
        $dataEvento,
        $numeroPersone,
        $nomeContatto,
        $emailContatto,
        $telefonoContatto,
        $note
    ]);

    // Recuperiamo l'id appena generato e lo restituiamo al client
    $idPrenotazione = (int) db()->lastInsertId();

    json_response([
        'success'    => true,
        'message'    => 'Prenotazione salvata correttamente.',
        'booking_id' => $idPrenotazione
    ]);

} catch (PDOException $e) {

    // 23000 = violazione di un vincolo (in questo caso UNIQUE su tavolo+data)
    if ($e->getCode() == '23000') {
        json_response([
            'success' => false,
            'message' => 'Spiacenti, questo tavolo è già stato prenotato per questa data. Scegli un\'altra data o un altro tavolo.'
        ], 409);
    }

    // Per ogni altro errore restituiamo un messaggio generico
    json_response([
        'success' => false,
        'message' => 'Errore durante il salvataggio della prenotazione.'
    ], 500);
}
