// =====================================================================
// menu.js
// Gestisce la pagina del menù drink/bottiglie:
//   - filtri per categoria (Gin, Vodka, Rum...)
//   - selezione delle opzioni di un drink
//   - aggiunta al carrello
//   - barra fluttuante con il totale
//   - modale per scegliere il numero del tavolo
//   - invio dell'ordine al backend
// Il carrello viene salvato in localStorage così non si perde quando
// l'utente ricarica la pagina
// =====================================================================

$(document).ready(function () {

    // -----------------------------------------------------------------
    // Riferimenti agli elementi della pagina (con $ jQuery)
    // -----------------------------------------------------------------
    var bottoniFiltro       = $('.filter-btn');
    var cardDrink           = $('.drink-card');
    var barraCarrello       = $('#floatingBar');
    var spanTotale          = $('#cartTotal');
    var headerCarrello      = $('#cartHeader');
    var listaItemsCarrello  = $('#cartItemsList');
    var bottoneCheckout     = $('#btnCheckout');

    var modaleTavolo        = $('#tableModal');
    var contenutoFormModale = $('#modalFormContent');
    var contenutoSuccessoModale = $('#modalSuccessContent');
    var inputNumeroTavolo   = $('#tableNumberInput');
    var bottoneAnnulla      = $('#btnCancelModal');
    var bottoneConferma     = $('#btnConfirmModal');
    var spanTavoloSuccesso  = $('#successTableNumber');


    // -----------------------------------------------------------------
    // Carichiamo il carrello da localStorage (se esiste)
    // localStorage memorizza solo stringhe, quindi usiamo JSON.parse
    // per riconvertirlo in un array
    // -----------------------------------------------------------------
    var carrello = [];
    var carrelloSalvato = localStorage.getItem('cart');
    if (carrelloSalvato != null) {
        carrello = JSON.parse(carrelloSalvato);
    }


    // =================================================================
    // FUNZIONI DI UTILITÀ
    // =================================================================

    // Mostra un piccolo "toast" in basso a destra con un messaggio
    // È un'alternativa più carina al banale alert() del browser
    function mostraToast(messaggio) {

        var toast = $('<div class="custom-toast"></div>').text(messaggio);
        $('body').append(toast);

        // Aggiungiamo la classe "show" dopo 10ms così l'animazione CSS parte
        setTimeout(function () {
            toast.addClass('show');
        }, 10);

        // Dopo 3 secondi togliamo la classe e poi rimuoviamo l'elemento
        setTimeout(function () {
            toast.removeClass('show');
            setTimeout(function () {
                toast.remove();
            }, 400);
        }, 3000);
    }


    // =================================================================
    // GESTIONE FILTRI PER CATEGORIA
    // Quando l'utente clicca su un bottone "Gin", "Vodka" ecc.,
    // mostriamo solo i drink di quella categoria
    // =================================================================
    bottoniFiltro.on('click', function () {

        var bottone   = $(this);
        var categoria = bottone.data('filter');

        // Aggiorniamo lo stato "active" dei bottoni
        bottoniFiltro.removeClass('active');
        bottone.addClass('active');

        // Scorriamo tutte le card e decidiamo se mostrarle o nasconderle
        cardDrink.each(function () {
            var card = $(this);
            var categoriaCard = card.data('category');

            if (categoria == 'all' || categoriaCard == categoria) {
                // Mostra la card
                card.show();
                setTimeout(function () {
                    card.css({ opacity: '1', transform: 'scale(1)' });
                }, 50);
            } else {
                // Nascondi la card
                card.css({ opacity: '0', transform: 'scale(0.9)' });
                setTimeout(function () {
                    card.hide();
                }, 400);
            }
        });
    });


    // =================================================================
    // APERTURA/CHIUSURA DEL PANNELLO OPZIONI DI UN DRINK
    // =================================================================
    $('.drink-options-btn').on('click', function () {

        var bottone   = $(this);
        var pannello  = bottone.next('.options-panel');

        if (pannello.length == 0) {
            return;
        }

        var giaAperto = pannello.hasClass('open');

        // Prima cosa: chiudiamo tutti i pannelli aperti su altre card
        $('.options-panel').removeClass('open');
        $('.toggle-icon').text('▼');

        // Se il nostro non era aperto, lo apriamo
        if (giaAperto == false) {
            pannello.addClass('open');
            bottone.find('.toggle-icon').text('▲');
        }
    });


    // =================================================================
    // SELEZIONE DI UNA OPZIONE NEL PANNELLO
    // Quando l'utente clicca su Bombay/Hendrick's/ecc, aggiorniamo
    // il prezzo finale del drink e il testo del bottone
    // =================================================================
    $('.option-item').on('click', function () {

        var item    = $(this);
        var pannello = item.closest('.options-panel');

        // Marchiamo come "selected" solo l'item cliccato
        pannello.find('.option-item').removeClass('selected');
        item.addClass('selected');

        // Risaliamo alla card del drink
        var card = item.closest('.drink-card');

        // Calcoliamo il nuovo prezzo = prezzo base + extra dell'opzione
        var prezzoBase  = parseFloat(card.data('baseprice'));
        var prezzoExtra = parseFloat(item.data('extra'));

        if (isNaN(prezzoBase))  { prezzoBase  = 0; }
        if (isNaN(prezzoExtra)) { prezzoExtra = 0; }

        var nuovoPrezzo = prezzoBase + prezzoExtra;

        // Aggiorniamo l'attributo data e il testo del prezzo
        card.data('currentprice', nuovoPrezzo);
        card.attr('data-currentprice', nuovoPrezzo);
        card.find('.final-price').text(' ' + nuovoPrezzo.toFixed(2));

        // Aggiorniamo il testo del bottone con la base scelta
        var nomeBase = item.find('span:first').text();
        var categoria = card.data('category');

        var prefisso = 'base';
        if (categoria == 'gin')   { prefisso = 'Gin'; }
        if (categoria == 'vodka') { prefisso = 'Vodka'; }
        if (categoria == 'rum')   { prefisso = 'Rum'; }

        card.find('.drink-options-btn span:first').text(prefisso + ': ' + nomeBase);

        // Chiudiamo il pannello
        pannello.removeClass('open');
        card.find('.toggle-icon').text('▼');
    });


    // =================================================================
    // AGGIORNAMENTO DELLA BARRA CARRELLO IN BASSO
    // Ricostruisce la lista degli articoli e calcola il totale
    // =================================================================
    function aggiornaUICarrello() {

        // Svuotiamo la lista, poi la ricostruiamo da zero
        listaItemsCarrello.empty();

        // Se il carrello è vuoto, nascondiamo la barra
        if (carrello.length == 0) {
            barraCarrello.removeClass('visible');
            barraCarrello.removeClass('expanded');
            spanTotale.text(' 0.00');
            return;
        }

        barraCarrello.addClass('visible');

        var totale = 0;

        // Scorriamo gli articoli con un classico ciclo for
        for (var i = 0; i < carrello.length; i++) {
            var item = carrello[i];
            totale = totale + item.price;

            // Creiamo l'HTML della riga
            var rigaHtml = '' +
                '<div class="cart-item">' +
                '    <div class="item-details">' +
                '        <span class="item-name"></span>' +
                '        <span class="item-option"></span>' +
                '    </div>' +
                '    <div class="item-actions">' +
                '        <span class="item-price"></span>' +
                '        <button class="btn-remove" type="button">X</button>' +
                '    </div>' +
                '</div>';

            var rigaJq = $(rigaHtml);

            // Usiamo .text() invece di inserire direttamente i valori
            // nell'HTML: in questo modo siamo protetti contro l'XSS
            // (se per caso un drink avesse nel nome un tag HTML,
            // verrebbe mostrato come testo e non interpretato)
            rigaJq.find('.item-name').text(item.name);
            rigaJq.find('.item-option').text(item.option);
            rigaJq.find('.item-price').text(' ' + item.price.toFixed(2));
            rigaJq.find('.btn-remove').data('id', item.id);

            listaItemsCarrello.append(rigaJq);
        }

        spanTotale.text(' ' + totale.toFixed(2));
    }


    // =================================================================
    // RIMOZIONE DI UN ARTICOLO DAL CARRELLO
    // Usiamo "delegazione" di evento: l'handler è su listaItemsCarrello
    // ma scatta solo quando si clicca un .btn-remove al suo interno
    // Lo facciamo così perché i bottoni vengono creati dinamicamente
    // =================================================================
    listaItemsCarrello.on('click', '.btn-remove', function (evento) {

        evento.stopPropagation();

        var idDaRimuovere = $(this).data('id');

        // Costruiamo un nuovo carrello senza l'articolo cliccato
        var nuovoCarrello = [];
        for (var i = 0; i < carrello.length; i++) {
            if (carrello[i].id != idDaRimuovere) {
                nuovoCarrello.push(carrello[i]);
            }
        }

        carrello = nuovoCarrello;

        // Salviamo il carrello aggiornato in localStorage
        localStorage.setItem('cart', JSON.stringify(carrello));

        aggiornaUICarrello();
    });


    // =================================================================
    // CLICK SULL'HEADER DEL CARRELLO -> ESPANDE/CHIUDE LA LISTA
    // Però se l'utente clicca il bottone "Richiedi al tavolo" NON
    // espandiamo, perché lì parte il checkout
    // =================================================================
    headerCarrello.on('click', function (evento) {

        if ($(evento.target).hasClass('btn-checkout') || evento.target.id == 'btnCheckout') {
            return;
        }

        if (carrello.length > 0) {
            barraCarrello.toggleClass('expanded');
        }
    });


    // =================================================================
    // CLICK SU "Aggiungi" DI UNA CARD DRINK
    // =================================================================
    $('.btn-add').on('click', function () {

        var bottone = $(this);
        var card    = bottone.closest('.drink-card');

        // CONTROLLO: se il drink ha le opzioni (es. tipo di gin), l'utente
        // deve averne scelta una prima di poter aggiungere al carrello
        var dropdown = card.find('.drink-options-btn');

        if (dropdown.length > 0) {

            var testoBottone = dropdown.find('span:first-child').text().trim();

            // Lista dei testi "vuoti" (di default, nessuna opzione scelta)
            var testiVuoti = ['Scegli il Gin', 'Scegli la Vodka', 'Scegli il Rum', 'Scegli la base'];

            // Cerchiamo se il testo attuale è uno di quelli vuoti
            var ancoraVuoto = false;
            for (var i = 0; i < testiVuoti.length; i++) {
                if (testiVuoti[i] == testoBottone) {
                    ancoraVuoto = true;
                }
            }

            if (ancoraVuoto == true) {
                mostraToast('Devi prima scegliere la base del drink per selezionarlo.');

                // Lampeggio rosso del bottone delle opzioni
                dropdown.css('border-color', '#ff4444');
                setTimeout(function () {
                    dropdown.css('border-color', 'rgba(255, 255, 255, 0.1)');
                }, 2000);

                return;
            }
        }

        // L'aggiunta al carrello procede: prendiamo nome, opzione e prezzo
        var nomeDrink = card.find('.drink-name').text().trim();

        var opzioneScelta = '';
        var itemSelezionato = card.find('.options-panel .option-item.selected');
        if (itemSelezionato.length > 0) {
            opzioneScelta = itemSelezionato.find('span:first').text().trim();
        }

        var prezzo = parseFloat(card.data('currentprice'));
        if (isNaN(prezzo)) {
            prezzo = parseFloat(card.data('baseprice'));
        }
        if (isNaN(prezzo)) {
            prezzo = 0;
        }

        // Aggiungiamo l'articolo al carrello
        // Per l'id usiamo timestamp + numero casuale così è praticamente
        // impossibile avere due articoli con lo stesso id
        var nuovoId = Date.now() + Math.floor(Math.random() * 1000);

        carrello.push({
            id:     nuovoId,
            name:   nomeDrink,
            option: opzioneScelta,
            price:  prezzo
        });

        localStorage.setItem('cart', JSON.stringify(carrello));
        aggiornaUICarrello();

        // Il bottone diventa verde per 1.5 secondi
        var testoOriginale = bottone.text();
        bottone.text('Aggiunto ✓');
        bottone.css({
            background: '#00ff88',
            color: '#0b0b0f',
            boxShadow: '0 0 20px #00ff88'
        });

        setTimeout(function () {
            bottone.text(testoOriginale);
            bottone.css({
                background: '',
                color: '',
                boxShadow: ''
            });
        }, 1500);
    });


    // =================================================================
    // CLICK SU "Richiedi al tavolo"
    // Apre la modale dove l'utente scriverà il numero del suo tavolo
    // Però prima dobbiamo controllare che sia loggato
    // =================================================================
    bottoneCheckout.on('click', function (evento) {

        evento.stopPropagation();

        if (carrello.length == 0) {
            return;
        }

        // Chiediamo al backend se siamo loggati
        $.ajax({
            url: '../api/me.php',
            type: 'GET',
            dataType: 'json',

            success: function (risposta) {

                if (risposta.authenticated == false) {
                    mostraToast('Devi effettuare l\'accesso per ordinare.');
                    return;
                }

                // Apriamo la modale per il numero tavolo
                contenutoFormModale.show();
                contenutoSuccessoModale.hide();
                inputNumeroTavolo.val('');
                inputNumeroTavolo.attr('placeholder', 'Scegli un tavolo (1-30)');
                modaleTavolo.addClass('active');

                // Diamo il focus all'input dopo un piccolo ritardo per
                // assicurarci che la modale sia visibile
                setTimeout(function () {
                    inputNumeroTavolo.trigger('focus');
                }, 100);
            },

            error: function (xhr) {
                mostraToast('Errore di connessione. Riprova tra poco.');
            }
        });
    });


    // Bottone "Annulla" della modale
    bottoneAnnulla.on('click', function () {
        modaleTavolo.removeClass('active');
    });


    // =================================================================
    // CLICK SU "Conferma" DELLA MODALE
    // Manda l'ordine al backend
    // =================================================================
    bottoneConferma.on('click', function () {

        var numeroTavolo = parseInt(inputNumeroTavolo.val(), 10);

        // Controllo: il tavolo deve essere un numero tra 1 e 30
        if (isNaN(numeroTavolo) || numeroTavolo < 1 || numeroTavolo > 30) {

            inputNumeroTavolo.val('');
            inputNumeroTavolo.attr('placeholder', 'Errore: solo tavoli 1-30!');
            inputNumeroTavolo.css('border-color', '#ff4444');

            setTimeout(function () {
                inputNumeroTavolo.css('border-color', 'rgba(255, 255, 255, 0.2)');
            }, 1500);

            return;
        }

        // Disabilitiamo il bottone per evitare doppi click
        bottoneConferma.prop('disabled', true);
        bottoneConferma.text('Invio...');

        // Prepariamo la lista degli articoli da inviare al backend
        // Mandiamo solo i campi necessari (name, option, price): l'id locale
        // non serve al server.
        var itemsDaInviare = [];
        for (var i = 0; i < carrello.length; i++) {
            itemsDaInviare.push({
                name:   carrello[i].name,
                option: carrello[i].option,
                price:  carrello[i].price
            });
        }

        $.ajax({
            url: '../api/create_order.php',
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            data: JSON.stringify({
                numero_tavolo: numeroTavolo,
                items:         itemsDaInviare
            }),

            success: function (risposta) {

                if (risposta.success == false) {
                    // Errore "logico" dal backend
                    inputNumeroTavolo.val('');
                    inputNumeroTavolo.attr('placeholder', risposta.message);
                    inputNumeroTavolo.css('border-color', '#ff4444');

                    setTimeout(function () {
                        inputNumeroTavolo.css('border-color', 'rgba(255, 255, 255, 0.2)');
                    }, 3000);

                    return;
                }

                // Ordine inviato con successo
                contenutoFormModale.hide();
                spanTavoloSuccesso.text(numeroTavolo);
                contenutoSuccessoModale.show();

                // Svuotiamo il carrello in memoria e in localStorage
                carrello = [];
                localStorage.removeItem('cart');
                aggiornaUICarrello();
                barraCarrello.removeClass('expanded');

                // Dopo 2.5 secondi chiudiamo la modale
                setTimeout(function () {
                    modaleTavolo.removeClass('active');
                }, 2500);
            },

            error: function (xhr) {
                InfoStudioApi.logError('ordine menu', xhr);

                var messaggio = InfoStudioApi.userMessage(xhr, 'Ordine non inviato. Riprova tra poco.');

                inputNumeroTavolo.val('');
                inputNumeroTavolo.attr('placeholder', messaggio);
                inputNumeroTavolo.css('border-color', '#ff4444');

                setTimeout(function () {
                    inputNumeroTavolo.css('border-color', 'rgba(255, 255, 255, 0.2)');
                }, 3000);
            },

            // complete viene chiamata sempre, sia in caso di success che di error
            // La usiamo per riabilitare il bottone "Conferma"
            complete: function () {
                bottoneConferma.prop('disabled', false);
                bottoneConferma.text('Conferma');
            }
        });
    });


    // Chiusura della modale cliccando sullo sfondo nero attorno
    modaleTavolo.on('click', function (evento) {
        if (evento.target == this && contenutoFormModale.is(':visible')) {
            modaleTavolo.removeClass('active');
        }
    });


    // Aggiornamento iniziale del carrello (utile se l'utente aveva già
    // qualche articolo salvato in localStorage da una visita precedente)
    aggiornaUICarrello();
});
