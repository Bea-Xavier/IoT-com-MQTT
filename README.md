# 📱 Smart Home IoT — Aplicativo de Automação Residencial

Esta é uma aplicação mobile desenvolvida em **React Native com Expo** para monitorar e controlar dispositivos de uma casa inteligente em tempo real. O app se comunica com sensores e atuadores físicos (ou simulados) através do protocolo **MQTT**, utilizando o **HiveMQ** como broker na nuvem, persiste o histórico de dados localmente no dispositivo com **AsyncStorage** e exibe gráficos analíticos em um dashboard dedicado.

---

## 📋 Descrição do Projeto

O aplicativo permite visualizar em tempo real a temperatura e umidade do ambiente, além de controlar o estado de uma lâmpada remotamente. Todas as mensagens recebidas do broker são salvas automaticamente no dispositivo, e o usuário pode consultar o histórico completo de eventos ou analisar os dados em gráficos — mesmo sem conexão ativa com o broker.

### Como o problema foi resolvido

A aplicação foi dividida em duas camadas:

- **Comunicação em tempo real:** O app se conecta ao broker **HiveMQ Cloud** via protocolo MQTT sobre WebSocket seguro (WSS). Ao receber mensagens nos tópicos `casa/temp`, `casa/hum` e `casa/luz`, a interface é atualizada instantaneamente. Para publicar, basta acionar o botão da lâmpada e o comando é enviado ao broker, que repassa ao dispositivo físico.

- **Persistência local:** Cada mensagem recebida é salva automaticamente no **AsyncStorage** do dispositivo (banco de dados chave-valor nativo do React Native). Um serviço dedicado (`historyService`) gerencia as gravações, mantendo os registros mais recentes e respeitando um limite máximo configurável de entradas para não sobrecarregar o armazenamento. Na inicialização do app, os últimos valores salvos de cada tópico são carregados automaticamente, evitando que a tela comece zerada.

---

## ⚙️ Funcionalidades

💠 **Monitoramento em tempo real** da temperatura e umidade via gauges circulares;

💠 **Controle da lâmpada** — liga e desliga remotamente com feedback visual imediato;

💠 **Restauração de estado ao abrir o app** — os últimos valores salvos de temperatura, umidade e estado da lâmpada são carregados automaticamente antes de conectar ao broker;

💠 **Histórico local persistente** — todas as mensagens recebidas são salvas automaticamente no dispositivo com limite máximo configurável de entradas;

💠 **Tela de histórico** com exibição de tópico, valor e horário de cada registro, do mais recente ao mais antigo;

💠 **Limpeza do histórico** com confirmação via modal customizado;

💠 **Dashboard analítico** com cards de métricas, timeline de acionamentos da lâmpada e gráficos de linha para temperatura e umidade ao longo do tempo;

💠 **Indicador de status de conexão** em tempo real na tela principal.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
|---|---|
| **React Native** | Construção da interface mobile |
| **Expo** | Ambiente de desenvolvimento e execução do app |
| **MQTT (Paho)** | Protocolo de comunicação com o broker IoT |
| **HiveMQ Cloud** | Broker MQTT na nuvem (WebSocket Seguro) |
| **AsyncStorage** | Persistência local do histórico de mensagens |
| **react-native-chart-kit** | Gráficos de linha e barra no dashboard |
| **react-native-svg** | Dependência necessária para os gráficos |
| **react-native-circular-progress-indicator** | Gauges circulares de temperatura e umidade |
| **MQTT.fx** | Cliente desktop para testar publicações no broker |
| **Expo Vector Icons** | Ícones visuais (MaterialCommunityIcons) |

💠 React Native &nbsp;|&nbsp; 💠 Expo &nbsp;|&nbsp; 💠 HiveMQ &nbsp;|&nbsp; 💠 MQTT

