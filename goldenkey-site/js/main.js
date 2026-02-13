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
});

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
    const video = document.querySelector('.hero-video');
    const fallback = document.querySelector('.hero-fallback');

    if (video && fallback) {
        video.addEventListener('playing', () => {
            fallback.style.display = 'none';
        });
    }
}

/**
 * Cookie Banner — show/hide based on localStorage preference
 */
function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');

    if (!banner) return;

    // Check if user already made a choice
    const cookieChoice = localStorage.getItem('gk_cookie_consent');

    if (!cookieChoice) {
        // Show banner after a short delay
        setTimeout(() => {
            banner.classList.add('visible');
        }, 1500);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('gk_cookie_consent', 'accepted');
            banner.classList.remove('visible');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('gk_cookie_consent', 'rejected');
            banner.classList.remove('visible');
        });
    }
}

/**
 * Form Validation — ensure GDPR checkbox is checked before submit
 */
function initFormValidation() {
    const form = document.querySelector('.contact-form-box form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        const consent = document.getElementById('gdpr-consent');
        if (consent && !consent.checked) {
            e.preventDefault();
            consent.focus();
            alert('Per favore, accetta la Privacy Policy prima di inviare il modulo.');
        }
    });
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
    const interval = 3000; // 3 seconds per slide (Faster as requested)

    setInterval(() => {
        // Remove active class from current slide
        slides[currentIndex].classList.remove('active');

        // Move to next index
        currentIndex = (currentIndex + 1) % slides.length;

        // Add active class to new slide
        slides[currentIndex].classList.add('active');
    }, interval);
}
