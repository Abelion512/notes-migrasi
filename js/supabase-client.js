(function () {
    window.AbelionSupabase = {
        client: null,
        ready: new Promise((resolve) => {
            window.addEventListener('env-ready', () => {
                initSupabase(resolve);
            });
            // Fallback if env loads faster than this script
            if (window.PROCESS_ENV && window.PROCESS_ENV.SUPABASE_URL) {
                initSupabase(resolve);
            }
        })
    };

    function initSupabase(resolve) {
        if (window.AbelionSupabase.client) return;

        // Prioritize user-provided config from localStorage
        const userUrl = localStorage.getItem('abelion-supabase-url');
        const userKey = localStorage.getItem('abelion-supabase-key');

        const url = userUrl || (window.PROCESS_ENV && window.PROCESS_ENV.SUPABASE_URL);
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
