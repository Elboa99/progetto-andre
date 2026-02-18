/**
 * Golden Key - Luxury Short Rent
 * Main JavaScript — Elite Edition
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    initNavbar();
    initParallax();
    initScrollAnimations();
    initVideoFallback();
    initCookieBanner();
    initFormValidation();
    initContactSlideshow();
    initReviewsCarousel();
    initCtaSlideshow();
    initHeroVideoRotation();
    initLanguage();
    initBackToTop();
    initGallery();
});

/**
 * Back to Top Button — Show/Hide logic and smooth scroll
 */
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > window.innerHeight) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}


/**
 * Internationalization (i18n) — Multi-language support (IT/EN)
 */
function initLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    const savedLang = localStorage.getItem('gk_language') || 'it';

    // Initial translation
    setLanguage(savedLang);

    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            setLanguage(lang);

            // Re-initialize animations if needed (some text changes might break reveal effects)
            if (typeof ScrollReveal !== 'undefined') {
                ScrollReveal().sync();
            }
        });
    });
}

function setLanguage(lang) {
    if (!window.translations || !window.translations[lang]) return;

    const t = window.translations[lang];
    localStorage.setItem('gk_language', lang);
    document.documentElement.lang = lang;

    // Update buttons UI
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.dataset.i18nPlaceholder;
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
}


/**
 * Navbar — scroll transparency + mobile hamburger toggle
 */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const toggle = document.querySelector('.nav-toggle');
    const links = document.querySelector('.nav-links');

    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 100);
        });
    }

    // Mobile: toggle hamburger menu
    if (toggle && links) {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            links.classList.toggle('open');
        });

        // Close menu on link click
        links.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                toggle.classList.remove('active');
                links.classList.remove('open');
            });
        });
    }
}

/**
 * Smooth Parallax for Hero Background
 */
function initParallax() {
    window.addEventListener('scroll', () => {
        const heroBg = document.querySelector('.hero-bg');
        if (heroBg) {
            const scroll = window.pageYOffset;
            heroBg.style.transform = `translateY(${scroll * 0.3}px)`;
        }
    });
}

/**
 * Reveal Animations on Scroll (Intersection Observer)
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Video Fallback — Hide fallback image once video plays
 */
function initVideoFallback() {
    const videos = document.querySelectorAll('.hero-video');
    const fallback = document.querySelector('.hero-fallback');

    if (videos.length > 0 && fallback) {
        videos.forEach(video => {
            video.addEventListener('playing', () => {
                fallback.style.opacity = '0';
                setTimeout(() => {
                    fallback.style.display = 'none';
                }, 500);
            });
        });
    }
}

/**
 * Cookie Banner — show/hide based on localStorage preference
 * Supports granular cookie category management (GDPR compliant)
 */
function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');
    const manageBtn = document.getElementById('cookieManage');
    const prefsPanel = document.getElementById('cookiePreferences');
    const saveBtn = document.getElementById('cookieSave');
    const analyticsToggle = document.getElementById('cookieAnalytics');
    const marketingToggle = document.getElementById('cookieMarketing');

    if (!banner) return;

    // Check if user already made a choice
    const cookieChoice = localStorage.getItem('gk_cookie_consent');

    if (!cookieChoice) {
        // Show banner after a short delay
        setTimeout(() => {
            banner.classList.add('visible');
        }, 1500);
    } else {
        // Load saved preferences into toggles
        const prefs = JSON.parse(localStorage.getItem('gk_cookie_prefs') || '{}');
        if (analyticsToggle) analyticsToggle.checked = prefs.analytics || false;
        if (marketingToggle) marketingToggle.checked = prefs.marketing || false;
    }

    // Accept All
    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('gk_cookie_consent', 'accepted');
            localStorage.setItem('gk_cookie_prefs', JSON.stringify({
                analytics: true,
                marketing: true
            }));
            banner.classList.remove('visible');
        });
    }

    // Reject All
    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('gk_cookie_consent', 'rejected');
            localStorage.setItem('gk_cookie_prefs', JSON.stringify({
                analytics: false,
                marketing: false
            }));
            banner.classList.remove('visible');
        });
    }

    // Toggle Manage Preferences panel
    if (manageBtn && prefsPanel) {
        manageBtn.addEventListener('click', () => {
            prefsPanel.classList.toggle('open');
        });
    }

    // Save Preferences
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const prefs = {
                analytics: analyticsToggle ? analyticsToggle.checked : false,
                marketing: marketingToggle ? marketingToggle.checked : false
            };
            localStorage.setItem('gk_cookie_consent', 'custom');
            localStorage.setItem('gk_cookie_prefs', JSON.stringify(prefs));
            banner.classList.remove('visible');
            if (prefsPanel) prefsPanel.classList.remove('open');
        });
    }

    // Footer "Gestisci Cookie" link — re-opens banner with preferences
    const footerCookieLink = document.getElementById('openCookiePrefs');
    if (footerCookieLink) {
        footerCookieLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Load saved preferences into toggles
            const prefs = JSON.parse(localStorage.getItem('gk_cookie_prefs') || '{}');
            if (analyticsToggle) analyticsToggle.checked = prefs.analytics || false;
            if (marketingToggle) marketingToggle.checked = prefs.marketing || false;
            banner.classList.add('visible');
            if (prefsPanel) prefsPanel.classList.add('open');
        });
    }
}

