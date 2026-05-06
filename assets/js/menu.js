document.addEventListener('DOMContentLoaded', () => {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.drink-card');
    const floatingBar = document.getElementById('floatingBar');
    const totalDisplay = document.getElementById('cartTotal');
    const cartHeader = document.getElementById('cartHeader');
    const cartItemsContainer = document.getElementById('cartItemsList');
    const btnCheckout = document.getElementById('btnCheckout');

    const modalOverlay = document.getElementById('tableModal');
    const modalFormContent = document.getElementById('modalFormContent');
    const modalSuccessContent = document.getElementById('modalSuccessContent');
    const tableNumberInput = document.getElementById('tableNumberInput');
    const btnCancelModal = document.getElementById('btnCancelModal');
    const btnConfirmModal = document.getElementById('btnConfirmModal');
    const successTableNumber = document.getElementById('successTableNumber');

    let cart = [];

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const filter = btn.dataset.filter;
            
            cards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 400);
                }
            });
        });
    });

    const optionsBtns = document.querySelectorAll('.drink-options-btn');
    optionsBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const panel = btn.nextElementSibling;
            if(!panel || !panel.classList.contains('options-panel')) return;
            
            const isOpen = panel.classList.contains('open');
            
            document.querySelectorAll('.options-panel').forEach(p => p.classList.remove('open'));
            document.querySelectorAll('.toggle-icon').forEach(i => i.textContent = '▼');
            
            if (!isOpen) {
                panel.classList.add('open');
                btn.querySelector('.toggle-icon').textContent = '▲';
            }
        });
    });

    const optionItems = document.querySelectorAll('.option-item');
    optionItems.forEach(item => {
        item.addEventListener('click', function() {
            const parentPanel = this.closest('.options-panel');
            const itemsInPanel = parentPanel.querySelectorAll('.option-item');
            
            itemsInPanel.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            
            const card = this.closest('.drink-card');
            const basePrice = parseFloat(card.dataset.baseprice);
            const extraPrice = parseFloat(this.dataset.extra);
            const newPrice = basePrice + extraPrice;
            
            card.dataset.currentprice = newPrice;
            const finalPriceElement = card.querySelector('.final-price');
            finalPriceElement.textContent = `€${newPrice.toFixed(2)}`;

            const btnText = card.querySelector('.drink-options-btn span:first-child');
            const selectedName = this.querySelector('span:first-child').textContent;
            const prefix = card.dataset.category === 'gin' ? 'Gin' : 'Vodka';
            btnText.textContent = `Scegli ${prefix} (${selectedName})`;
            
            parentPanel.classList.remove('open');
            card.querySelector('.toggle-icon').textContent = '▼';
        });
    });

    function updateCartUI() {
        cartItemsContainer.innerHTML = '';
        let total = 0;
        
        if (cart.length === 0) {
            floatingBar.classList.remove('visible');
            floatingBar.classList.remove('expanded');
            return;
        }

        floatingBar.classList.add('visible');

        cart.forEach(item => {
            total += item.price;
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.innerHTML = `
                <div class="item-details">
                    <span class="item-name">${item.name}</span>
                    <span class="item-option">${item.option}</span>
                </div>
                <div class="item-actions">
                    <span class="item-price">€${item.price.toFixed(2)}</span>
                    <button class="btn-remove" data-id="${item.id}">X</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });

        totalDisplay.textContent = `€${total.toFixed(2)}`;

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const idToRemove = parseInt(this.dataset.id);
                cart = cart.filter(item => item.id !== idToRemove);
                updateCartUI();
            });
        });
    }

    cartHeader.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-checkout') || e.target.id === 'btnCheckout') return;
        if (cart.length > 0) {
            floatingBar.classList.toggle('expanded');
        }
    });

    const addBtns = document.querySelectorAll('.btn-add');
    addBtns.forEach(btn => {
        btn.addEventListener('click', function() {

           const dropdownBtn = this.closest('.drink-card').querySelector('.drink-options-btn');
        
        if (dropdownBtn) {
            const textSpan = dropdownBtn.querySelector('span:first-child');
            const text = textSpan ? textSpan.textContent.trim() : '';
            
            // Array con tutti i testi di default (non selezionati)
            const testiVuoti = ['Scegli il Gin', 'Scegli la Vodka', 'Scegli il Rum', 'Scegli la base'];
            
            if (testiVuoti.includes(text)) {
                
                // RICHIAMA IL MESSAGGIO DEL SITO INVECE DELL'ALERT DEL BROWSER
                showCustomAlert("Devi prima scegliere la base del drink per selezionarlo.");
                
                // Effetto visivo: fa lampeggiare di rosso il pulsante delle opzioni
                dropdownBtn.style.borderColor = "#ff4444";
                setTimeout(() => { dropdownBtn.style.borderColor = "rgba(255, 255, 255, 0.1)"; }, 2000);
                
                return; // Blocca l'esecuzione: il drink non va nel carrello
            }
        }

            const card = this.closest('.drink-card');
            const name = card.querySelector('.drink-name').textContent;
            const optionBtn = card.querySelector('.drink-options-btn span:first-child');
            const optionText = optionBtn ? optionBtn.textContent : '';
            const price = parseFloat(card.dataset.currentprice);

            cart.push({
                id: Date.now() + Math.floor(Math.random() * 1000),
                name: name,
                option: optionText !== '-' ? optionText : '',
                price: price
            });

            updateCartUI();

            const originalText = this.textContent;
            this.textContent = 'Aggiunto ✓';
            this.style.background = '#00ff88';
            this.style.color = '#0b0b0f';
            this.style.boxShadow = '0 0 20px #00ff88';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
                this.style.color = '';
                this.style.boxShadow = '';
            }, 1500);
        });
    });

    btnCheckout.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cart.length === 0) return;
        
        modalFormContent.style.display = 'block';
        modalSuccessContent.style.display = 'none';
        tableNumberInput.value = '';
        tableNumberInput.placeholder = 'Scegli un tavolo (1-30)';
        tableNumberInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        modalOverlay.classList.add('active');
        setTimeout(() => tableNumberInput.focus(), 100);
    });

    btnCancelModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    btnConfirmModal.addEventListener('click', () => {
        const numeroTavoloVal = tableNumberInput.value;
        const numeroTavolo = parseInt(numeroTavoloVal, 10);
        
        if (!isNaN(numeroTavolo) && numeroTavolo >= 1 && numeroTavolo <= 30) {
            modalFormContent.style.display = 'none';
            successTableNumber.textContent = numeroTavolo;
            modalSuccessContent.style.display = 'block';
            
            cart = [];
            updateCartUI();
            floatingBar.classList.remove('expanded');

            setTimeout(() => {
                modalOverlay.classList.remove('active');
            }, 2500);
        } else {
            tableNumberInput.value = '';
            tableNumberInput.placeholder = 'Errore: solo tavoli 1-30!';
            tableNumberInput.style.borderColor = '#ff4444';
            setTimeout(() => {
                tableNumberInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }, 1500);
        }
    });

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay && modalFormContent.style.display === 'block') {
            modalOverlay.classList.remove('active');
        }
    });

    // Funzione per mostrare il messaggio personalizzato del sito
function showCustomAlert(message) {
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Fa scendere il messaggio (aggiunge la classe .show)
    setTimeout(() => { toast.classList.add('show'); }, 10);

    // Dopo 3 secondi lo fa risalire e lo elimina dal codice
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); // Aspetta che finisca l'animazione
    }, 3000);
}
});
