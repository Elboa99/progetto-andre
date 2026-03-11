/**
 * Script frontend per sovrascrivere dinamicamente i testi della Landing Page
 * con quelli impostati dall'admin in Firebase (Impostazioni > Promo Landing).
 */

document.addEventListener('DOMContentLoaded', () => {
    // Aspetto che Firebase sia pronto
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            fetchAndApplyPromo();
        }
    }, 100);
});

async function fetchAndApplyPromo() {
    try {
        const docRef = db.collection('settings').doc('landing_promo');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();

            // Se ci sono valori, sostituiamo l'HTML
            if (data.title && data.title.trim() !== '') {
                // Sostituiamo completamente l'H1 che di default ha gli span multilingua
                // Con la stringa che ha inserito l'admin (non sarà tradotta in automatico)
                const h1 = document.querySelector('.landing-hero .text-reveal');
                if (h1) {
                    h1.innerHTML = `<span class="word gold-word" style="--i:0">${data.title}</span>`;
                }
            }

            if (data.subtitle && data.subtitle.trim() !== '') {
                // Sostituiamo il P subtitle
                const p = document.querySelector('.landing-hero p.reveal');
                if (p) {
                    // Rimuove l'attributo di traduzione per evitare che main.js lo sovrascriva
                    // se l'utente cambia lingua dopo il caricamento
                    p.removeAttribute('data-i18n');
                    p.innerHTML = data.subtitle;
                }
            }

            if (data.buttonText && data.buttonText.trim() !== '') {
                // Sostituiamo il tasto CTA
                const btn = document.querySelector('.landing-hero .btn-primary');
                if (btn) {
                    btn.removeAttribute('data-i18n');
                    // Tieni l'icona della freccia
                    btn.innerHTML = `${data.buttonText} <span class="arrow">→</span>`;
                }
            }
        }
    } catch (error) {
        console.error("Errore caricamento promo landing:", error);
    }
}
