/**
 * API Configuration
 *
 * Android Emulator : dùng 10.0.2.2 thay cho localhost
 * Device thực      : dùng IP máy tính (ví dụ: 192.168.1.x)
 * Web              : dùng localhost
 */

import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Tự động detect môi trường ────────────────────────────────────────────────
const getBaseURL = () => {
  // Web platform
  if (Platform.OS === "web") {
    return "http://localhost:8085/api";
  }

  // Detect IP từ Metro bundler (Expo Dev Server)
  // @ts-ignore - manifest có thể undefined nhưng sẽ fallback
  const debuggerHost =
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost;
  let hostIP = "localhost";

  if (debuggerHost) {
    // debuggerHost format: "192.168.1.5:8081" hoặc "10.0.2.2:8081"
    hostIP = debuggerHost.split(":")[0];
  }

  if (Platform.OS === "android") {
    // Nếu là emulator (10.0.2.2) hoặc không detect được → dùng 10.0.2.2
    if (!debuggerHost || hostIP === "10.0.2.2" || hostIP === "localhost") {
      return "http://10.0.2.2:8085/api";
    }
    // Nếu detect được real IP → dùng IP đó (điện thoại thật)
    return `http://${hostIP}:8085/api`;
  }

  // iOS Simulator/Device
  if (Platform.OS === "ios") {
    if (debuggerHost && hostIP !== "localhost") {
      return `http://${hostIP}:8085/api`;
    }
    return "http://localhost:8085/api";
  }

  // Fallback
  return "http://localhost:8085/api";
};

const getWebSocketURL = () => {
  const baseURL = getBaseURL();
  const wsProtocol = baseURL.startsWith("https") ? "wss" : "ws";
  const host = baseURL
    .replace("http://", "")
    .replace("https://", "")
    .replace("/api", "");
  return `${wsProtocol}://${host}/ws-native`;
};

// Base URL cho REST API
export const API_BASE_URL = getBaseURL();

// WebSocket endpoint (STOMP over WebSocket)
export const WS_URL = getWebSocketURL();

// Timeout cho HTTP request (ms)
export const REQUEST_TIMEOUT = 10000;

// Agora App ID (public, không phải secret)
export const AGORA_APP_ID = "133c97a0ac914538b2f00cd0547844e8";

// ─── Debug log (xóa sau khi test) ─────────────────────────────────────────────
console.log("🌐 Config loaded:", {
  platform: Platform.OS,
  debuggerHost: Constants.manifest?.debuggerHost,
  API_BASE_URL,
  WS_URL,
});
