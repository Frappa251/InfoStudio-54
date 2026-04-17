document.addEventListener('DOMContentLoaded', () => {
    // --- ANIMAZIONE LOGO NEON ---
    const logoParts = document.querySelectorAll('.logo-neon span');
    
    if (logoParts.length > 0) {
        const randomFlicker = () => {
            const part = logoParts[Math.floor(Math.random() * logoParts.length)];
            part.classList.add('flicker');
            
            // Durata dello sfarfallio ridotta (stacca prima l'effetto)
            setTimeout(() => {
                part.classList.remove('flicker');
            }, Math.random() * 130 + 20); 
            
            setTimeout(randomFlicker, Math.random() * 200 + 100); 
        };

        randomFlicker();
    }
});