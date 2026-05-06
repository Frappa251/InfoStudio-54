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

    let cart = [];

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
        const basePrice = parseFloat($card.data('baseprice'));
        const extraPrice = parseFloat($item.data('extra'));
        const newPrice = basePrice + extraPrice;

        $card.data('currentprice', newPrice);
        $card.attr('data-currentprice', newPrice);
        $card.find('.final-price').text(`€${newPrice.toFixed(2)}`);

        const selectedName = $item.find('span:first').text();
        const prefix = $card.data('category') === 'gin' ? 'Gin' : 'Vodka';
        $card.find('.drink-options-btn span:first').text(`Scegli ${prefix} (${selectedName})`);

        $parentPanel.removeClass('open');
        $card.find('.toggle-icon').text('▼');
    });

    function updateCartUI() {
        $cartItemsContainer.empty();
        let total = 0;

        if (cart.length === 0) {
            $floatingBar.removeClass('visible expanded');
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
            $itemElement.find('.item-price').text(`€${item.price.toFixed(2)}`);
            $itemElement.find('.btn-remove').data('id', item.id);
            $cartItemsContainer.append($itemElement);
        });

        $totalDisplay.text(`€${total.toFixed(2)}`);
    }

    $cartItemsContainer.on('click', '.btn-remove', function (e) {
        e.stopPropagation();
        const idToRemove = $(this).data('id');
        cart = cart.filter(item => item.id !== idToRemove);
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
        const name = $card.find('.drink-name').text();
        const optionText = $card.find('.drink-options-btn span:first').text() || '';
        const price = parseFloat($card.data('currentprice'));

        cart.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            name,
            option: optionText !== '-' ? optionText : '',
            price
        });

        updateCartUI();

        const originalText = $button.text();
        $button
            .text('Aggiunto ✓')
            .css({ background: '#00ff88', color: '#0b0b0f', boxShadow: '0 0 20px #00ff88' });

        setTimeout(() => {
            $button.text(originalText).css({ background: '', color: '', boxShadow: '' });
        }, 1500);
    });

    $btnCheckout.on('click', function (e) {
        e.stopPropagation();
        if (cart.length === 0) return;

        $modalFormContent.show();
        $modalSuccessContent.hide();
        $tableNumberInput
            .val('')
            .attr('placeholder', 'Scegli un tavolo (1-30)')
            .css('border-color', 'rgba(255, 255, 255, 0.2)');
        $modalOverlay.addClass('active');
        setTimeout(() => $tableNumberInput.trigger('focus'), 100);
    });

    $btnCancelModal.on('click', function () {
        $modalOverlay.removeClass('active');
    });

    $btnConfirmModal.on('click', async function () {
        const numeroTavolo = parseInt($tableNumberInput.val(), 10);

        if (isNaN(numeroTavolo) || numeroTavolo < 1 || numeroTavolo > 30) {
            $tableNumberInput
                .val('')
                .attr('placeholder', 'Errore: solo tavoli 1-30!')
                .css('border-color', '#ff4444');
            setTimeout(() => $tableNumberInput.css('border-color', 'rgba(255, 255, 255, 0.2)'), 1500);
            return;
        }

        $btnConfirmModal.prop('disabled', true).text('Invio...');

        try {
            const response = await InfoStudioApi.request('create_order.php', {
                method: 'POST',
                data: {
                    numero_tavolo: numeroTavolo,
                    items: cart.map(({ name, option, price }) => ({ name, option, price }))
                }
            });

            if (!response.success) {
                throw { responseJSON: response };
            }

            $modalFormContent.hide();
            $successTableNumber.text(numeroTavolo);
            $modalSuccessContent.show();

            cart = [];
            updateCartUI();
            $floatingBar.removeClass('expanded');

            setTimeout(() => $modalOverlay.removeClass('active'), 2500);
        } catch (error) {
            InfoStudioApi.logError('ordine menu', error);
            const message = InfoStudioApi.userMessage(error, 'Ordine non inviato. Riprova tra poco.');
            $tableNumberInput.val('').attr('placeholder', message).css('border-color', '#ff4444');
        } finally {
            $btnConfirmModal.prop('disabled', false).text('Conferma Ordine');
        }
    });

    $modalOverlay.on('click', function (e) {
        if (e.target === this && $modalFormContent.is(':visible')) {
            $modalOverlay.removeClass('active');
        }
    });
});
