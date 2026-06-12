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

/**
 * Retorna o último valor registrado de cada tópico.
 * Percorre o histórico (já ordenado do mais recente ao mais antigo)
 * e para assim que encontrar um registro de cada tópico.
 * @returns {Promise<{ temp: number, hum: number, luz: string }>}
 */
export async function loadLastValues() {
    const defaults = { temp: 0, hum: 0, luz: '0' };
    try {
        const history = await loadHistory();
        const result = { ...defaults };
        const found = { temp: false, hum: false, luz: false };

        for (const entry of history) {
            if (entry.topic === 'casa/temp' && !found.temp) {
                result.temp = parseFloat(entry.value);
                found.temp = true;
            }
            if (entry.topic === 'casa/hum' && !found.hum) {
                result.hum = parseFloat(entry.value);
                found.hum = true;
            }
            if (entry.topic === 'casa/luz' && !found.luz) {
                result.luz = entry.value;
                found.luz = true;
            }
            if (found.temp && found.hum && found.luz) break;
        }

        return result;
    } catch (e) {
        console.warn('historyService.loadLastValues error:', e);
        return defaults;
    }
}

export async function clearHistory() {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (e) {
        console.warn('historyService.clearHistory error:', e);
    }
}