import { Gudang } from './Gudang';
import { SecurityLog } from './Rumus';
import { v4 as uuidv4 } from 'uuid';

export const InderaKeamanan = {
    /**
     * Catat kejadian keamanan ke dalam gudang logs.
     */
    async catat(event: string, level: SecurityLog['level'] = 'info', details?: string) {
        const log: SecurityLog = {
            id: uuidv4(),
            event,
            level,
            timestamp: new Date().toISOString(),
            details
        };

        try {
            await Gudang.set('logs', log.id, log);
        } catch (e) {
            console.error('Gagal mencatat log keamanan', e);
        }
    },

    async ambilSemua(): Promise<SecurityLog[]> {
        const logs = await Gudang.getAll('logs') as SecurityLog[];
        return logs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    },

    async bersihkan() {
        await Gudang.clear('logs');
    }
};
