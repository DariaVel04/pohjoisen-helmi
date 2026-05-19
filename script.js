document.addEventListener('DOMContentLoaded', () => {
    initScrollRevealAnimations();
    initToolsStatsCounter();
    initMobileNav();
});

function initMobileNav() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!header || !toggle || !nav) {
        return;
    }

    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(backdrop);

    let closeBtn = nav.querySelector('.nav-close');
    if (!closeBtn) {
        closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.className = 'nav-close';
        closeBtn.innerHTML = '<span aria-hidden="true">&times;</span>';
        nav.insertBefore(closeBtn, nav.firstChild);
    }
    closeBtn.hidden = true;

    const mq = window.matchMedia('(max-width: 992px)');

    const closeLangMenu = () => {
        const langToggle = document.getElementById('lang-toggle');
        const langMenu = document.getElementById('lang-menu');
        if (langToggle && langMenu) {
            langToggle.setAttribute('aria-expanded', 'false');
            langMenu.classList.remove('is-open');
            langMenu.hidden = true;
        }
    };

    const syncCloseLabel = () => {
        const label = window.I18n
            ? window.I18n.t('nav.closeMenu')
            : 'Sulje valikko';
        closeBtn.setAttribute('aria-label', label);
    };

    const setOpen = (open) => {
        header.classList.toggle('nav-open', open);
        document.body.classList.toggle('nav-open', open);
        backdrop.classList.toggle('is-active', open);
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        closeBtn.hidden = !open;
        if (open) {
            closeLangMenu();
        }
        syncCloseLabel();
        if (window.I18n) {
            const key = open ? 'nav.closeMenu' : 'nav.openMenu';
            toggle.setAttribute('aria-label', window.I18n.t(key));
        } else {
            toggle.setAttribute('aria-label', open ? 'Sulje valikko' : 'Avaa valikko');
        }
    };

    const closeNav = () => setOpen(false);

    toggle.addEventListener('click', () => {
        setOpen(!header.classList.contains('nav-open'));
    });

    closeBtn.addEventListener('click', closeNav);
    backdrop.addEventListener('click', closeNav);
    window.addEventListener('languagechange', syncCloseLabel);

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            if (mq.matches) {
                closeNav();
            }
        });
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNav();
        }
    });

    const onMqChange = (e) => {
        if (!e.matches) {
            closeNav();
        }
    };

    if (typeof mq.addEventListener === 'function') {
        mq.addEventListener('change', onMqChange);
    } else if (typeof mq.addListener === 'function') {
        mq.addListener(onMqChange);
    }
}

function initScrollRevealAnimations() {
    const revealItems = document.querySelectorAll('.reveal-on-scroll');
    if (!revealItems.length) {
        return;
    }

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.2, rootMargin: '0px 0px -30px 0px' }
    );

    revealItems.forEach((item) => {
        revealObserver.observe(item);
    });
}

function initToolsStatsCounter() {
    const statsStrip = document.querySelector('.tools-stats-strip');
    if (!statsStrip) {
        return;
    }

    const counters = statsStrip.querySelectorAll('[data-counter-target]');
    if (!counters.length) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setFinalValues = () => {
        counters.forEach((counter) => {
            const target = Number(counter.dataset.counterTarget) || 0;
            const suffix = counter.dataset.counterSuffix || '';
            counter.textContent = `${target}${suffix}`;
        });
    };

    const animateCounters = () => {
        if (prefersReducedMotion) {
            setFinalValues();
            return;
        }

        const durationMs = 1200;
        const startTime = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - startTime) / durationMs, 1);
            counters.forEach((counter) => {
                const target = Number(counter.dataset.counterTarget) || 0;
                const suffix = counter.dataset.counterSuffix || '';
                const value = Math.round(target * progress);
                counter.textContent = `${value}${suffix}`;
            });

            if (progress < 1) {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);
    };

    let hasAnimated = false;
    const counterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !hasAnimated) {
                    hasAnimated = true;
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.35 }
    );

    counterObserver.observe(statsStrip);
}
