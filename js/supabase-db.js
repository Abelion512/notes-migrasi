(function (global) {
    const TABLE_NOTES = 'notes';
    const TABLE_KV = 'app_data';

    function getClient() {
        return global.AbelionSupabase && global.AbelionSupabase.client;
    }

    const SupabaseDB = {
        async getNotes() {
            const client = getClient();
            if (!client) throw new Error('Supabase client not ready');

            const { data, error } = await client
                .from(TABLE_NOTES)
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;

            // Map back to application format if needed
            // Assuming DB columns match JSON fields, or content is a JSON column
            return data.map(row => {
                // If content is stored as JSONB column 'payload', unwrap it
                // Or if stored as columns, reconstruct object.
                // Strategy: Store everything in a 'content' JSONB column for flexibility
                return row.content || row;
            });
        },

        async setNotes(notes) {
            const client = getClient();
            if (!client) throw new Error('Supabase client not ready');

            // 1. Upsert current notes
            const rows = notes.map(note => ({
                id: note.id,
                updated_at: note.updatedAt || new Date().toISOString(),
                content: note
            }));

            if (rows.length > 0) {
                const { error: upsertError } = await client
                    .from(TABLE_NOTES)
                    .upsert(rows, { onConflict: 'id' });
                if (upsertError) throw upsertError;
            }

            // 2. Delete notes not in the input list
            const validIds = notes.map(n => n.id);

            // If we have valid IDs, delete everything else
            if (validIds.length > 0) {
                const { error: deleteError } = await client
                    .from(TABLE_NOTES)
                    .delete()
                    .not('id', 'in', `(${validIds.map(id => `"${id}"`).join(',')})`);
                
                if (deleteError) throw deleteError;
            } else {
                 // If input list is empty, delete all notes
                 const { error: deleteAll } = await client.from(TABLE_NOTES).delete().neq('id', '00000000-0000-0000-0000-000000000000'); 
                 if (deleteAll) throw deleteAll;
            }

            return true;
        },

        async getValue(key) {
            const client = getClient();
            if (!client) return null;

            const { data, error } = await client
                .from(TABLE_KV)
                .select('value')
                .eq('key', key)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
                console.warn('Supabase KV Get Error:', error);
            }

            return data ? data.value : null;
        },

            async setValue(key, value) {
        const client = getClient();
        if (!client) return false;

        const { error } = await client
            .from(TABLE_KV)
            .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

        if (error) {
            console.error('Supabase KV Set Error:', error);
            return false;
        }
        return true;
    }
};

global.AbelionSupabaseDB = SupabaseDB;

}) (window);
