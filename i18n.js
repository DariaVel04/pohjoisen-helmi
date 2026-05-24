(function () {
    const STORAGE_KEY = 'ph-lang';
    const DEFAULT_LANG = 'fi';
    const SUPPORTED = ['fi', 'en', 'ru'];

    let currentLang = DEFAULT_LANG;
    let translations = {};

    function getStoredLang() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return SUPPORTED.includes(stored) ? stored : DEFAULT_LANG;
    }

    function getNested(obj, path) {
        return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : null), obj);
    }

    function resolve(key) {
        const value = getNested(translations, key);
        return value == null ? null : String(value);
    }

    async function loadTranslations(lang) {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            throw new Error(`Failed to load locale: ${lang}`);
        }
        return response.json();
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const value = resolve(key);
            if (value == null) {
                return;
            }
            if (el.hasAttribute('data-i18n-html')) {
                el.innerHTML = value;
            } else {
                el.textContent = value;
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
            const value = resolve(el.getAttribute('data-i18n-placeholder'));
            if (value != null) {
                el.setAttribute('placeholder', value);
            }
        });

        document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            const value = resolve(el.getAttribute('data-i18n-alt'));
            if (value != null) {
                el.setAttribute('alt', value);
            }
        });

        document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
            const value = resolve(el.getAttribute('data-i18n-aria-label'));
            if (value != null) {
                el.setAttribute('aria-label', value);
            }
        });

        document.querySelectorAll('[data-i18n-content]').forEach((el) => {
            const value = resolve(el.getAttribute('data-i18n-content'));
            if (value != null) {
                el.setAttribute('content', value);
            }
        });

        const titleKey = document.body.getAttribute('data-meta-title');
        if (titleKey) {
            const title = resolve(titleKey);
            if (title) {
                document.title = title;
            }
        }

        const ogLocaleMap = { fi: 'fi_FI', en: 'en_US', ru: 'ru_RU' };
        const ogLocale = document.getElementById('og-locale');
        if (ogLocale) {
            ogLocale.setAttribute('content', ogLocaleMap[currentLang] || 'fi_FI');
        }

        document.documentElement.lang = currentLang;
        document.body.classList.toggle('lang-fi', currentLang === 'fi');
        document.body.classList.toggle('lang-en', currentLang === 'en');
        document.body.classList.toggle('lang-ru', currentLang === 'ru');

        updateLangMenuState();
        syncNavToggleLabel();
    }

    function updateLangMenuState() {
        const toggle = document.getElementById('lang-toggle');
        const menu = document.getElementById('lang-menu');
        if (!toggle || !menu) {
            return;
        }

        menu.querySelectorAll('[data-lang]').forEach((btn) => {
            const isActive = btn.getAttribute('data-lang') === currentLang;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });

        toggle.setAttribute('data-current-lang', currentLang.toUpperCase());
        const codeEl = toggle.querySelector('.lang-toggle-code');
        if (codeEl) {
            codeEl.textContent = currentLang.toUpperCase();
        }
    }

    function syncNavToggleLabel() {
        const navToggle = document.querySelector('.nav-toggle');
        if (!navToggle) {
            return;
        }
        const open = navToggle.getAttribute('aria-expanded') === 'true';
        const key = open ? 'nav.closeMenu' : 'nav.openMenu';
        const label = resolve(key);
        if (label) {
            navToggle.setAttribute('aria-label', label);
        }
    }

    function setLangMenuOpen(open) {
        const toggle = document.getElementById('lang-toggle');
        const menu = document.getElementById('lang-menu');
        if (!toggle || !menu) {
            return;
        }
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        menu.classList.toggle('is-open', open);
        menu.hidden = !open;
    }

    function closeLangMenu() {
        setLangMenuOpen(false);
    }

    async function setLanguage(lang, { persist = true } = {}) {
        if (!SUPPORTED.includes(lang)) {
            return;
        }

        try {
            translations = await loadTranslations(lang);
            currentLang = lang;
            if (persist) {
                localStorage.setItem(STORAGE_KEY, lang);
            }
            applyTranslations();
            window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
        } catch (err) {
            console.error(err);
            if (lang !== DEFAULT_LANG) {
                await setLanguage(DEFAULT_LANG, { persist: false });
            }
        }
    }

    function initLanguageSwitcher() {
        const toggle = document.getElementById('lang-toggle');
        const menu = document.getElementById('lang-menu');
        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const open = toggle.getAttribute('aria-expanded') !== 'true';
            setLangMenuOpen(open);
        });

        menu.querySelectorAll('[data-lang]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                setLanguage(lang);
                closeLangMenu();
            });
        });

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                closeLangMenu();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLangMenu();
            }
        });
    }

    window.I18n = {
        setLanguage,
        getLanguage: () => currentLang,
        t: (key) => resolve(key) || key,
    };

    document.addEventListener('DOMContentLoaded', async () => {
        currentLang = getStoredLang();
        await setLanguage(currentLang, { persist: false });
        initLanguageSwitcher();

        const navToggle = document.querySelector('.nav-toggle');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                requestAnimationFrame(syncNavToggleLabel);
            });
        }
    });
})();
