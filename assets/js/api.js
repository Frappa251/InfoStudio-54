// =====================================================================
// api.js
// Piccolo "wrapper" attorno a $.ajax di jQuery: in tutti gli altri file
// JavaScript usiamo le funzioni di InfoStudioApi così non ripetiamo
// ogni volta lo stesso codice di chiamata al backend PHP.
// =====================================================================


// Calcoliamo l'URL base degli endpoint PHP.
// - Se ci troviamo dentro la cartella /pages/ (es. login.html) dobbiamo
//   risalire di una cartella e andare in /api/.
// - Se invece siamo nella root (es. index.html), basta /api/.
var urlPagina = window.location.pathname;
var baseUrlApi;
if (urlPagina.indexOf('/pages/') != -1) {
    baseUrlApi = '../api/';
} else {
    baseUrlApi = 'api/';
}


// Creiamo un oggetto globale "InfoStudioApi" che gli altri file useranno.
// Le sue proprietà sono le funzioni esposte verso l'esterno.
window.InfoStudioApi = {

    // ----------------------------------------------------------------
    // request: esegue una chiamata AJAX al backend PHP.
    //
    // Parametri:
    //   endpoint -> nome del file PHP da chiamare (es. "login.php")
    //   opzioni  -> oggetto opzionale con:
    //                 method: 'GET' o 'POST' (default 'GET')
    //                 data:   oggetto JS che verrà mandato come JSON
    //
    // Restituisce: l'oggetto restituito da $.ajax (è una Promise jQuery).
    // ----------------------------------------------------------------
    request: function (endpoint, opzioni) {

        // Se l'utente non passa opzioni, ne creiamo una vuota
        if (opzioni == null) {
            opzioni = {};
        }

        // Metodo HTTP: GET se non specificato
        var metodo = 'GET';
        if (opzioni.method != null) {
            metodo = opzioni.method;
        }

        // Se ci sono dati da inviare, li trasformiamo in stringa JSON.
        // Altrimenti non mandiamo nulla nel body della richiesta.
        var datiDaInviare;
        if (opzioni.data != null) {
            datiDaInviare = JSON.stringify(opzioni.data);
        } else {
            datiDaInviare = undefined;
        }

        // Lanciamo la chiamata AJAX con jQuery
        return $.ajax({
            url: baseUrlApi + endpoint,
            type: metodo,
            data: datiDaInviare,
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            timeout: 10000   // dopo 10 secondi consideriamo la chiamata fallita
        });
    },


    // ----------------------------------------------------------------
    // getCurrentUser: scorciatoia per chiamare me.php e sapere
    // se c'è un utente loggato (e quali sono i suoi dati).
    // ----------------------------------------------------------------
    getCurrentUser: function () {
        return this.request('me.php');
    },


    // ----------------------------------------------------------------
    // userMessage: prende l'oggetto "error" arrivato dal callback
    // di errore di $.ajax e restituisce un messaggio leggibile per
    // l'utente. Se non riusciamo a capire il problema, usiamo il
    // messaggio "fallback" passato come secondo parametro.
    // ----------------------------------------------------------------
    userMessage: function (errore, fallback) {

        if (fallback == null) {
            fallback = 'Operazione non riuscita. Riprova tra poco.';
        }

        // Caso 1: il backend ha risposto con un JSON contenente "message"
        if (errore != null && errore.responseJSON != null && errore.responseJSON.message != null) {

            // Se è un errore 5xx (server) facciamo capire che è un problema di config
            if (errore.status >= 500) {
                return 'Il server non è configurato correttamente. Controlla che Apache, MySQL e il database siano attivi.';
            }

            return errore.responseJSON.message;
        }

        // Caso 2: nessuna risposta dal server (status = 0)
        // Tipico quando il server è spento o l'utente apre il file senza Apache.
        if (errore != null && errore.status == 0) {
            return 'Il server locale non risponde. Apri il progetto da http://localhost/ con Apache/PHP attivo.';
        }

        // Caso 3: 404 - endpoint inesistente
        if (errore != null && errore.status == 404) {
            return 'Endpoint PHP non trovato. Controlla la posizione della cartella api/.';
        }

        // Caso 4: messaggio non identificato, usiamo quello di default
        return fallback;
    },


    // ----------------------------------------------------------------
    // logError: stampa l'errore nella console del browser in modo
    // ordinato. Serve solo a noi sviluppatori per fare debug, non
    // viene mai mostrato all'utente.
    // ----------------------------------------------------------------
    logError: function (contesto, errore) {
        console.group('InfoStudio API - ' + contesto);
        console.error(errore);
        if (errore != null && errore.responseText != null) {
            console.log('Risposta grezza del server:', errore.responseText);
        }
        console.groupEnd();
    }
};
