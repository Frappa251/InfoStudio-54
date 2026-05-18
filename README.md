<div align="center">

  <img src="assets/images/logo.PNG" alt="InfoStudio-54" width="450" style="border-radius: 20px; margin-bottom: 20px;">
  
  # 🪩 InfoStudio-54 | Club Management System
  
  **Vivi la notte. Gestiscila con stile.** *Una piattaforma web full-stack per la gestione delle prenotazioni, menu digitali e area VIP di una discoteca.*

  <br>
  
  <img src="assets/images/minionsdancing.gif" width="400" style="border-radius: 20px" alt="Minions Disco Dancing">

  <br>

  [![Status](https://img.shields.io/badge/Status-Active-success.svg)]()
  [![PHP](https://img.shields.io/badge/Backend-PHP_8+-777BB4.svg?logo=php&logoColor=white)]()
  [![Database](https://img.shields.io/badge/Database-MariaDB-003545.svg?logo=mariadb&logoColor=white)]()
  
  [🇺🇸 See English version here](./README_ENG.md)

</div>

---

## 🍸 Benvenuti all'InfoStudio-54
**InfoStudio-54** non è solo il club più esclusivo della città, ma anche un progetto software sviluppato per offrire un'esperienza digitale fluida e premium ai nostri clienti. 

Questo repository contiene l'intero codice sorgente della piattaforma web: da un frontend in stile *glassmorphism* e neon, a un solido backend che gestisce il cuore pulsante del locale.

## 💻 Cosa fa questo codice? (Core Features)
Il sistema è progettato per automatizzare e gestire le interazioni con i clienti:

* 🎟️ **Gestione Prenotazioni:** Gli utenti possono selezionare la data, il numero di persone e la tipologia di tavolo (Standard, Premium, VIP).
* 🍾 **Digital Menu & Ordini (JSON):** Un menu interattivo con filtri per drink e bottiglie. Gli ordini vengono elaborati e inviati direttamente tramite formati JSON.
* 👑 **Area VIP (Auth):** Sistema di Registrazione e Login per l'accesso a una dashboard privata con "Tessera Digitale".
* 💾 **Salvataggio Persistente:** Tutti i dati (utenti, prenotazioni, loghi) sono archiviati in modo sicuro in un database relazionale locale.

## 🛠️ Tecnologie Utilizzate
Il progetto è stato migrato da un'architettura BaaS (Supabase) a un'infrastruttura server locale gestita interamente da noi.

**Frontend:**
* `HTML5` & `CSS3` (Stile personalizzato, animazioni CSS, layout responsivo)
* `JavaScript` (Vanilla JS & `jQuery` per chiamate AJAX)

**Backend & Database:**
* `PHP` (API RESTful per la gestione delle richieste frontend)
* `MariaDB` / `MySQL` (Database relazionale per utenti e prenotazioni)
* `phpMyAdmin` (Per l'amministrazione del database)
* `JSON` (Formato di interscambio dati tra client e server)

---

## 🚀 Come avviare il progetto (Quick Start)
Siccome il progetto utilizza PHP e un database, non è sufficiente aprire i file HTML nel browser. È necessario configurare un server locale (come XAMPP su Windows o gli strumenti nativi su Linux/Fedora).

Per non sporcare questo file, abbiamo creato delle guide dedicate. **Consulta i seguenti documenti prima di iniziare:**

👉 **[Guida al Setup di PHP e Database (README_PHP_SETUP.md)](./README_PHP_SETUP.md)** *Scopri come avviare il server, importare il file `database.sql` e configurare le credenziali.*

👉 **[Risoluzione dei Problemi (README_TROUBLESHOOTING.md)](./README_TROUBLESHOOTING.md)** *Se vedi schermate rosse di Errore 500, o se la password di MariaDB fa i capricci, qui trovi la soluzione.*

---

## 👥 Sviluppatori
Progetto sviluppato in team lavorando su rami condivisi tramite Git.
* Francesco Saverio Cioeta 2108245
* Matteo Priori 2143781
* Simone Santamaria 2108086

<br>

<div align="center">
  <i>"The Power To Connect."</i><br>
  © 2026 InfoStudio-54. Tutti i diritti riservati.
</div>