(function () {
    window.AbelionSupabase = {
        client: null,
        resolveReady: null,
        ready: new Promise((resolve) => {
            window.AbelionSupabase_resolveReady = resolve;

            window.addEventListener('env-ready', () => {
                initSupabase(null, null, resolve);
            });
            // Fallback if env loads faster than this script
            if (window.PROCESS_ENV && window.PROCESS_ENV.SUPABASE_URL) {
                initSupabase(null, null, resolve);
            }
        }),
        init: (url, key) => {
            initSupabase(url, key, window.AbelionSupabase_resolveReady);
        }
    };

    function initSupabase(customUrl, customKey, resolve) {
        if (window.AbelionSupabase.client) return;

        const url = customUrl || (window.PROCESS_ENV && window.PROCESS_ENV.SUPABASE_URL);
        const key = userKey || (window.PROCESS_ENV && (window.PROCESS_ENV.SUPABASE_ANON_KEY || window.PROCESS_ENV.SUPABASE_KEY));

        if (url && key && window.supabase) {
            try {
                window.AbelionSupabase.client = window.supabase.createClient(url, key);
                console.log('Supabase Client Initialized');
                resolve(window.AbelionSupabase.client);
            } catch (err) {
                console.error('Failed to initialize Supabase:', err);
            }
        } else {
            console.warn('Supabase credentials missing or SDK not loaded.');
        }
    }
})();
