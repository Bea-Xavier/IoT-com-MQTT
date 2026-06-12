import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { loadHistory } from '../services/historyService';
import { LineChart } from 'react-native-chart-kit';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W  = SCREEN_W - 48; 

function fmtTime(iso) {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function downsample(arr, max = 8) {
    if (arr.length <= max) return arr;
    const step = Math.ceil(arr.length / max);
    return arr.filter((_, i) => i % step === 0);
}

function calcStats(values) {
    if (!values.length) return { min: 0, max: 0, avg: 0 };
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return { min, max, avg };
}

function chartConfig(color) {
    return {
        backgroundGradientFrom: '#1e1e1e',
        backgroundGradientTo:   '#1e1e1e',
        decimalPlaces: 1,
        color: (opacity = 1) => color,
        labelColor: () => '#666',
        propsForDots: { r: '3', strokeWidth: '1', stroke: color },
        propsForBackgroundLines: { stroke: '#2a2a2a' },
    };
}

function LightTimeline({ events }) {
    if (!events.length) return null;

    const total = events.length;

    return (
        <View>
            {/* Barra de blocos coloridos */}
            <View style={tlStyles.bar}>
                {events.map((ev, i) => {
                    const on = ev.value === '1';
                    return (
                        <View
                            key={ev.id}
                            style={[
                                tlStyles.segment,
                                { backgroundColor: on ? '#F1C40F' : '#2a2a2a',
                                  borderColor: on ? '#c9a200' : '#444' }
                            ]}
                        />
                    );
                })}
            </View>

            {/* Lista de eventos abaixo da barra */}
            <View style={tlStyles.eventList}>
                {events.map((ev) => {
                    const on = ev.value === '1';
                    return (
                        <View key={ev.id} style={tlStyles.eventRow}>
                            <View style={[tlStyles.dot, { backgroundColor: on ? '#F1C40F' : '#555' }]} />
                            <Text style={[tlStyles.eventLabel, { color: on ? '#F1C40F' : '#888' }]}>
                                {on ? 'Ligada' : 'Desligada'}
                            </Text>
                            <Text style={tlStyles.eventTime}>{fmtTime(ev.timestamp)}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const tlStyles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        height: 28,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 12,
        gap: 2,
    },
    segment: {
        flex: 1,
        borderRadius: 4,
        borderWidth: 1,
    },
    eventList: {
        gap: 6,
    },
    eventRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#222',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    eventLabel: {
        flex: 1,
        fontSize: 13,
        fontWeight: '600',
    },
    eventTime: {
        fontSize: 12,
        color: '#555',
    },
});

function MetricCard({ label, value, sub, color }) {
    return (
        <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>{label}</Text>
            <Text style={[styles.metricValue, { color }]}>{value}</Text>
            {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
        </View>
    );
}

export default function DashboardScreen({ onBack }) {
    const [loading, setLoading] = useState(true);
    const [tempSeries, setTempSeries] = useState([]);
    const [humSeries,  setHumSeries]  = useState([]);
    const [luzSeries,  setLuzSeries]  = useState([]);
    const [stats, setStats] = useState({ temp: {}, hum: {}, luz: {} });

    const fetchData = useCallback(async () => {
        setLoading(true);
        const history = await loadHistory();

        // Separa e ordena cada tópico do mais antigo ao mais recente
        const tempRaw = history.filter(e => e.topic === 'casa/temp').reverse();
        const humRaw  = history.filter(e => e.topic === 'casa/hum').reverse();
        const luzRaw  = history.filter(e => e.topic === 'casa/luz').reverse();

        // Reduz para no máximo 10 pontos por gráfico
        const tempSampled = downsample(tempRaw, 10);
        const humSampled  = downsample(humRaw, 10);
        setTempSeries(tempSampled);
        setHumSeries(humSampled);
        setLuzSeries(luzRaw);

        // Estatísticas usando todos os dados, não só a amostra
        const tempVals = tempRaw.map(e => parseFloat(e.value));
        const humVals  = humRaw.map(e => parseFloat(e.value));
        const luzOn    = luzRaw.filter(e => e.value === '1').length;
        const luzOff   = luzRaw.filter(e => e.value === '0').length;

        setStats({
            temp: calcStats(tempVals),
            hum:  calcStats(humVals),
            luz:  { on: luzOn, off: luzOff, total: luzOn + luzOff },
        });

        setLoading(false);
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const empty = !loading && !tempSeries.length && !humSeries.length && !luzSeries.length;

    const tempChartData = tempSeries.length
        ? { labels: tempSeries.map(e => fmtTime(e.timestamp)), datasets: [{ data: tempSeries.map(e => parseFloat(e.value)) }] }
        : null;

    const humChartData = humSeries.length
        ? { labels: humSeries.map(e => fmtTime(e.timestamp)), datasets: [{ data: humSeries.map(e => parseFloat(e.value)) }] }
        : null;


    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                    <Icon name="arrow-left" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Dashboard</Text>
                <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
                    <Icon name="refresh" size={22} color="#3498db" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator color="#3498db" style={{ marginTop: 60 }} />
            ) : empty ? (
                <View style={styles.empty}>
                    <Icon name="chart-line" size={48} color="#333" />
                    <Text style={styles.emptyText}>Nenhum dado para exibir.</Text>
                    <Text style={styles.emptySubText}>
                        Conecte-se ao broker e aguarde mensagens chegarem.
                    </Text>
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>

                    {/* ── Cards de métricas ─────────────────── */}
                    <View style={styles.metricsRow}>
                        <MetricCard
                            label="Acionamentos"
                            value={String(stats.luz.total ?? 0)}
                            sub={`${stats.luz.on ?? 0} ligada · ${stats.luz.off ?? 0} desligada`}
                            color="#F1C40F"
                        />
                        <MetricCard
                            label="Temp. média"
                            value={stats.temp.avg != null ? stats.temp.avg.toFixed(1) + '°C' : '—'}
                            sub={`${(stats.temp.min ?? 0).toFixed(1)} → ${(stats.temp.max ?? 0).toFixed(1)}°C`}
                            color="#e74c3c"
                        />
                        <MetricCard
                            label="Umid. média"
                            value={stats.hum.avg != null ? Math.round(stats.hum.avg) + '%' : '—'}
                            sub={`${Math.round(stats.hum.min ?? 0)} → ${Math.round(stats.hum.max ?? 0)}%`}
                            color="#3498db"
                        />
                    </View>

                    {/* ── Timeline: Lâmpada ──────────────────── */}
                    {luzSeries.length > 0 && (
                        <View style={styles.chartBlock}>
                            <View style={styles.chartHeader}>
                                <Icon name="lightbulb-on" size={16} color="#F1C40F" />
                                <Text style={styles.chartTitle}>Acionamentos da lâmpada</Text>
                            </View>
                            <View style={styles.legend}>
                                <View style={[styles.legendDot, { backgroundColor: '#F1C40F' }]} />
                                <Text style={styles.legendText}>Ligada</Text>
                                <View style={[styles.legendDot, { backgroundColor: '#333', marginLeft: 8 }]} />
                                <Text style={styles.legendText}>Desligada</Text>
                            </View>
                            <LightTimeline events={luzSeries} />
                        </View>
                    )}

                    {/* ── Gráfico: Temperatura ──────────────── */}
                    {tempChartData && (
                        <View style={styles.chartBlock}>
                            <View style={styles.chartHeader}>
                                <Icon name="thermometer" size={16} color="#e74c3c" />
                                <Text style={styles.chartTitle}>Temperatura ao longo do tempo</Text>
                            </View>
                            <View style={styles.legend}>
                                <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
                                <Text style={styles.legendText}>°C</Text>
                            </View>
                            <LineChart
                                data={tempChartData}
                                width={CHART_W}
                                height={200}
                                chartConfig={chartConfig('#e74c3c')}
                                bezier
                                style={styles.chart}
                                withShadow={false}
                            />
                        </View>
                    )}

                    {/* ── Gráfico: Umidade ──────────────────── */}
                    {humChartData && (
                        <View style={styles.chartBlock}>
                            <View style={styles.chartHeader}>
                                <Icon name="water-percent" size={16} color="#3498db" />
                                <Text style={styles.chartTitle}>Umidade ao longo do tempo</Text>
                            </View>
                            <View style={styles.legend}>
                                <View style={[styles.legendDot, { backgroundColor: '#3498db' }]} />
                                <Text style={styles.legendText}>%</Text>
                            </View>
                            <LineChart
                                data={humChartData}
                                width={CHART_W}
                                height={200}
                                chartConfig={chartConfig('#3498db')}
                                bezier
                                style={styles.chart}
                                withShadow={false}
                            />
                        </View>
                    )}

                    <View style={{ height: 32 }} />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, backgroundColor: '#121212',
        paddingHorizontal: 16, paddingTop: 50,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', marginBottom: 20,
    },
    backBtn:    { padding: 6, marginRight: 8 },
    refreshBtn: { padding: 6 },
    title: {
        flex: 1, color: '#fff', fontSize: 22, fontWeight: 'bold',
    },
    metricsRow: {
        flexDirection: 'row', gap: 8, marginBottom: 24,
    },
    metricCard: {
        flex: 1, backgroundColor: '#1e1e1e',
        borderRadius: 14, padding: 12,
    },
    metricLabel: { color: '#666', fontSize: 11, marginBottom: 4 },
    metricValue: { fontSize: 18, fontWeight: 'bold' },
    metricSub:   { color: '#555', fontSize: 10, marginTop: 2 },
    chartBlock: {
        backgroundColor: '#1e1e1e',
        borderRadius: 16, padding: 16,
        marginBottom: 16,
    },
    chartHeader: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
    },
    chartTitle: { color: '#ccc', fontSize: 13, fontWeight: '600' },
    legend: {
        flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
    },
    legendDot: { width: 10, height: 10, borderRadius: 2 },
    legendText: { color: '#555', fontSize: 11 },
    chart: { borderRadius: 10, marginLeft: -8 },
    empty: {
        flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10,
    },
    emptyText:    { color: '#555', fontSize: 16, marginTop: 12 },
    emptySubText: { color: '#444', fontSize: 13, textAlign: 'center', paddingHorizontal: 30 },
});