[![My Skills](https://skillicons.dev/icons?i=git,nodejs,js,npm,vscode&theme=dark)](https://skillicons.dev)

---

## 🖥️ Configuração do Ambiente

Antes de começar, certifique-se de ter instalado em sua máquina:

- [**Node.js**](https://nodejs.org/en) (versão recomendada: LTS)
- [**Expo Go**](https://expo.dev/client) instalado no seu celular (Android ou iOS)
- **npm** (já vem junto com o Node.js)
- Uma conta no [**HiveMQ Cloud**](https://www.hivemq.com/mqtt-cloud-broker/) com um cluster criado

---

## 📦 Instalação

**1.** Clone o repositório:

```bash
git clone https://github.com/Bea-Xavier/IoT-com-MQTT.git
cd IoT-com-MQTT
```

**2.** Instale as dependências:

```bash
npm install
```

**3.** Instale as dependências nativas necessárias:

```bash
npx expo install @react-native-async-storage/async-storage
npx expo install react_native_mqtt
npm install react-native-chart-kit react-native-svg
```

---

## ▶️ Execução

### 1. Configurar as credenciais do broker

Renomeie o arquivo `.env.example` para `.env` e preencha com as credenciais do seu cluster HiveMQ:

```env
EXPO_PUBLIC_MQTT_HOST=xxxxxxxx.s1.eu.hivemq.cloud
EXPO_PUBLIC_MQTT_PORT=8884
EXPO_PUBLIC_MQTT_USER=seu_usuario
EXPO_PUBLIC_MQTT_PASS=sua_senha
EXPO_PUBLIC_MQTT_PATH=/mqtt
```

> ⚠️ **Importante:** Nunca suba o arquivo `.env` para o repositório. Certifique-se de que ele está listado no `.gitignore`.

### 2. Iniciar o aplicativo

```bash
npx expo start --tunnel
```

Será gerado um **QR Code** no terminal. Abra o **Expo Go** no seu celular e escaneie para rodar o app.

### 3. Testar com MQTT.fx (opcional)

Para simular sensores publicando dados, abra o **MQTT.fx**, conecte-se ao mesmo broker HiveMQ e publique mensagens nos tópicos:

| Tópico | Exemplo de valor |
|---|---|
| `casa/temp` | `25.3` |
| `casa/hum` | `60` |
| `casa/luz` | `1` (ligada) ou `0` (desligada) |

---

## 📁 Estrutura do Projeto

```
├── .env.example                  # Modelo de variáveis de ambiente
├── App.js                        # Ponto de entrada, conexão MQTT e navegação entre telas
│
└── src/
    ├── components/
    │   ├── Gauges.js             # Gauges circulares de temperatura e umidade
    │   ├── LightControl.js       # Botão de controle da lâmpada
    │   ├── StatusModal.js        # Modal de erro de conexão
    │   ├── HistoryScreen.js      # Tela de histórico de mensagens com limpeza
    │   └── DashboardScreen.js    # Tela de dashboard com gráficos analíticos
    │
    └── services/
        ├── mqttService.js        # Classe de conexão, subscribe e publish MQTT
        └── historyService.js     # Persistência local: salvar, carregar, limpar e restaurar últimos valores
```

---

## 📊 Dashboard

A tela de dashboard é acessada pelo ícone de gráfico no cabeçalho da tela principal e exibe três seções:

- **Cards de métricas** — total de acionamentos da lâmpada, temperatura média com intervalo mín/máx, e umidade média com intervalo mín/máx, calculados sobre todos os registros do histórico.
- **Timeline da lâmpada** — faixa horizontal de blocos coloridos (amarelo = ligada, escuro = desligada) seguida de uma lista com o rótulo e horário exato de cada acionamento, tornando a sequência de eventos intuitiva de ler.
- **Gráficos de linha** — variação de temperatura (vermelho) e umidade (azul) ao longo do tempo, com curva suavizada e até 10 pontos amostrados do histórico.

---

## 📌 Considerações Finais

- O broker HiveMQ Cloud utilizado é o plano gratuito, adequado para fins de **desenvolvimento e estudo**.
- O histórico é armazenado **localmente no dispositivo** — cada celular tem seu próprio histórico independente.
- O limite máximo de entradas no histórico é configurável pela constante `MAX_ENTRIES` em `historyService.js`.
- Ao abrir o app, os últimos valores conhecidos são restaurados automaticamente do histórico, sem depender de nova mensagem do broker.
- Para testar localmente sem celular, é possível usar um emulador Android/iOS junto com o Expo.

---

## 👩‍💻 Autora

*Nome:* [Beatriz V. Xavier](https://github.com/Bea-Xavier)

---

## 📄 Licença

Este projeto é desenvolvido apenas para fins acadêmicos e de estudo. 🚀