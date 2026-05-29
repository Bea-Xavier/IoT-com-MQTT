import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'mqtt_history';
const MAX_ENTRIES = 30;

export async function saveToHistory(topic, value) {
    try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        const history = raw ? JSON.parse(raw) : [];

        const entry = {
            id: Date.now().toString(),
            topic,
            value,
            timestamp: new Date().toISOString(),
        };

        const updated = [entry, ...history].slice(0, MAX_ENTRIES);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
        console.warn('historyService.saveToHistory error:', e);
    }
}

export async function loadHistory() {
    try {
        const raw = await AsyncStorage.getItem(HISTORY_KEY);
        if (!raw) return [];

        const stored = JSON.parse(raw);

        // Se havia mais entradas do que o limite atual, corta e já salva
        if (stored.length > MAX_ENTRIES) {
            const trimmed = stored.slice(0, MAX_ENTRIES);
            await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
            return trimmed;
        }

        return stored;
    } catch (e) {
        console.warn('historyService.loadHistory error:', e);
        return [];
    }
}

export async function clearHistory() {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.warn('historyService.clearHistory error:', e);
    }
}