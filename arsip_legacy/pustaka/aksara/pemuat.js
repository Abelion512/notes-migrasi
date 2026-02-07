(function () {
    window.PROCESS_ENV = window.PROCESS_ENV || {};

    async function loadEnv() {
        try {
            // Determine path based on if we are in a subdirectory (e.g. /lembaran/)
            // This is a heuristic: if path contains 'lembaran/', assume we need to go up.
            const isInPages = window.location.pathname.indexOf('/lembaran/') !== -1;

            const primaryPath = isInPages ? '../.env' : '.env';
            const fallbackPath = isInPages ? '.env' : '../.env';

            let response = await fetch(primaryPath);

            if (!response.ok) {
                // Try fallback logic silently
                response = await fetch(fallbackPath);
            }

            if (response.ok) {
                const text = await response.text();
                parseEnv(text);
            }
        } catch (_e) {
            // Silently ignore if .env cannot be fetched
        }
    }

    function parseEnv(text) {
        const lines = text.split('\n');
        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) return;

            const [key, ...valueParts] = trimmed.split('=');
            if (key) {
                const value = valueParts.join('=').trim().replace(/(^['"]|['"]$)/g, '');
                window.PROCESS_ENV[key.trim()] = value;
            }
        });
        console.log('Environment variables loaded.');
        window.dispatchEvent(new CustomEvent('env-ready'));
    }

    loadEnv();
})();
