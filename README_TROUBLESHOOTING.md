# Risoluzione errori backend PHP

Se vedi messaggi tipo “server locale non risponde” o “formato non valido”, quasi sempre il problema è l'ambiente locale, non i dati inseriti nella form.

## 1. Non usare Live Server / Preview / file://

Questo progetto contiene file PHP. Devono essere eseguiti da un server PHP, ad esempio XAMPP.

URL corretto:

```text
http://localhost/InfoStudio-54/
```

URL problematici:

```text
file:///...
http://127.0.0.1:5500/...
Live Server
VS Code Preview statico
```

Live Server serve file statici, ma non interpreta PHP. In quel caso le chiamate AJAX ricevono HTML/codice PHP invece di JSON e il frontend mostra errore.

## 2. Avvia Apache e MySQL

In XAMPP devono essere attivi:

- Apache
- MySQL

Poi metti la cartella `InfoStudio-54` dentro `C:\xampp\htdocs\`.

## 3. Importa il database

Apri phpMyAdmin e importa:

```text
api/database.sql
```

Il database creato deve chiamarsi:

```text
infostudio54
```

## 4. Controlla la connessione

Apri direttamente nel browser:

```text
http://localhost/InfoStudio-54/api/health.php
```

Se funziona, devi vedere una risposta JSON simile a:

```json
{"success":true,"message":"Backend PHP e database raggiungibili.","database":"infostudio54"}
```

## 5. Credenziali database

Le credenziali predefinite sono in `api/db.php`:

```text
host: 127.0.0.1
utente: root
password: vuota
database: infostudio54
```

Se sono diverse, copia `api/config.local.example.php` in `api/config.local.php` e modifica i valori.

## 6. Dove vedere il dettaglio dell'errore

Apri la console del browser:

```text
F12 → Console
```

Gli errori tecnici completi vengono scritti lì, mentre nella pagina viene mostrato un messaggio più adatto all'utente.
