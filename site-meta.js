(function () {
    function getBaseUrl() {
        const meta = document.querySelector('meta[name="site-base-url"]');
        const configured = meta?.getAttribute('content')?.trim();
        if (configured) {
            return configured.replace(/\/$/, '');
        }
        if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
            return window.location.origin;
        }
        return '';
    }

    function absoluteUrl(path) {
        if (!path) {
            return getBaseUrl();
        }
        if (/^https?:\/\//i.test(path)) {
            return path;
        }
        const base = getBaseUrl();
        const normalized = path.replace(/^\//, '');
        return base ? `${base}/${normalized}` : `/${normalized}`;
    }

    function initOpenGraphUrls() {
        const base = getBaseUrl();
        if (!base) {
            return;
        }

        const page = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
        const pageUrl = `${base}/${page}`.replace(/([^:]\/)\/+/g, '$1');

        const ogUrl = document.getElementById('og-url');
        if (ogUrl) {
            ogUrl.setAttribute('content', pageUrl);
        }

        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
            canonical.setAttribute('href', pageUrl);
        }

        document.querySelectorAll('#og-image, #twitter-image').forEach((el) => {
            const src = el.getAttribute('content');
            if (src && !/^https?:\/\//i.test(src)) {
                el.setAttribute('content', absoluteUrl(src));
            }
        });
    }

    document.addEventListener('DOMContentLoaded', initOpenGraphUrls);

    window.SiteMeta = { getBaseUrl, absoluteUrl };
})();
