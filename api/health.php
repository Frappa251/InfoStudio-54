<?php
require_once __DIR__ . '/db.php';

try {
    db()->query('SELECT 1');
    json_response([
        'success' => true,
        'message' => 'Backend PHP e database raggiungibili.',
        'database' => DB_NAME
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'message' => 'Backend PHP raggiunto, ma il database non risponde.',
        'detail' => $e->getMessage()
    ], 500);
}
