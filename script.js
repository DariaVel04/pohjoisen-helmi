document.addEventListener('DOMContentLoaded', () => {
    initScrollRevealAnimations();
    initToolsStatsCounter();
    initMobileNav();
    initStickyHeader();
    initSmoothAnchorScroll();
    initFormValidation();
});

function initSmoothAnchorScroll() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scrollBehavior = prefersReducedMotion ? 'auto' : 'smooth';

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const hash = link.getAttribute('href');
            if (!hash || hash === '#') {
                return;
            }

            const target = document.querySelector(hash);
            if (!target) {
                return;
            }

            event.preventDefault();

            const header = document.querySelector('.site-header');
            const offset = header ? header.getBoundingClientRect().height + 16 : 16;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;

            window.scrollTo({ top: Math.max(0, top), behavior: scrollBehavior });

            if (history.pushState) {
                history.pushState(null, '', hash);
            } else {
                window.location.hash = hash;
            }
        });
    });
}

function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) {
        return;
    }

    const threshold = 48;
    let ticking = false;

    const update = () => {
        header.classList.toggle('is-scrolled', window.scrollY > threshold);
        ticking = false;
    };

    const onScroll = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(update);
        }
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
}

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clearFieldError(input) {
    const field = input.closest('.form-field');
    const error = field?.querySelector('.field-error');
    input.classList.remove('has-error');
    input.setAttribute('aria-invalid', 'false');
    field?.classList.remove('has-error');
    if (error) {
        error.hidden = true;
    }
}

function showFieldError(input, errorKey) {
    const field = input.closest('.form-field');
    const error = field?.querySelector('.field-error');
    input.classList.add('has-error');
    input.setAttribute('aria-invalid', 'true');
    field?.classList.add('has-error');
    if (error) {
        if (errorKey && window.I18n) {
            const message = window.I18n.t(errorKey);
            if (message && message !== errorKey) {
                error.textContent = message;
            }
        }
        error.hidden = false;
    }
}

function validateRequiredField(input, { showError = false } = {}) {
    const value = input.value.trim();
    const fieldName = input.getAttribute('name');

    if (!value) {
        const emptyKey = fieldName === 'name'
            ? 'form.nameRequired'
            : fieldName === 'email'
                ? 'form.emailRequired'
                : fieldName === 'phone'
                    ? 'form.phoneRequired'
                    : 'form.required';
        if (showError) {
            showFieldError(input, emptyKey);
        }
        return false;
    }

    if (input.type === 'email' && !EMAIL_PATTERN.test(value)) {
        if (showError) {
            showFieldError(input, 'form.emailInvalid');
        }
        return false;
    }

    clearFieldError(input);
    return true;
}

function validatePrivacyCheckbox(form, { showError = false } = {}) {
    const privacyCheckbox = form.querySelector('input[name="privacy"][type="checkbox"]');
    const privacyConsent = form.querySelector('.privacy-consent');
    const privacyError = form.querySelector('.privacy-error');

    if (!privacyCheckbox || !privacyError) {
        return true;
    }

    if (privacyCheckbox.checked) {
        privacyError.hidden = true;
        privacyConsent?.classList.remove('has-error');
        privacyCheckbox.setAttribute('aria-invalid', 'false');
        return true;
    }

    if (showError) {
        privacyError.hidden = false;
        privacyConsent?.classList.add('has-error');
        privacyCheckbox.setAttribute('aria-invalid', 'true');
    }
    return false;
}

function initFormValidation() {
    const forms = document.querySelectorAll('.contact-form');

    forms.forEach((form) => {
        form.setAttribute('novalidate', '');

        const requiredInputs = form.querySelectorAll('.form-field--required input');
        const privacyCheckbox = form.querySelector('input[name="privacy"][type="checkbox"]');

        requiredInputs.forEach((input) => {
            input.addEventListener('input', () => clearFieldError(input));
            input.addEventListener('blur', () => {
                validateRequiredField(input, { showError: true });
            });
        });

        if (privacyCheckbox) {
            privacyCheckbox.addEventListener('change', () => {
                validatePrivacyCheckbox(form, { showError: false });
            });
        }

        form.addEventListener('submit', (e) => {
            let isValid = true;
            let firstInvalid = null;

            requiredInputs.forEach((input) => {
                if (!validateRequiredField(input, { showError: true })) {
                    isValid = false;
                    if (!firstInvalid) {
                        firstInvalid = input;
                    }
                }
            });

            if (!validatePrivacyCheckbox(form, { showError: true })) {
                isValid = false;
                if (!firstInvalid) {
                    firstInvalid = privacyCheckbox;
                }
            }

            if (!isValid) {
                e.preventDefault();
                firstInvalid?.focus({ preventScroll: true });
                (firstInvalid || form).scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    });
}

