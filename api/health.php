<?php
// =====================================================================
// health.php
// Piccolo endpoint di "diagnostica": serve a controllare velocemente
// se il server PHP è attivo e se riesce a parlare col database
// Si può aprire da browser per verificare che tutto sia configurato bene
// =====================================================================

require_once __DIR__ . '/db.php';

try {

    // Eseguiamo una query ("SELECT 1") solo per vedere
    // se la connessione al database risponde correttamente
    db()->query('SELECT 1');

    // Se siamo arrivati qui, funziona
    json_response([
        'success'  => true,
        'message'  => 'Backend PHP e database raggiungibili.',
        'database' => DB_NAME
    ]);

} catch (PDOException $e) {

    // Se la query fallisce -> problema col database
    json_response([
        'success' => false,
        'message' => 'Backend PHP raggiunto, ma il database non risponde.'
    ], 500);
}
