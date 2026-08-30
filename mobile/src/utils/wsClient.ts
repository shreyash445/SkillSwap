import { API_URL } from "@/api";
import { getToken } from "@/api";

type MessageHandler = (message: any) => void;

class WsClient {
  private ws: WebSocket | null = null;
  private exchangeId: string = "";
  private onMessage: MessageHandler | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect(exchangeId: string, onMessage: MessageHandler) {
    this.disconnect();
    this.exchangeId = exchangeId;
    this.onMessage = onMessage;
    this.reconnectAttempts = 0;

    const token = await getToken();
    if (!token) return;

    const wsUrl = API_URL.replace(/^http/, "ws").replace("/api", "");
    const url = `${wsUrl}/ws/chat/${exchangeId}/?token=${token}`;

    this.ws = new WebSocket(url);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.onMessage?.(data);
      } catch {
        /* ignore */
      }
    };

    this.ws.onclose = () => {
      this.tryReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  send(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ content }));
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectTimer = setTimeout(() => {
      this.connect(this.exchangeId, this.onMessage!);
    }, delay);
  }
}

export const wsClient = new WsClient();
