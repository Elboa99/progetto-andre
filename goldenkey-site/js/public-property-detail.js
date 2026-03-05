/**
 * Pagina pubblica "Dettaglio Immobile" — Caricato da Firestore tramite ?id= nell'URL
 */

document.addEventListener('DOMContentLoaded', () => {
    const checkReady = setInterval(() => {
        if (typeof db !== 'undefined') {
            clearInterval(checkReady);
            loadPropertyDetail();
        }
    }, 100);
});

async function loadPropertyDetail() {
    // Leggi l'ID dall'URL
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('id');

    if (!propertyId) {
        document.body.innerHTML = '<div style="text-align:center; padding: 200px 20px;"><h1>Immobile non trovato</h1><p><a href="properties.html">Torna alla lista</a></p></div>';
        return;
    }

    try {
        const doc = await db.collection("properties").doc(propertyId).get();

        if (!doc.exists) {
            document.body.innerHTML = '<div style="text-align:center; padding: 200px 20px;"><h1>Immobile non trovato</h1><p><a href="properties.html">Torna alla lista</a></p></div>';
            return;
        }

        const d = doc.data();

        // Set cover image as hero background
        const headerEl = document.querySelector('.pd-header');
        const coverImg = d.coverImage || d.images?.[0];
        if (headerEl && coverImg) {
            headerEl.style.backgroundImage = `url('${coverImg}')`;
        }

        // Popola HEADER
        const titleEl = document.getElementById('pdTitle');
        const zoneEl = document.getElementById('pdZone');
        const priceEl = document.getElementById('pdPrice');
        const specsBarEl = document.getElementById('pdSpecsBar');

        if (titleEl) {
            titleEl.removeAttribute('data-i18n');
            titleEl.innerHTML = d.title || 'Immobile';
        }
        if (zoneEl) {
            // Also find the text span if it has data-i18n, or just remove from the parent if present
            zoneEl.removeAttribute('data-i18n');
            // The zone element has a span with data-i18n inside it originally. Overwriting innerHTML removes it anyway.
            zoneEl.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${d.location || ''}`;
        }
        if (priceEl) {
            priceEl.removeAttribute('data-i18n');
            priceEl.innerHTML = `€ ${d.price || '—'} <span data-i18n="pd-price-per-night">/ Notte</span>`;
        }

        if (specsBarEl) {
            const beds = d.specs?.beds || 0;
            const baths = d.specs?.baths || 0;
            const rooms = d.specs?.rooms || 0;
            const area = d.specs?.area || 0;
            specsBarEl.innerHTML = `
                <div class="pd-spec"><i class="fa-solid fa-user-group"></i> ${beds} <span data-i18n="pd-spec-beds">Posti Letto</span></div>
                <div class="pd-spec"><i class="fa-solid fa-bath"></i> ${baths} <span data-i18n="pd-spec-baths">Bagni</span></div>
                <div class="pd-spec"><i class="fa-solid fa-bed"></i> ${rooms} <span data-i18n="pd-spec-rooms">Camere</span></div>
                <div class="pd-spec"><i class="fa-solid fa-ruler-combined"></i> ${area} <span data-i18n="pd-spec-area">Mq</span></div>
            `;
        }

        // Popola title del documento
        document.title = `${d.title || 'Immobile'} — GoldenKey`;

        // Popola GALLERIA IMMAGINI (Swiper)
        const swiperWrapper = document.getElementById('pdSwiperWrapper');
        if (swiperWrapper && d.images && d.images.length > 0) {
            swiperWrapper.innerHTML = '';
            d.images.forEach((url, i) => {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<img src="${url}" alt="Foto ${i + 1}" onerror="this.src='https://via.placeholder.com/1400x550/1b3a1b/c9a227?text=GoldenKey'">`;
                swiperWrapper.appendChild(slide);
            });

            // Photo Counter
            const counterEl = document.getElementById('pdPhotoCounter');
            const counterCurrent = document.getElementById('pdCounterCurrent');
            const counterTotal = document.getElementById('pdCounterTotal');
            if (counterEl) {
                counterTotal.textContent = d.images.length;
                counterCurrent.textContent = '1';
                counterEl.style.display = 'block';
            }

            // Inizializza Swiper dopo aver aggiunto le immagini
            const pdSwiper = new Swiper('.pd-swiper', {
                loop: d.images.length > 1,
                navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                pagination: { el: '.swiper-pagination', clickable: true },
                autoplay: { delay: 4000, disableOnInteraction: false }
            });

            // Update counter on slide change
            pdSwiper.on('slideChange', () => {
                if (counterCurrent) {
                    counterCurrent.textContent = pdSwiper.realIndex + 1;
                }
            });

            // ---------- LIGHTBOX ----------
            const lightbox = document.getElementById('pdLightbox');
            const lightboxImg = document.getElementById('pdLightboxImg');
            const lightboxCounter = document.getElementById('pdLightboxCounter');
            const allImages = d.images;
            let lightboxIndex = 0;

            function openLightbox(index) {
                lightboxIndex = index;
                lightboxImg.src = allImages[lightboxIndex];
                lightboxCounter.textContent = `${lightboxIndex + 1} / ${allImages.length}`;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }

            function lightboxNav(dir) {
                lightboxIndex = (lightboxIndex + dir + allImages.length) % allImages.length;
                lightboxImg.src = allImages[lightboxIndex];
                lightboxImg.style.animation = 'none';
                lightboxImg.offsetHeight; // trigger reflow
                lightboxImg.style.animation = '';
                lightboxCounter.textContent = `${lightboxIndex + 1} / ${allImages.length}`;
            }

            // Click on slide to open lightbox
            document.querySelectorAll('.pd-swiper .swiper-slide').forEach((slide) => {
                slide.addEventListener('click', () => {
                    openLightbox(pdSwiper.realIndex);
                });
            });

            // Lightbox controls
            document.getElementById('pdLightboxClose').addEventListener('click', closeLightbox);
            document.getElementById('pdLightboxPrev').addEventListener('click', () => lightboxNav(-1));
            document.getElementById('pdLightboxNext').addEventListener('click', () => lightboxNav(1));

            // Click on backdrop to close
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) closeLightbox();
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') lightboxNav(-1);
                if (e.key === 'ArrowRight') lightboxNav(1);
            });
        }

        // Popola DETTAGLI
        const detailsList = document.getElementById('pdDetailsList');
        if (detailsList) {
            const beds = d.specs?.beds || 0;
            const rooms = d.specs?.rooms || 0;
            const baths = d.specs?.baths || 0;
            const area = d.specs?.area || 0;
            const energyClass = d.energy?.class || 'ND';
            const ipe = d.energy?.ipe || 'ND';

            detailsList.innerHTML = `
                <li><i class="fa-solid fa-user-group"></i> <span data-i18n="pd-detail-beds">Posti letto:</span> <strong>${beds}</strong></li>
                <li><i class="fa-solid fa-bed"></i> <span data-i18n="pd-detail-rooms">Camere:</span> <strong>${rooms}</strong></li>
                <li><i class="fa-solid fa-bath"></i> <span data-i18n="pd-detail-baths">Bagni:</span> <strong>${baths}</strong></li>
                <li><i class="fa-solid fa-ruler-combined"></i> <span data-i18n="pd-detail-area">Metri Quadri:</span> <strong>${area} mq</strong></li>
                <li><i class="fa-solid fa-leaf"></i> <span data-i18n="pd-detail-energy">Classe Energetica:</span> <strong>${energyClass}</strong></li>
                <li><i class="fa-solid fa-bolt"></i> <span data-i18n="pd-detail-ipe">IPE:</span> <strong>${ipe || 'ND'}</strong></li>
            `;
        }

        // Popola DESCRIZIONE
        const descEl = document.getElementById('pdDescription');
        if (descEl) {
            let descToUse = '';
            const currentLang = localStorage.getItem('gk_language') || 'it';

            if (typeof d.description === 'object' && d.description !== null) {
                // Prendi la traduzione per la lingua corrente, fallback su IT se mancante
                descToUse = d.description[currentLang] || d.description['it'] || '';
            } else {
                // Retrocompatibilità
                descToUse = d.description || '';
            }

            const paragraphs = descToUse ? descToUse.split('\n') : [`<span data-i18n="pd-no-desc">Nessuna descrizione disponibile.</span>`];
            descEl.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
        }

        // Popola SERVIZI
        const servicesList = document.getElementById('pdServicesList');
        if (servicesList && d.services && d.services.length > 0) {
            servicesList.innerHTML = '';
            d.services.forEach(s => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-check"></i> ${s}`;
                servicesList.appendChild(li);
            });
        } else if (servicesList) {
            servicesList.innerHTML = '<li><span data-i18n="pd-no-services">Nessun servizio specificato</span></li>';
        }

        // Popola VIDEO (se c'è)
        const videoSection = document.getElementById('pdVideoSection');
        const videoContainer = document.getElementById('pdVideoContainer');
        if (d.videoTour && videoContainer && videoSection) {
            const videoUrl = d.videoTour;
            // Controlla se è un link YouTube/Vimeo o un file diretto
            if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
                // Estrai ID del video YouTube
                let ytId = '';
                if (videoUrl.includes('watch?v=')) {
                    ytId = videoUrl.split('watch?v=')[1].split('&')[0];
                } else if (videoUrl.includes('youtu.be/')) {
                    ytId = videoUrl.split('youtu.be/')[1].split('?')[0];
                }
                videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${ytId}?controls=1&rel=0" frameborder="0" allowfullscreen></iframe>`;
            } else if (videoUrl.includes('vimeo.com')) {
                const vimeoId = videoUrl.split('/').pop();
                videoContainer.innerHTML = `<iframe src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allowfullscreen></iframe>`;
            } else {
                // File video diretto (es. da Firebase Storage)
                videoContainer.innerHTML = `<video controls preload="none" style="width:100%; height:100%; object-fit:cover;"><source src="${videoUrl}" type="video/mp4"><span data-i18n="pd-video-error">Il tuo browser non supporta il video.</span></video>`;
            }
        } else if (videoSection) {
            // Nascondi la sezione video se non c'è nessun video
            videoSection.style.display = 'none';
        }

        // --- FIXED: Apply Translations to dynamically injected tags
        if (typeof setLanguage === 'function') {
            const currentLang = localStorage.getItem('gk_language') || 'it';
            setLanguage(currentLang);
        }

        // Aggiorna link WhatsApp con titolo della proprietà
        const waLink = document.getElementById('pdWhatsappLink');
        if (waLink) {
            const encodedTitle = encodeURIComponent(d.title || 'Immobile');
            waLink.href = `https://wa.me/393883030552?text=Salve,%20vorrei%20info%20su%20"${encodedTitle}"`;
        }

        // --- GLOBAL HOOK PER CAMBIO LINGUA DINAMICO DELLA DESCRIZIONE ---
        window.updatePropertyDescriptionLanguage = function (lang) {
            const descriptionContainer = document.getElementById('pdDescription');
            if (descriptionContainer && d.description) {
                let descToUse = '';
                if (typeof d.description === 'object' && d.description !== null) {
                    descToUse = d.description[lang] || d.description['it'] || '';
                } else {
                    descToUse = d.description || '';
                }
                const newParagraphs = descToUse ? descToUse.split('\n') : [`<span data-i18n="pd-no-desc">Nessuna descrizione disponibile.</span>`];
                descriptionContainer.innerHTML = newParagraphs.map(p => `<p>${p}</p>`).join('');
            }
        };

    } catch (error) {
        console.error("Errore caricamento dettaglio immobile:", error);
    } finally {
        if (typeof setLanguage === 'function') setLanguage(localStorage.getItem('gk_language') || 'it');
    }
}

