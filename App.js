import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import MQTTService from "./src/services/mqttService";
import { saveToHistory, loadLastValues } from "./src/services/historyService";
import StatusModal from "./src/components/StatusModal";
import LightControl from "./src/components/LightControl";
import Gauges from "./src/components/Gauges";
import HistoryScreen from "./src/components/HistoryScreen";
import DashboardScreen from "./src/components/DashboardScreen";

const mqtt = new MQTTService();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);
  const [temp, setTemp] = useState(0);
  const [hum, setHum] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const mqttConfig = {
    host: process.env.EXPO_PUBLIC_MQTT_HOST,
    port: parseInt(process.env.EXPO_PUBLIC_MQTT_PORT),
    path: process.env.EXPO_PUBLIC_MQTT_PATH,
    user: process.env.EXPO_PUBLIC_MQTT_USER,
    pass: process.env.EXPO_PUBLIC_MQTT_PASS,
    clientId: 'RN_App' + Math.random(),
  };

  useEffect(() => {
    // Carrega os últimos valores salvos antes de conectar ao broker,
    // evitando que a tela inicie com tudo zerado
    loadLastValues().then(({ temp, hum, luz }) => {
      setTemp(temp);
      setHum(hum);
      setIsLightOn(luz === '1');
    });

    startConnection();
  }, []);

  const startConnection = () => {
    setShowError(false);
    mqtt.connect(
      mqttConfig,
      async (topic, message) => {
        // Atualiza estado em tempo real
        if (topic === 'casa/temp') setTemp(parseFloat(message));
        if (topic === 'casa/hum')  setHum(parseFloat(message));
        if (topic === 'casa/luz')  setIsLightOn(message === '1');

        // Persiste no histórico local
        await saveToHistory(topic, message);
      },
      () => {
        setIsConnected(true);
        mqtt.subscribe('casa/temp');
        mqtt.subscribe('casa/hum');
        mqtt.subscribe('casa/luz');
      },
      (err) => {
        setIsConnected(false);
        setShowError(true);
      }
    );
  };

  const toggleLight = () => {
    const newState = isLightOn ? '0' : '1';
    mqtt.publish('casa/luz', newState);
  };

  if (showDashboard) {
    return <DashboardScreen onBack={() => setShowDashboard(false)} />;
  }

  // Exibe a tela de histórico
  if (showHistory) {
    return <HistoryScreen onBack={() => setShowHistory(false)} />;
  }

  return (
    <View style={styles.container}>
      {/* Header com botão de histórico */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Smart Home IoT</Text>
        <TouchableOpacity
          onPress={() => setShowDashboard(true)}
          style={styles.historyBtn}
        >
          <Icon name="chart-line" size={26} color="#27ae60" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowHistory(true)}
          style={styles.historyBtn}
        >
          <Icon name="history" size={26} color="#3498db" />
        </TouchableOpacity>
      </View>

      {/* Indicador de conexão */}
      <View style={styles.statusRow}>
        <View style={[styles.dot, { backgroundColor: isConnected ? '#27ae60' : '#e74c3c' }]} />
        <Text style={styles.statusText}>
          {isConnected ? 'Conectado ao broker' : 'Desconectado'}
        </Text>
      </View>

      <LightControl isLightOn={isLightOn} onToggle={toggleLight} />

      <Gauges temp={temp} hum={hum} />

      <StatusModal
        visible={showError}
        onRetry={startConnection}
        onLater={() => setShowError(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 8,
  },
  header: {
    flex: 1,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  historyBtn: {
    padding: 6,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#666',
    fontSize: 12,
  },
});