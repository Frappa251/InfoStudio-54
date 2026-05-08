# Setup PHP + MySQL/MariaDB per InfoStudio-54

Questa versione rimuove Supabase dal frontend e usa un backend PHP con database MySQL/MariaDB.

Il progetto può essere avviato sia su **Windows** sia su **Linux**:

- su **Windows** puoi usare XAMPP;
- su **Linux** puoi usare PHP dedicato / PHP Live Server in localhost, senza Apache e senza XAMPP.

---

## 1. Requisiti

### Windows

Consigliato:

- XAMPP
- Apache
- MySQL/MariaDB
- phpMyAdmin, incluso in XAMPP

### Linux

Consigliato:

- PHP installato localmente
- estensione PHP per MySQL/MariaDB
- MySQL o MariaDB
- un utente database con password

Esempio su Ubuntu/Debian e derivate:

```bash
sudo apt update
sudo apt install php php-mysql mariadb-server
```

Non serve installare Apache se usi PHP Live Server o il server PHP integrato.

---

## 2. Avvio ambiente locale

### Windows con XAMPP

1. Apri il pannello di controllo XAMPP.
2. Avvia **Apache**.
3. Avvia **MySQL**.
4. Metti la cartella del progetto dentro `htdocs`, ad esempio:

```text
C:\xampp\htdocs\InfoStudio-54
```

Poi apri il sito da:

```text
http://localhost/InfoStudio-54/
```

### Linux con PHP dedicato / PHP Live Server

Su Linux non serve mettere il progetto in una cartella speciale.
La cartella `InfoStudio-54` può stare dove preferisci, ad esempio in `Documenti`, `Scrivania`, `Progetti` o dentro una workspace.

Entra nella cartella del progetto:

```bash
cd /percorso/del/progetto/InfoStudio-54
```

Avvia il server PHP locale, ad esempio:

```bash
php -S localhost:8000
```

Poi apri il sito da:

```text
http://localhost:8000/
```

Se usi un'estensione tipo **PHP Live Server**, avviala dalla cartella del progetto e usa l'URL/porta che ti viene mostrato dall'estensione.

---

## 3. Creazione database

Il file da importare è:

```text
api/database.sql
```

Il file crea il database `infostudio54` e le tabelle:

- `utenti`
- `prenotazioni`
- `ordini_menu`

### Windows con phpMyAdmin

1. Apri:

```text
http://localhost/phpmyadmin
```

2. Importa il file:

```text
api/database.sql
```

### Linux da terminale MySQL/MariaDB

Dalla cartella del progetto:

```bash
mysql -u root -p < api/database.sql
```

Oppure usa il tuo utente MySQL/MariaDB:

```bash
mysql -u nome_utente -p < api/database.sql
```

Su Linux la password del database normalmente **non è vuota**.

---

## 4. Configurazione credenziali database

Le credenziali predefinite sono in `api/db.php`:

```php
DB_HOST = 127.0.0.1
DB_NAME = infostudio54
DB_USER = root
DB_PASS = ''
```

### Windows

Con XAMPP, spesso funzionano subito:

```text
utente: root
password: vuota
```

### Linux

Su Linux usa le credenziali reali del tuo database, con password non vuota.

Copia:

```text
api/config.local.example.php
```

in:

```text
api/config.local.php
```

poi modifica `api/config.local.php`, ad esempio:

```php
DB_HOST = 127.0.0.1
DB_NAME = infostudio54
DB_USER = nome_utente
DB_PASS = tua_password
```

---

## 5. Controllo connessione backend

### Windows con XAMPP

Apri direttamente nel browser:

```text
http://localhost/InfoStudio-54/api/health.php
```

### Linux con PHP Live Server / PHP dedicato

Se hai avviato il server dalla cartella del progetto con `php -S localhost:8000`, apri:

```text
http://localhost:8000/api/health.php
```

Se tutto funziona, devi vedere una risposta JSON simile a:

```json
{"success":true,"message":"Backend PHP e database raggiungibili.","database":"infostudio54"}
```

Se vedi HTML, codice PHP, pagina vuota o errore 500, consulta `README_TROUBLESHOOTING.md`.

---

## 6. Tecnologie integrate

- PHP lato server
- MySQL/MariaDB tramite PDO
- Sessioni PHP per login/logout
- AJAX con jQuery verso endpoint PHP
- JSON per scambio dati client/server

---

## 7. Endpoint principali

- `api/register.php`
- `api/login.php`
- `api/logout.php`
- `api/me.php`
- `api/update_profile.php`
- `api/create_booking.php`
- `api/create_order.php`