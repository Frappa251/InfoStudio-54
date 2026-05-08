// assets/js/menu.js
// Menu dinamico realizzato con jQuery: filtri, carrello, modale e invio ordine via AJAX a PHP.
$(document).ready(function () {
    const $filterBtns = $('.filter-btn');
    const $cards = $('.drink-card');
    const $floatingBar = $('#floatingBar');
    const $totalDisplay = $('#cartTotal');
    const $cartHeader = $('#cartHeader');
    const $cartItemsContainer = $('#cartItemsList');
    const $btnCheckout = $('#btnCheckout');
    const $modalOverlay = $('#tableModal');
    const $modalFormContent = $('#modalFormContent');
    const $modalSuccessContent = $('#modalSuccessContent');
    const $tableNumberInput = $('#tableNumberInput');
    const $btnCancelModal = $('#btnCancelModal');
    const $btnConfirmModal = $('#btnConfirmModal');
    const $successTableNumber = $('#successTableNumber');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function showCustomAlert(message) {
        const $toast = $('<div class="custom-toast"></div>').text(message);
        $('body').append($toast);
        setTimeout(() => {
            $toast.addClass('show');
        }, 10);
        setTimeout(() => {
            $toast.removeClass('show');
            setTimeout(() => $toast.remove(), 400);
        }, 3000);
    }

    $filterBtns.on('click', function () {
        const $btn = $(this);
        const filter = $btn.data('filter');
        $filterBtns.removeClass('active');
        $btn.addClass('active');
        $cards.each(function () {
            const $card = $(this);
            const category = $card.data('category');
            if (filter === 'all' || category === filter) {
                $card.show();
                setTimeout(() => {
                    $card.css({ opacity: '1', transform: 'scale(1)' });
                }, 50);
            } else {
                $card.css({ opacity: '0', transform: 'scale(0.9)' });
                setTimeout(() => $card.hide(), 400);
            }
        });
    });

    $('.drink-options-btn').on('click', function () {
        const $btn = $(this);
        const $panel = $btn.next('.options-panel');
        if (!$panel.length) return;
        const isOpen = $panel.hasClass('open');
        $('.options-panel').removeClass('open');
        $('.toggle-icon').text('▼');
        if (!isOpen) {
            $panel.addClass('open');
            $btn.find('.toggle-icon').text('▲');
        }
    });

    $('.option-item').on('click', function () {
        const $item = $(this);
        const $parentPanel = $item.closest('.options-panel');
        $parentPanel.find('.option-item').removeClass('selected');
        $item.addClass('selected');
        const $card = $item.closest('.drink-card');
        const basePrice = parseFloat($card.data('baseprice')) || 0;
        const extraPrice = parseFloat($item.data('extra')) || 0;
        const newPrice = basePrice + extraPrice;
        $card.data('currentprice', newPrice);
        $card.attr('data-currentprice', newPrice);
        $card.find('.final-price').text(` ${newPrice.toFixed(2)}`);
        const selectedName = $item.find('span:first').text();
        const category = $card.data('category');
        let prefix = 'base';
        if (category === 'gin') prefix = 'Gin';
        if (category === 'vodka') prefix = 'Vodka';
        if (category === 'rum') prefix = 'Rum';
        $card.find('.drink-options-btn span:first').text(`${prefix}: ${selectedName}`);
        $parentPanel.removeClass('open');
        $card.find('.toggle-icon').text('▼');
    });

    function updateCartUI() {
        $cartItemsContainer.empty();
        let total = 0;
        if (cart.length === 0) {
            $floatingBar.removeClass('visible expanded');
            $totalDisplay.text(' 0.00');
            return;
        }
        $floatingBar.addClass('visible');
        cart.forEach(item => {
            total += item.price;
            const $itemElement = $(`
                <div class="cart-item">
                    <div class="item-details">
                        <span class="item-name"></span>
                        <span class="item-option"></span>
                    </div>
                    <div class="item-actions">
                        <span class="item-price"></span>
                        <button class="btn-remove" type="button">X</button>
                    </div>
                </div>
            `);
            $itemElement.find('.item-name').text(item.name);
            $itemElement.find('.item-option').text(item.option);
            $itemElement.find('.item-price').text(` ${item.price.toFixed(2)}`);
            $itemElement.find('.btn-remove').data('id', item.id);
            $cartItemsContainer.append($itemElement);
        });
        $totalDisplay.text(` ${total.toFixed(2)}`);
    }

    $cartItemsContainer.on('click', '.btn-remove', function (e) {
        e.stopPropagation();
        const idToRemove = $(this).data('id');
        cart = cart.filter(item => item.id !== idToRemove);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
    });

    $cartHeader.on('click', function (e) {
        if ($(e.target).hasClass('btn-checkout') || e.target.id === 'btnCheckout') return;
        if (cart.length > 0) {
            $floatingBar.toggleClass('expanded');
        }
    });

    $('.btn-add').on('click', function () {
        const $button = $(this);
        const $card = $button.closest('.drink-card');
        
        // --- IL TUO CODICE DI VALIDAZIONE INIZIA QUI ---
        const $dropdownBtn = $card.find('.drink-options-btn');
        
        if ($dropdownBtn.length) {
            // Estraiamo il testo solo dal primo span (ignorando la freccina)
            const text = $dropdownBtn.find('span:first-child').text().trim();
            
            // Array con tutti i testi di default (non selezionati)
            const testiVuoti = ['Scegli il Gin', 'Scegli la Vodka', 'Scegli il Rum', 'Scegli la base'];
            
            if (testiVuoti.includes(text)) {
                // RICHIAMA IL MESSAGGIO DEL SITO INVECE DELL'ALERT DEL BROWSER
                showCustomAlert("Devi prima scegliere la base del drink per selezionarlo.");
                
                // Effetto visivo: fa lampeggiare di rosso il pulsante delle opzioni
                $dropdownBtn.css('border-color', '#ff4444');
                setTimeout(() => { $dropdownBtn.css('border-color', 'rgba(255, 255, 255, 0.1)'); }, 2000);
                
                return; // Blocca l'esecuzione: il drink non va nel carrello
            }
        }
        // --- IL TUO CODICE DI VALIDAZIONE FINISCE QUI ---

        const $optionsPanel = $card.find('.options-panel');
        const $selectedOption = $optionsPanel.find('.option-item.selected');
        
        const name = $card.find('.drink-name').text().trim();
        let optionText = '';
        if ($selectedOption.length > 0) {
            optionText = $selectedOption.find('span:first').text().trim();
        }
        const price =
            parseFloat($card.data('currentprice')) ||
            parseFloat($card.data('baseprice')) ||
            0;
            
        cart.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name,
            option: optionText,
            price
        });
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartUI();
        const originalText = $button.text();
        $button
            .text('Aggiunto ✓')
            .css({
                background: '#00ff88',
                color: '#0b0b0f',
                boxShadow: '0 0 20px #00ff88'
            });
        setTimeout(() => {
            $button.text(originalText).css({
                background: '',
                color: '',
                boxShadow: ''
            });
        }, 1500);
    });

   $btnCheckout.on('click', async function (e) {
        e.stopPropagation();
        if (cart.length === 0) return;

        try {
            const authData = await InfoStudioApi.getCurrentUser();

            // Controllo Accesso: se non è loggato, mostra l'alert e ferma tutto
            if (!authData.authenticated) {
                showCustomAlert("Devi effettuare l'accesso per ordinare.");
                return; 
            }

            // Se è loggato, mostra direttamente la scelta del tavolo
            $modalFormContent.show();
            $modalSuccessContent.hide();
            $tableNumberInput.val('').attr('placeholder', 'Scegli un tavolo (1-30)');
            $modalOverlay.addClass('active');
            setTimeout(() => $tableNumberInput.trigger('focus'), 100);

        } catch (error) {
            showCustomAlert("Errore di connessione. Riprova tra poco.");
        }
    });

    $btnCancelModal.on('click', function () {
        $modalOverlay.removeClass('active');
    });

   $btnConfirmModal.on('click', async function () {
        const numeroTavolo = parseInt($tableNumberInput.val(), 10);

        // 1. Controlla che il tavolo sia valido
        if (isNaN(numeroTavolo) || numeroTavolo < 1 || numeroTavolo > 30) {
            $tableNumberInput
                .val('')
                .attr('placeholder', 'Errore: solo tavoli 1-30!')
                .css('border-color', '#ff4444');

            setTimeout(() => {
                $tableNumberInput.css('border-color', 'rgba(255, 255, 255, 0.2)');
            }, 1500);

            return;
        }

        // 2. Disabilita il bottone per evitare doppi click
        $btnConfirmModal.prop('disabled', true).text('Invio...');

        try {
            // 3. Invia la richiesta al file PHP
            const response = await InfoStudioApi.request('create_order.php', {
                method: 'POST',
                data: {
                    numero_tavolo: numeroTavolo,
                    items: cart.map(({ name, option, price }) => ({
                        name,
                        option,
                        price
                    }))
                }
            });

            // Se PHP dice che c'è un errore, scatena il catch
            if (!response.success) {
                throw { responseJSON: response };
            }

            // 4. Se va tutto bene, mostra la conferma verde!
            $modalFormContent.hide();
            $successTableNumber.text(numeroTavolo);
            $modalSuccessContent.show();

            cart = [];
            localStorage.removeItem('cart');
            updateCartUI();
            $floatingBar.removeClass('expanded');

            setTimeout(() => {
                $modalOverlay.removeClass('active');
            }, 2500);

        } catch (error) {
            InfoStudioApi.logError('ordine menu', error);

            // Cattura il messaggio dal server (es. "Devi effettuare l'accesso")
            const message = InfoStudioApi.userMessage(
                error,
                'Ordine non inviato. Riprova tra poco.'
            );

            // Mostra l'errore illuminando di rosso il campo del tavolo
            $tableNumberInput
                .val('')
                .attr('placeholder', message)
                .css('border-color', '#ff4444');
                
            setTimeout(() => { $tableNumberInput.css('border-color', 'rgba(255, 255, 255, 0.2)'); }, 3000);

        } finally {
            // Alla fine riabilita sempre il bottone
            $btnConfirmModal.prop('disabled', false).text('Conferma');
        }
    });

    $modalOverlay.on('click', function (e) {
        if (e.target === this && $modalFormContent.is(':visible')) {
            $modalOverlay.removeClass('active');
        }
    });
    updateCartUI();
});