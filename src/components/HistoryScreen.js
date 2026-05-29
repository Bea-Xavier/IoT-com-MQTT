import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { loadHistory, clearHistory } from '../services/historyService';

const TOPIC_META = {
    'casa/temp': { icon: 'thermometer',   color: '#e74c3c', label: 'Temperatura', unit: '°C' },
    'casa/hum':  { icon: 'water-percent', color: '#3498db', label: 'Umidade',     unit: '%'  },
    'casa/luz':  { icon: 'lightbulb-on',  color: '#F1C40F', label: 'Luz',         unit: ''   },
};

function formatTimestamp(iso) {
    const d = new Date(iso);
    return `${d.toLocaleDateString('pt-BR')} · ${d.toLocaleTimeString('pt-BR')}`;
}

function formatValue(topic, value) {
    if (topic === 'casa/luz') return value === '1' ? 'Ligada' : 'Desligada';
    const meta = TOPIC_META[topic];
    return `${value}${meta ? meta.unit : ''}`;
}

function HistoryItem({ item }) {
    const meta = TOPIC_META[item.topic] ?? {
        icon: 'broadcast', color: '#aaa', label: item.topic, unit: '',
    };
    return (
        <View style={styles.item}>
            <View style={[styles.iconWrapper, { backgroundColor: meta.color + '22' }]}>
                <Icon name={meta.icon} size={22} color={meta.color} />
            </View>
            <View style={styles.itemBody}>
                <Text style={styles.itemLabel}>{meta.label}</Text>
                <Text style={styles.itemTime}>{formatTimestamp(item.timestamp)}</Text>
            </View>
            <Text style={[styles.itemValue, { color: meta.color }]}>
                {formatValue(item.topic, item.value)}
            </Text>
        </View>
    );
}

function ConfirmModal({ visible, onConfirm, onCancel }) {
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Icon name="trash-can-outline" size={40} color="#e74c3c" style={{ marginBottom: 12 }} />
                    <Text style={styles.modalTitle}>Limpar Histórico</Text>
                    <Text style={styles.modalText}>
                        Tem certeza? Todos os registros serão apagados e esta ação não pode ser desfeita.
                    </Text>
                    <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
                        <Text style={styles.btnText}>Sim, limpar tudo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                        <Text style={styles.btnText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

export default function HistoryScreen({ onBack }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        const data = await loadHistory();
        setHistory(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const handleClear = async () => {
        await clearHistory();
        setHistory([]);
        setShowConfirm(false);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Histórico</Text>
                <TouchableOpacity onPress={() => setShowConfirm(true)} style={styles.clearBtn}>
                    <Icon name="trash-can-outline" size={22} color="#e74c3c" />
                </TouchableOpacity>
            </View>

            {!loading && (
                <Text style={styles.counter}>
                    {history.length} registro{history.length !== 1 ? 's' : ''} salvos
                </Text>
            )}

            {loading ? (
                <ActivityIndicator color="#3498db" style={{ marginTop: 40 }} />
            ) : history.length === 0 ? (
                <View style={styles.empty}>
                    <Icon name="database-off-outline" size={48} color="#444" />
                    <Text style={styles.emptyText}>Nenhum dado salvo ainda.</Text>
                    <Text style={styles.emptySubText}>
                        Conecte-se ao broker e aguarde mensagens chegarem.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <HistoryItem item={item} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            <ConfirmModal
                visible={showConfirm}
                onConfirm={handleClear}
                onCancel={() => setShowConfirm(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#121212',
        paddingHorizontal: 16, paddingTop: 50,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    },
    backBtn: { padding: 6, marginRight: 8 },
    title: { flex: 1, color: '#fff', fontSize: 22, fontWeight: 'bold' },
    clearBtn: { padding: 6 },
    counter: { color: '#555', fontSize: 12, marginBottom: 12 },
    item: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1e1e1e', borderRadius: 14,
        padding: 14, marginBottom: 10,
    },
    iconWrapper: {
        width: 44, height: 44, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    itemBody: { flex: 1 },
    itemLabel: { color: '#eee', fontWeight: '600', fontSize: 15 },
    itemTime: { color: '#666', fontSize: 11, marginTop: 2 },
    itemValue: { fontSize: 16, fontWeight: 'bold' },
    empty: {
        flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    emptyText: { color: '#666', fontSize: 16, marginTop: 12 },
    emptySubText: {
        color: '#444', fontSize: 13,
        textAlign: 'center', paddingHorizontal: 30,
    },
    modalContainer: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#222', padding: 30, borderRadius: 20,
        width: '85%', alignItems: 'center',
        borderWidth: 1, borderColor: '#333',
    },
    modalTitle: {
        color: '#fff', fontSize: 18,
        fontWeight: 'bold', marginBottom: 10,
    },
    modalText: {
        color: '#aaa', textAlign: 'center',
        fontSize: 14, marginBottom: 25,
    },
    btnConfirm: {
        backgroundColor: '#e74c3c', padding: 15,
        borderRadius: 12, width: '100%', marginBottom: 12,
    },
    btnCancel: {
        backgroundColor: '#444', padding: 15,
        borderRadius: 12, width: '100%',
    },
    btnText: {
        color: '#fff', textAlign: 'center',
        fontWeight: 'bold', fontSize: 16,
    },
});