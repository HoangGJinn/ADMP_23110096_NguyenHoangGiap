/**
 * Socket Service - STOMP over WebSocket
 *
 * Sử dụng @stomp/stompjs để kết nối đến Spring Boot WebSocket server.
 * WS_URL endpoint: ws://10.0.2.2:8085/ws-native
 */
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WS_URL } from './config';
import { getToken } from './storeRef';

class SocketService {
    private client: Client | null = null;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private connectPromise: Promise<void> | null = null;

    /**
     * Kết nối đến WebSocket server.
     * Nếu đã kết nối hoặc đang trong quá trình kết nối thì không tạo lại.
     */
    async connect(): Promise<void> {
        if (this.client?.connected) return;
        if (this.connectPromise) return this.connectPromise;

        this.connectPromise = new Promise<void>((resolve, reject) => {
            const token = getToken();

            this.client = new Client({
                brokerURL: WS_URL,
                connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
                reconnectDelay: 5000,
                // Bắt buộc cho React Native: xử lý đúng STOMP frame encoding
                forceBinaryWSFrames: true,
                appendMissingNULLOnIncoming: true,
                onConnect: () => {
                    console.log('✅ STOMP connected');
                    this.connectPromise = null;
                    resolve();
                },
                onStompError: (frame) => {
                    console.error('❌ STOMP error:', frame);
                    this.connectPromise = null;
                    reject(new Error(frame.headers['message'] || 'STOMP connection failed'));
                },
                onDisconnect: () => {
                    console.log('🔌 STOMP disconnected');
                },
                onWebSocketError: (event) => {
                    console.error('❌ WebSocket error:', event);
                    this.connectPromise = null;
                    reject(new Error('WebSocket connection error'));
                },
            });

            this.client.activate();
        });

        return this.connectPromise;
    }

    /**
     * Đăng ký nhận tin nhắn từ một destination (topic).
     * Tự động kết nối nếu chưa kết nối.
     */
    async subscribe<T = any>(destination: string, callback: (message: T) => void): Promise<void> {
        if (!this.client?.connected) {
            await this.connect();
        }

        // Tránh đăng ký trùng
        if (this.subscriptions.has(destination)) return;

        const sub = this.client!.subscribe(destination, (frame: IMessage) => {
            try {
                const parsed: T = JSON.parse(frame.body);
                callback(parsed);
            } catch (e) {
                console.error('Error parsing socket message:', e);
            }
        });

        this.subscriptions.set(destination, sub);
    }

    /**
     * Huỷ đăng ký nhận tin nhắn từ một destination.
     */
    unsubscribe(destination: string): void {
        const sub = this.subscriptions.get(destination);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(destination);
        }
    }

    /**
     * Gửi tin nhắn đến một destination.
     * Trả về true nếu gửi thành công, false nếu không thể kết nối.
     */
    async send(destination: string, body: object): Promise<boolean> {
        if (!this.client?.connected) {
            try {
                await this.connect();
            } catch {
                return false;
            }
        }

        if (!this.client?.connected) return false;

        try {
            this.client.publish({
                destination,
                body: JSON.stringify(body),
            });
            return true;
        } catch (e) {
            console.error('Error sending socket message:', e);
            return false;
        }
    }

    /**
     * Ngắt kết nối và dọn dẹp tất cả subscriptions.
     */
    disconnect(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();

        if (this.client) {
            this.client.deactivate();
            this.client = null;
        }

        this.connectPromise = null;
    }
}

const socketService = new SocketService();
export default socketService;
