(function () {
    window.PROCESS_ENV = window.PROCESS_ENV || {};

    async function loadEnv() {
        try {
            // Determine path based on if we are in a subdirectory (e.g. /pages/)
            // This is a heuristic: if path contains 'pages/', assume we need to go up.
            const isInPages = window.location.pathname.indexOf('/pages/') !== -1;

            const primaryPath = isInPages ? '../.env' : '.env';
            const fallbackPath = isInPages ? '.env' : '../.env';

            let response = await fetch(primaryPath);

            if (!response.ok) {
                // Try fallback logic
                console.log(`Failed to load ${primaryPath}, trying fallback ${fallbackPath}`);
                response = await fetch(fallbackPath);
            }

            if (response.ok) {
                const text = await response.text();
                parseEnv(text);
            } else {
                console.warn('No .env file found via fetch. Using defaults.');
            }
        } catch (e) {
            console.warn('Could not load .env file:', e);
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