/**
 * UTM Parameter Capture — Tracks ad campaign source for every contact
 * Works with Google Ads, Meta Ads, TikTok Ads, etc.
 */
function getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};

    // Standard UTM parameters
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    utmKeys.forEach(key => {
        const val = params.get(key);
        if (val) utm[key] = val;
    });

    // Google Ads click ID
    const gclid = params.get('gclid');
    if (gclid) utm.gclid = gclid;

    // Meta/Facebook Ads click ID
    const fbclid = params.get('fbclid');
    if (fbclid) utm.fbclid = fbclid;

    // Referrer (fallback if no UTM)
    if (Object.keys(utm).length === 0 && document.referrer) {
        try {
            const ref = new URL(document.referrer);
            if (ref.hostname !== window.location.hostname) {
                utm.referrer = ref.hostname;
            }
        } catch (e) { /* ignore invalid referrers */ }
    }

    return Object.keys(utm).length > 0 ? utm : null;
}

/**
 * Form Submission — Validates and sends data to Firebase Firestore
 */
function initFormValidation() {
    const form = document.querySelector('.contact-form-box form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get current language and translations
        const currentLang = localStorage.getItem('gk_language') || 'it';
        const t = window.translations ? window.translations[currentLang] : null;

        const consent = document.getElementById('gdpr-consent');
        if (consent && !consent.checked) {
            consent.focus();
            const msg = t ? t['form-error-consent'] : 'Per favore, accetta la Privacy Policy prima di inviare il modulo.';
            showFormFeedback(form, 'error', msg);
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;

        const loadingMsg = t ? t['form-btn-loading'] : 'Invio in corso...';
        submitBtn.innerHTML = `<span class="btn-loading">${loadingMsg}</span>`;

        try {
            // Check if Firebase is available
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                throw new Error('Firebase non configurato. Controlla js/firebase-config.js');
            }

            const now = new Date();
            const formData = {
                name: form.querySelector('#name')?.value || '',
                email: form.querySelector('#email')?.value || '',
                phone: form.querySelector('#phone')?.value || '',
                message: form.querySelector('#message')?.value || '',
                source: document.body.classList.contains('landing-page') ? 'landing' : 'index',
                gdprConsent: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'new'
            };

            // Attach UTM / Ad tracking data if present
            const utmData = getUTMParams();
            if (utmData) {
                formData.utm = utmData;
            }

            // Save to Firestore
            const firestorePromise = firebase.firestore().collection('contacts').add(formData);

            // Send email notification via EmailJS (non-blocking)
            let emailPromise = Promise.resolve();
            if (typeof emailjs !== 'undefined' && typeof EMAILJS_SERVICE_ID !== 'undefined'
                && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID') {
                emailPromise = emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message || '(nessun messaggio)',
                    source: formData.source,
                    date: now.toLocaleDateString('it-IT') + ' ' + now.toLocaleTimeString('it-IT')
                }).catch(err => console.warn('EmailJS warning:', err));
            }

            // Wait for both to complete
            await Promise.all([firestorePromise, emailPromise]);

            form.reset();
            const successMsg = t ? t['form-success'] : '✓ Richiesta inviata con successo!';
            showFormFeedback(form, 'success', successMsg);

        } catch (error) {
            console.error('Errore invio form:', error);
            const errorMsg = t ? t['form-error-generic'] : 'Si è verificato un errore. Riprova più tardi.';
            showFormFeedback(form, 'error', errorMsg);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    });
}

/**
 * Show feedback message after form submission
 */
function showFormFeedback(form, type, message) {
    // Remove any existing feedback
    const existing = form.parentElement.querySelector('.form-feedback');
    if (existing) existing.remove();

    const feedback = document.createElement('div');
    feedback.className = `form-feedback form-feedback-${type}`;
    feedback.textContent = message;
    form.parentElement.appendChild(feedback);

    // Auto-remove after 6 seconds
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 500);
    }, 6000);
}

/**
 * Contact Slideshow — cycle through images
 */
function initContactSlideshow() {
    const images = document.querySelectorAll('.contact-slideshow-img');
    if (images.length === 0) return;

    let currentIndex = 0;
    const interval = 5000; // 5 seconds per image

    setInterval(() => {
        // Remove active class from current image
        images[currentIndex].classList.remove('active');

        // Move to next index
        currentIndex = (currentIndex + 1) % images.length;

        // Add active class to new image
        images[currentIndex].classList.add('active');
    }, interval);
}

/**
 * Reviews Carousel — horizontal scroll with arrows and dots
 */
