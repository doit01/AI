/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MQTT_URL?: string;
  readonly VITE_MQTT_PROTOCOL?: 'ws' | 'wss';
  readonly VITE_MQTT_HOST?: string;
  readonly VITE_MQTT_PORT?: string;
  readonly VITE_MQTT_PATH?: string;
  readonly VITE_MQTT_TOPIC?: string;
  readonly VITE_MQTT_USERNAME?: string;
  readonly VITE_MQTT_PASSWORD?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
