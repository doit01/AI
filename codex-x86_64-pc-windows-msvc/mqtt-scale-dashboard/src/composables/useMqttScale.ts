import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';
import { computed, onBeforeUnmount, reactive, ref } from 'vue';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'error' | 'closed';
export type MqttProtocol = 'ws' | 'wss';

export interface MqttScaleConfig {
  url: string;
  protocol: MqttProtocol;
  host: string;
  port: string;
  path: string;
  topic: string;
  username?: string;
  password?: string;
}

export interface ScaleReading {
  value: number | null;
  unit: string;
  raw: string;
  topic: string;
  receivedAt: Date;
}

const KNOWN_WEIGHT_KEYS = ['weight', 'value', 'net', 'gross', 'stableWeight', 'data'];
const KNOWN_UNIT_KEYS = ['unit', 'units'];

function firstNumber(input: unknown): number | null {
  if (typeof input === 'number' && Number.isFinite(input)) {
    return input;
  }

  if (typeof input !== 'string') {
    return null;
  }

  const match = input.match(/-?\d+(?:\.\d+)?/);
  if (!match) {
    return null;
  }

  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseScalePayload(raw: string, topic: string): ScaleReading {
  let value = firstNumber(raw);
  let unit = 'kg';

  try {
    const payload = JSON.parse(raw) as Record<string, unknown>;

    for (const key of KNOWN_WEIGHT_KEYS) {
      if (key in payload) {
        value = firstNumber(payload[key]);
        break;
      }
    }

    for (const key of KNOWN_UNIT_KEYS) {
      if (typeof payload[key] === 'string' && payload[key]) {
        unit = payload[key];
        break;
      }
    }
  } catch {
    const unitMatch = raw.match(/\b(kg|g|t|lb|oz)\b/i);
    if (unitMatch) {
      unit = unitMatch[1].toLowerCase();
    }
  }

  return {
    value,
    unit,
    raw,
    topic,
    receivedAt: new Date(),
  };
}

function normalizePath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) {
    return '';
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function buildMqttUrl(config: Pick<MqttScaleConfig, 'protocol' | 'host' | 'port' | 'path'>) {
  const protocol = config.protocol || 'ws';
  const host = config.host.trim();
  const port = config.port.trim();
  const path = normalizePath(config.path);
  return `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
}

function getDefaultUrl(config: Pick<MqttScaleConfig, 'protocol' | 'host' | 'port' | 'path'>) {
  return import.meta.env.VITE_MQTT_URL || buildMqttUrl(config);
}

export function useMqttScale() {
  const client = ref<MqttClient | null>(null);
  const status = ref<ConnectionStatus>('idle');
  const errorMessage = ref('');
  const currentReading = ref<ScaleReading | null>(null);
  const messages = ref<ScaleReading[]>([]);

  const baseConfig = {
    protocol: (import.meta.env.VITE_MQTT_PROTOCOL as MqttProtocol | undefined) || 'ws',
    host: import.meta.env.VITE_MQTT_HOST || '127.0.0.1',
    port: import.meta.env.VITE_MQTT_PORT || '8083',
    path: import.meta.env.VITE_MQTT_PATH || '/mqtt',
  };

  const config = reactive<MqttScaleConfig>({
    ...baseConfig,
    url: getDefaultUrl(baseConfig),
    topic: import.meta.env.VITE_MQTT_TOPIC || 'scale/weight',
    username: import.meta.env.VITE_MQTT_USERNAME || '',
    password: import.meta.env.VITE_MQTT_PASSWORD || '',
  });

  const connectionUrl = computed(() => config.url.trim());
  const quickBuildUrl = computed(() => buildMqttUrl(config));
  const isConnected = computed(() => status.value === 'connected');
  const latestDisplay = computed(() => {
    if (!currentReading.value || currentReading.value.value === null) {
      return '--';
    }

    return new Intl.NumberFormat('zh-CN', {
      maximumFractionDigits: 3,
      minimumFractionDigits: 0,
    }).format(currentReading.value.value);
  });

  function disconnect() {
    if (!client.value) {
      status.value = 'closed';
      return;
    }

    client.value.end(true);
    client.value = null;
    status.value = 'closed';
  }

  function connect(nextConfig?: Partial<MqttScaleConfig>) {
    Object.assign(config, nextConfig);
    errorMessage.value = '';

    if (!connectionUrl.value || !config.topic.trim()) {
      status.value = 'error';
      errorMessage.value = 'MQTT WebSocket 连接地址和订阅主题不能为空';
      return;
    }

    if (!/^wss?:\/\//i.test(connectionUrl.value)) {
      status.value = 'error';
      errorMessage.value = '浏览器端 MQTT 地址必须以 ws:// 或 wss:// 开头';
      return;
    }

    if (client.value) {
      client.value.end(true);
      client.value = null;
    }

    status.value = 'connecting';

    const options: IClientOptions = {
      clean: true,
      connectTimeout: 8_000,
      reconnectPeriod: 3_000,
      clientId: `scale-web-${Math.random().toString(16).slice(2, 10)}`,
    };

    if (config.username) {
      options.username = config.username;
    }
    if (config.password) {
      options.password = config.password;
    }

    const nextClient = mqtt.connect(connectionUrl.value, options);
    client.value = nextClient;

    nextClient.on('connect', () => {
      status.value = 'connected';
      nextClient.subscribe(config.topic, { qos: 0 }, (error) => {
        if (error) {
          errorMessage.value = `订阅失败：${error.message}`;
          status.value = 'error';
        }
      });
    });

    nextClient.on('reconnect', () => {
      status.value = 'reconnecting';
    });

    nextClient.on('close', () => {
      if (status.value !== 'closed') {
        status.value = 'closed';
      }
    });

    nextClient.on('error', (error) => {
      errorMessage.value = `连接失败：${error.message}`;
      status.value = 'error';
    });

    nextClient.on('message', (topic, payload) => {
      const reading = parseScalePayload(payload.toString(), topic);
      currentReading.value = reading;
      messages.value = [reading, ...messages.value].slice(0, 20);
    });
  }

  onBeforeUnmount(disconnect);

  return {
    config,
    status,
    errorMessage,
    currentReading,
    messages,
    connectionUrl,
    quickBuildUrl,
    isConnected,
    latestDisplay,
    connect,
    disconnect,
  };
}