function initReviewsCarousel() {
    const track = document.querySelector('.carousel-track');
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.getElementById('carouselDots');

    if (!track || slides.length === 0) return;

    let currentPage = 0;

    function getVisibleCount() {
        const width = window.innerWidth;
        if (width <= 600) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    function getTotalPages() {
        return Math.ceil(slides.length / getVisibleCount());
    }

    function buildDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        const totalPages = getTotalPages();
        for (let i = 0; i < totalPages; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (i === currentPage) dot.classList.add('active');
            dot.setAttribute('aria-label', `Pagina ${i + 1}`);
            dot.addEventListener('click', () => goToPage(i));
            dotsContainer.appendChild(dot);
        }
    }

    function updateDots() {
        if (!dotsContainer) return;
        dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === currentPage);
        });
    }

    function goToPage(page) {
        const totalPages = getTotalPages();
        currentPage = Math.max(0, Math.min(page, totalPages - 1));

        const slideEl = slides[0];
        const slideWidth = slideEl.offsetWidth;
        const gap = parseFloat(getComputedStyle(track).gap) || 24;
        const visibleCount = getVisibleCount();

        const offset = currentPage * visibleCount * (slideWidth + gap);
        track.style.transform = `translateX(-${offset}px)`;

        updateDots();
        updateArrows();
    }

    function updateArrows() {
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage >= getTotalPages() - 1;
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => goToPage(currentPage + 1));
    }

    // Auto-advance every 6 seconds
    setInterval(() => {
        const totalPages = getTotalPages();
        const nextPage = (currentPage + 1) % totalPages;
        goToPage(nextPage);
    }, 6000);

    // Rebuild on resize
    window.addEventListener('resize', () => {
        buildDots();
        goToPage(Math.min(currentPage, getTotalPages() - 1));
    });

    // Re-init Lucide for new icons (carousel arrows)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    buildDots();
    updateArrows();
}

/**
 * CTA Slideshow — cycle through background images in the intermediate CTA section
 */
function initCtaSlideshow() {
    const slides = document.querySelectorAll('.cta-slide');
    if (slides.length === 0) return;

    let currentIndex = 0;
    const interval = 3500; // 3.5 seconds per slide

    setInterval(() => {
        // Remove active class from current slide
        slides[currentIndex].classList.remove('active');

        // Move to next index
        currentIndex = (currentIndex + 1) % slides.length;

        // Add active class to new slide
        slides[currentIndex].classList.add('active');
    }, interval);
}

/**
 * Hero Video Rotation — crossfade between multiple hero background videos
 */
function initHeroVideoRotation() {
    const videos = document.querySelectorAll('.hero-video');
    if (videos.length < 2) return;

    // Helper to load video source on demand (ELITE VERSION: Dynamic Injection)
    function loadVideo(video) {
        if (!video.dataset.src) return; // Already loaded or no source

        // Create and append source element if it doesn't exist
        if (!video.querySelector('source')) {
            const source = document.createElement('source');
            source.src = video.dataset.src;
            source.type = 'video/mp4';
            video.appendChild(source);
            video.load();
            video.removeAttribute('data-src');
        }
    }

    // Preload the SECOND video after a delay to be ready
    setTimeout(() => {
        if (videos[1]) loadVideo(videos[1]);
    }, 5000);

    // When a video ends, crossfade to the next one
    videos.forEach((video, index) => {
        video.addEventListener('ended', () => {
            // Fade out current
            video.classList.remove('active');

            // Move to next video
            const nextIndex = (index + 1) % videos.length;
            const nextVideo = videos[nextIndex];

            // Ensure next video is loaded
            loadVideo(nextVideo);

            // Start loading the one AFTER the next one
            const doubleNextIndex = (nextIndex + 1) % videos.length;
            loadVideo(videos[doubleNextIndex]);

            // Reset and play next video
            nextVideo.currentTime = 0;
            nextVideo.play();
            nextVideo.classList.add('active');
        });
    });
}

/**
 * Gallery Modal & Swiper — Show/Hide logic and Swiper init
 */
function initGallery() {
    const showBtn = document.getElementById('showMoreGallery');
    const closeBtn = document.getElementById('closeGallery');
    const modal = document.getElementById('galleryModal');
    const overlay = document.getElementById('galleryOverlay');
    let swiperInstance = null;

    if (!showBtn || !modal) return;

    function openModal() {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }, 10);

        // Initialize Swiper ONLY when modal opens to save resources
        if (!swiperInstance) {
            swiperInstance = new Swiper('.gallery-swiper', {
                loop: true,
                spaceBetween: 30,
                grabCursor: true,
                centeredSlides: true,
                keyboard: {
                    enabled: true,
                },
                pagination: {
                    el: ".swiper-pagination",
                    clickable: true,
                },
                navigation: {
                    nextEl: ".swiper-button-next",
                    prevEl: ".swiper-button-prev",
                },
            });
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 500);
    }

    showBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay) overlay.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Re-init Lucide for modal icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}
