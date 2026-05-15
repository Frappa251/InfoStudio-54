<?php
// =====================================================================
// create_order.php
// Riceve un ordine al tavolo (lista di drink/bottiglie + numero tavolo)
// e lo salva nella tabella "ordini_menu".
// L'utente deve essere loggato per poter ordinare.
// =====================================================================

require_once __DIR__ . '/db.php';

// Solo richieste POST sono accettate
if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    json_response(['success' => false, 'message' => 'Metodo non consentito.'], 405);
}


// Leggiamo i dati dal body JSON
$input = read_json_input();


// CONTROLLO LOGIN
// Anche se il frontend controlla il login prima di mostrare il pulsante,
// dobbiamo sempre ricontrollare lato server: senza questa riga, un
// malintenzionato potrebbe inviare ordini senza essere autenticato.
$utente = current_user();
if ($utente == null) {
    json_response([
        'success' => false,
        'message' => 'Devi effettuare l\'accesso per ordinare.'
    ], 401);
}


// Estraiamo i campi dal JSON ricevuto
$numeroTavolo = (int) ($input['numero_tavolo'] ?? 0);
$items        = $input['items'] ?? [];


// ---------------------------------------------------------------------
// VALIDAZIONE
// ---------------------------------------------------------------------

// Il numero del tavolo deve essere tra 1 e 30 (i tavoli fisici del locale)
if ($numeroTavolo < 1 || $numeroTavolo > 30) {
    json_response([
        'success' => false,
        'message' => 'Il numero del tavolo deve essere compreso tra 1 e 30.'
    ], 422);
}

// Il carrello deve essere un array e deve contenere almeno un elemento
if (!is_array($items) || count($items) == 0) {
    json_response(['success' => false, 'message' => 'Il carrello è vuoto.'], 422);
}


// ---------------------------------------------------------------------
// PULIZIA ITEMS E CALCOLO TOTALE
// Scorriamo gli elementi del carrello con foreach e per ognuno:
//   - controlliamo che abbia un nome e un prezzo valido
//   - lo aggiungiamo all'array "pulito" che salveremo nel DB
//   - aggiorniamo il totale
// In questo modo non ci fidiamo di nessun dato passato dal client.
// ---------------------------------------------------------------------
$itemsPuliti = [];
$totale = 0;

foreach ($items as $item) {

    $nome    = clean_string($item['name']   ?? '');
    $opzione = clean_string($item['option'] ?? '');
    $prezzo  = (float) ($item['price']      ?? 0);

    // Se manca il nome o il prezzo non è positivo, il dato non è valido
    if ($nome == '' || $prezzo <= 0) {
        json_response(['success' => false, 'message' => 'Dati del carrello non validi.'], 422);
    }

    // round(..., 2) arrotonda il prezzo a due cifre decimali (es. 12.5 -> 12.50)
    $prezzoArrotondato = round($prezzo, 2);

    // Aggiungiamo l'item all'array pulito
    $itemsPuliti[] = [
        'name'   => $nome,
        'option' => $opzione,
        'price'  => $prezzoArrotondato
    ];

    // Sommiamo al totale
    $totale = $totale + $prezzoArrotondato;
}

// Arrotondiamo anche il totale finale a due decimali
$totale = round($totale, 2);


// ---------------------------------------------------------------------
// SALVATAGGIO NEL DATABASE
// La colonna items_json è di tipo JSON nel DB: ci salviamo dentro
// la lista completa degli articoli ordinati, così è semplice rileggerla.
// ---------------------------------------------------------------------
$sql = 'INSERT INTO ordini_menu (user_id, numero_tavolo, totale, items_json) VALUES (?, ?, ?, ?)';
$stmt = db()->prepare($sql);
$stmt->execute([
    $utente['id'],
    $numeroTavolo,
    $totale,
    json_encode($itemsPuliti)
]);


// Risposta finale al client
json_response([
    'success'  => true,
    'message'  => 'Ordine inviato alla cassa.',
    'order_id' => (int) db()->lastInsertId(),
    'total'    => $totale
]);
