// assets/js/api.js
// Wrapper AJAX basato su jQuery per comunicare con il backend PHP.
// Espone anche una funzione di diagnostica per mostrare messaggi utente più puliti.

window.InfoStudioApi = (() => {
    const inPagesFolder = window.location.pathname.includes('/pages/');
    const baseUrl = inPagesFolder ? '../api/' : 'api/';

    function request(endpoint, options = {}) {
        const method = options.method || 'GET';
        const payload = options.data ? JSON.stringify(options.data) : undefined;

        return $.ajax({
            url: baseUrl + endpoint,
            method,
            data: payload,
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            timeout: 10000
        });
    }

    function getCurrentUser() {
        return request('me.php');
    }

    function userMessage(error, fallback = 'Operazione non riuscita. Riprova tra poco.') {
        // Messaggi restituiti correttamente dal backend PHP in JSON.
        if (error?.responseJSON?.message) {
            // Per errori tecnici interni, mostriamo un messaggio più adatto all'utente
            // e lasciamo i dettagli nella console del browser.
            if (error.status >= 500) {
                return 'Il server non è configurato correttamente. Controlla che Apache, MySQL e il database siano attivi.';
            }
            return error.responseJSON.message;
        }

        // Nessuna risposta: server spento, URL sbagliato, file aperto senza server, CORS, ecc.
        if (error?.status === 0) {
            return 'Il server locale non risponde. Apri il progetto da http://localhost/InfoStudio-54/ con Apache/PHP attivo.';
        }

        if (error?.status === 404) {
            return 'Endpoint PHP non trovato. Controlla che la cartella api/ sia nella posizione corretta.';
        }

        // Parser error: spesso succede quando PHP non viene eseguito e il browser riceve HTML/codice PHP invece di JSON.
        if (error?.textStatus === 'parsererror' || error?.parsererror) {
            return 'Il server ha risposto in un formato non valido. Probabilmente stai usando Live Server/Preview invece di Apache con PHP.';
        }

        return fallback;
    }

    function logError(context, error) {
        console.group(`InfoStudio API - ${context}`);
        console.error(error);
        if (error?.responseText) {
            console.log('Risposta grezza del server:', error.responseText.slice(0, 1000));
        }
        console.log('URL base API:', baseUrl);
        console.groupEnd();
    }

    return {
        baseUrl,
        request,
        getCurrentUser,
        userMessage,
        logError
    };
})();
