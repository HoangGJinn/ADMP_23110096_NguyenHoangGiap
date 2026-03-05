/**
 * API Configuration
 *
 * Android Emulator : dùng 10.0.2.2 thay cho localhost
 * Device thực      : dùng IP máy tính (ví dụ: 192.168.1.x)
 * Web              : dùng localhost
 */

// Base URL cho REST API
export const API_BASE_URL = 'http://10.0.2.2:8085/api';

// WebSocket endpoint (STOMP over WebSocket)
export const WS_URL = 'ws://10.0.2.2:8085/ws-native';

// Timeout cho HTTP request (ms)
export const REQUEST_TIMEOUT = 10000;
