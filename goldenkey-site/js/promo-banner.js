/**
 * Promo Banner - Lettura in tempo reale
 * Mostra in cima alla pagina il banner annunci se è stato attivato dall'Admin
 */

document.addEventListener('DOMContentLoaded', () => {
    // Agganciamo l'inizializzazione appena firebase è caricato
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            initPromoBanner();
        }
    }, 100);
});

async function initPromoBanner() {
    try {
        const docRef = db.collection('settings').doc('home_banner');
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const data = docSnap.data();

            // Verifica se deve essere mostrato
            if (data.isActive && data.text) {
                drawBanner(data);
            }
        }
    } catch (error) {
        console.error("Promo banner non riuscito a caricare", error);
    }
}

function drawBanner(data) {
    // Creiamo il div del banner
    const banner = document.createElement('div');
    banner.id = 'gk-promo-banner';

    // Costruiamo gli stili inline + animazione base
    banner.style.cssText = `
        background: linear-gradient(90deg, var(--color-primary), #1a361a);
        color: #fff;
        text-align: center;
        padding: 12px 20px;
        font-family: var(--font-body);
        font-size: 0.95rem;
        position: relative;
        z-index: 9999;
        width: 100%;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 15px;
        animation: slideDownBanner 0.5s ease-out forwards;
        transform: translateY(-100%);
    `;

    // Aggiungo la keyframe al volo in head se non c'è
    if (!document.getElementById('promo-banner-style')) {
        const style = document.createElement('style');
        style.id = 'promo-banner-style';
        style.innerHTML = `
            @keyframes slideDownBanner {
                to { transform: translateY(0); }
            }
            .gk-promo-btn {
                background: var(--color-accent);
                color: #000;
                padding: 4px 12px;
                border-radius: 20px;
                font-weight: 600;
                font-size: 0.85rem;
                text-decoration: none;
                transition: transform 0.2s, background 0.2s;
            }
            .gk-promo-btn:hover {
                transform: scale(1.05);
                background: #cba85a;
            }
            .gk-promo-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                position: absolute;
                right: 20px;
                opacity: 0.7;
            }
            .gk-promo-close:hover { opacity: 1; }
            @media (max-width: 768px) {
                #gk-promo-banner {
                    flex-direction: column;
                    gap: 8px;
                    padding: 15px;
                    font-size: 0.85rem;
                }
                .gk-promo-close { right: 10px; top: 10px;}
            }
        `;
        document.head.appendChild(style);
    }

    let linkHTML = '';
    if (data.link && data.linkText) {
        linkHTML = `<a href="${data.link}" class="gk-promo-btn">${data.linkText}</a>`;
    }

    banner.innerHTML = `
        <span style="flex-grow:0; font-weight: 500;">${data.text}</span>
        ${linkHTML}
        <button class="gk-promo-close" aria-label="Chiudi annuncio">&times;</button>
    `;

    // Lo iniettiamo come primissimo figlio del tag HTML body (Sopra la nav)
    document.body.insertBefore(banner, document.body.firstChild);

    // Fixiamo l'header se era sticky / fixed assicurandoci che il padding body sia corretto
    // Non strettamente necessario se la navbar non è absolute top-0. Verifichiamo il CSS in uso.
    const navbar = document.querySelector('.navbar');
    if (navbar && getComputedStyle(navbar).position !== 'static') {
        const bannerHeight = banner.offsetHeight;
        navbar.style.top = `${bannerHeight}px`;
    }

    // Gestione chiusura della X
    banner.querySelector('.gk-promo-close').addEventListener('click', () => {
        banner.style.transition = 'transform 0.4s ease-out';
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            banner.remove();
            if (navbar && navbar.style.top) {
                navbar.style.transition = 'top 0.3s ease-out';
                navbar.style.top = '0';
            }
        }, 400); // Wait for transition
    });
}
