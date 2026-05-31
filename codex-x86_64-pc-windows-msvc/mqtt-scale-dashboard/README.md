# MQTT 电子秤读数前端

Vue 3 + TypeScript + Naive UI + UnoCSS + mqtt.js 实时读数面板。

## 运行

```bash
npm install
npm run dev
```

访问 `http://localhost:5173/`。

## 环境配置

复制 `.env.example` 为 `.env`，按实际 MQTT 服务修改：

```bash
VITE_MQTT_PROTOCOL=ws
VITE_MQTT_URL=ws://127.0.0.1:8083/mqtt
VITE_MQTT_HOST=127.0.0.1
VITE_MQTT_PORT=8083
VITE_MQTT_PATH=/mqtt
VITE_MQTT_TOPIC=scale/weight
VITE_MQTT_USERNAME=
VITE_MQTT_PASSWORD=
```

生产环境配置放在 `.env.production`。默认示例使用 `wss`：

```bash
VITE_MQTT_PROTOCOL=wss
VITE_MQTT_URL=wss://example.com:8084/mqtt
VITE_MQTT_HOST=example.com
VITE_MQTT_PORT=8084
VITE_MQTT_PATH=/mqtt
VITE_MQTT_TOPIC=scale/weight
```

页面顶部可以直接修改完整的 WebSocket 连接地址，实际连接会使用这个地址。下面的服务器 IP / 域名、端口、路径用于快速生成地址，点击“使用此地址”会回填到连接地址输入框。连接失败或订阅失败时，错误消息会展示在 MQTT 连接卡片和页面告警中。

## 浏览器为什么要用 WebSocket

浏览器前端不能直接打开原生 TCP 连接，所以不能直接连接 MQTT 标准端口：

```text
mqtt://host:1883
mqtts://host:8883
```

前端应连接 MQTT Broker 提供的 MQTT over WebSocket 地址，例如：

```text
ws://host:8083/mqtt
wss://host:8084/mqtt
```

示例：

```ts
mqtt.connect('ws://127.0.0.1:8083/mqtt');
```

如果 MQTT 服务只有 `1883` 端口，有两种做法：

1. 在 Broker 上开启 MQTT over WebSocket，例如 EMQX、Mosquitto、HiveMQ 都支持。
2. 做后端中转：前端连接你的后端 WebSocket、SSE 或 HTTP，后端再用原生 MQTT 连接 `1883` 并转发消息。

生产环境建议使用 `wss://your-domain/mqtt`，避免 HTTPS 页面被浏览器拦截非安全连接。

## 支持的消息格式

纯文本：

```text
12.35 kg
```

JSON：

```json
{ "weight": 12.35, "unit": "kg" }
```

也会尝试读取 `value`、`net`、`gross`、`stableWeight`、`data` 字段。
