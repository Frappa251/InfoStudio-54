# Risoluzione errori backend PHP

Se vedi messaggi tipo “server locale non risponde” o “formato non valido”, quasi sempre il problema è l'ambiente locale, non i dati inseriti nella form.

Questa guida vale sia per **Windows** sia per **Linux**.

---

## 1. Controlla di usare un server PHP

Questo progetto contiene file PHP. Devono essere eseguiti da un server PHP, non aperti come file statici.

### Windows

Con XAMPP, URL corretto:

```text
http://localhost/InfoStudio-54/
```

### Linux

Con PHP dedicato / PHP Live Server, se avvii il server dalla cartella del progetto, URL corretto:

```text
http://localhost:8000/
```

La porta può cambiare in base al comando o all'estensione che usi.

### URL problematici

```text
file:///...
VS Code Preview statico
Live Server statico che non interpreta PHP
```

Se il server non interpreta PHP, le chiamate AJAX ricevono HTML o codice PHP invece di JSON e il frontend mostra errore.

---

## 2. Controlla che l'ambiente locale sia avviato

### Windows con XAMPP

Nel pannello XAMPP devono essere attivi:

- Apache
- MySQL

La cartella del progetto deve stare in:

```text
C:\xampp\htdocs\InfoStudio-54
```

### Linux con PHP Live Server / PHP dedicato

Su Linux non serve Apache e non serve XAMPP.
La cartella del progetto può stare dove vuoi.

Entra nella cartella del progetto:

```bash
cd /percorso/del/progetto/InfoStudio-54
```

Avvia il server PHP locale:

```bash
php -S localhost:8000
```

Oppure avvia la tua estensione **PHP Live Server** e usa l'URL localhost che ti viene mostrato.

Controlla anche che MySQL/MariaDB sia attivo:

```bash
sudo systemctl status mariadb
```

Se non è attivo:

```bash
sudo systemctl start mariadb
```

Su alcune installazioni il servizio può chiamarsi `mysql` invece di `mariadb`.

---

## 3. Importa il database

Il file da importare è:

```text
api/database.sql
```

Il database creato deve chiamarsi:

```text
infostudio54
```

### Windows con phpMyAdmin

Apri:

```text
http://localhost/phpmyadmin
```

Poi importa:

```text
api/database.sql
```

### Linux da terminale

Dalla cartella del progetto:

```bash
mysql -u root -p < api/database.sql
```

Oppure usa il tuo utente MySQL/MariaDB:

```bash
mysql -u nome_utente -p < api/database.sql
```

Controlla che il database esista:

```bash
mysql -u nome_utente -p -e "SHOW DATABASES LIKE 'infostudio54';"
```

---

## 4. Controlla la connessione backend

### Windows con XAMPP

Apri direttamente nel browser:

```text
http://localhost/InfoStudio-54/api/health.php
```

### Linux con PHP Live Server / PHP dedicato

Se il server PHP è stato avviato dalla cartella del progetto con `php -S localhost:8000`, apri:

```text
http://localhost:8000/api/health.php
```

Se funziona, devi vedere una risposta JSON simile a:

```json
{"success":true,"message":"Backend PHP e database raggiungibili.","database":"infostudio54"}
```

Se invece vedi HTML, codice PHP, pagina bianca o errore 500, il backend non sta girando correttamente o le credenziali database non sono corrette.

---

## 5. Credenziali database

Le credenziali predefinite sono in `api/db.php`:

```text
host: 127.0.0.1
utente: root
password: vuota
database: infostudio54
```

### Windows

Con XAMPP, queste credenziali spesso funzionano subito.

### Linux

Su Linux la password del database normalmente **non è vuota**.
Usa quindi `api/config.local.php` con le tue credenziali reali.

Copia:

```text
api/config.local.example.php
```

in:

```text
api/config.local.php
```

poi modifica i valori, ad esempio:

```php
DB_HOST = 127.0.0.1
DB_NAME = infostudio54
DB_USER = nome_utente
DB_PASS = tua_password
```

---

## 6. Se vedi codice PHP nel browser

Significa che stai usando un server statico, oppure il server non sta interpretando PHP.

### Windows

Verifica di usare Apache di XAMPP e di aprire il progetto da:

```text
http://localhost/InfoStudio-54/
```

non da `file://` o da una preview statica.

### Linux

Verifica che PHP sia installato:

```bash
php -v
```

Poi avvia il progetto con PHP dedicato dalla cartella corretta:

```bash
cd /percorso/del/progetto/InfoStudio-54
php -S localhost:8000
```

Apri:

```text
http://localhost:8000/
```

---

## 7. Dove vedere il dettaglio dell'errore

Apri la console del browser:

```text
F12 → Console
```

Su Linux, se usi il server PHP integrato, guarda anche il terminale in cui hai avviato:

```bash
php -S localhost:8000
```

Gli errori tecnici completi vengono scritti lì o nella console del browser, mentre nella pagina viene mostrato un messaggio più adatto all'utente.