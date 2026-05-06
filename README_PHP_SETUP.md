# Setup PHP + MySQL per InfoStudio-54

Questa versione rimuove Supabase dal frontend e usa un backend PHP con database MySQL/MariaDB.

## 1. Avvio ambiente locale

Con XAMPP:

1. Avvia **Apache**.
2. Avvia **MySQL**.
3. Metti la cartella del progetto dentro `htdocs`, ad esempio:
   `C:\xampp\htdocs\InfoStudio-54`

Poi apri il sito da:

```text
http://localhost/InfoStudio-54/
```

## 2. Creazione database

Apri phpMyAdmin oppure il terminale MySQL e importa:

```text
api/database.sql
```

Il file crea il database `infostudio54` e le tabelle:

- `utenti`
- `prenotazioni`
- `ordini_menu`

## 3. Configurazione credenziali database

Le credenziali predefinite sono in `api/db.php`:

```php
DB_HOST = 127.0.0.1
DB_NAME = infostudio54
DB_USER = root
DB_PASS = ''
```

Se le tue credenziali sono diverse, copia:

```text
api/config.local.example.php
```

in:

```text
api/config.local.php
```

poi modifica i valori.

## 4. Tecnologie integrate

- PHP lato server
- MySQL/MariaDB tramite PDO
- Sessioni PHP per login/logout
- AJAX con jQuery verso endpoint PHP
- JSON per scambio dati client/server

## 5. Endpoint principali

- `api/register.php`
- `api/login.php`
- `api/logout.php`
- `api/me.php`
- `api/update_profile.php`
- `api/create_booking.php`
- `api/create_order.php`

Il frontend chiama questi endpoint tramite `assets/js/api.js`.
