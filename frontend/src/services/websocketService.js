import { Client } from '@stomp/stompjs';

/**
 * WebSocket Service using modern @stomp/stompjs Client
 * Communicates directly with Spring Boot STOMP broker at /ws via native WebSockets.
 */
class WebSocketService {
  constructor() {
    this.client = null;
    this.registeredSubscriptions = new Map(); // internalId -> { topic, callback }
    this.activeStompSubs = new Map(); // internalId -> StompSubscription
    this.connected = false;
    this.onConnectCallbacks = new Set();
    this.onErrorCallbacks = new Set();
  }

  connect(url = 'ws://localhost:8080/ws', onConnect, onError) {
    if (onConnect) this.onConnectCallbacks.add(onConnect);
    if (onError) this.onErrorCallbacks.add(onError);

    if (this.client && this.connected) {
      if (onConnect) {
        try {
          onConnect();
        } catch (e) {
          console.error('[WebSocket] onConnect error:', e);
        }
      }
      return;
    }

    if (this.client) {
      return;
    }

    // Convert http to ws URL if needed
    let brokerURL = url;
    if (brokerURL.startsWith('http://')) {
      brokerURL = brokerURL.replace('http://', 'ws://');
    } else if (brokerURL.startsWith('https://')) {
      brokerURL = brokerURL.replace('https://', 'wss://');
    }

    this.client = new Client({
      brokerURL: brokerURL,
      reconnectDelay: 3000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        this.connected = true;
        console.log('[WebSocket] STOMP connected to broker:', brokerURL);

        // Re-establish all registered subscriptions upon connect or reconnect
        this.registeredSubscriptions.forEach(({ topic, callback }, internalId) => {
          try {
            const stompSub = this.client.subscribe(topic, (message) => {
              try {
                const data = JSON.parse(message.body);
                callback(data);
              } catch (err) {
                callback(message.body);
              }
            });
            this.activeStompSubs.set(internalId, stompSub);
            console.log(`[WebSocket] Subscribed to ${topic} (${internalId})`);
          } catch (e) {
            console.error(`[WebSocket] Failed to subscribe to ${topic}:`, e);
          }
        });

        // Trigger onConnect callbacks
        this.onConnectCallbacks.forEach((cb) => {
          try {
            cb(frame);
          } catch (e) {
            console.error('[WebSocket] Connect callback error:', e);
          }
        });
      },
      onStompError: (frame) => {
        console.error('[WebSocket] STOMP Broker error:', frame);
        this.onErrorCallbacks.forEach((cb) => {
          try { cb(frame); } catch (e) { console.error(e); }
        });
      },
      onWebSocketError: (event) => {
        console.warn('[WebSocket] Transport error (will retry):', event);
        this.onErrorCallbacks.forEach((cb) => {
          try { cb(event); } catch (e) { console.error(e); }
        });
      },
      onDisconnect: () => {
        this.connected = false;
        this.activeStompSubs.clear();
        console.log('[WebSocket] STOMP disconnected');
      }
    });

    this.client.activate();
  }

  subscribe(topic, callback) {
    const internalId = 'sub-' + Math.random().toString(36).substring(2, 9);
    this.registeredSubscriptions.set(internalId, { topic, callback });

    if (this.client && this.connected) {
      try {
        const stompSub = this.client.subscribe(topic, (message) => {
          try {
            const data = JSON.parse(message.body);
            callback(data);
          } catch (err) {
            callback(message.body);
          }
        });
        this.activeStompSubs.set(internalId, stompSub);
      } catch (e) {
        console.error(`[WebSocket] Error subscribing to ${topic}:`, e);
      }
    }

    return internalId;
  }

  unsubscribe(subscriptionId) {
    if (!subscriptionId) return;

    this.registeredSubscriptions.delete(subscriptionId);

    const stompSub = this.activeStompSubs.get(subscriptionId);
    if (stompSub) {
      try {
        if (typeof stompSub.unsubscribe === 'function') {
          stompSub.unsubscribe();
        }
      } catch (e) {
        console.warn('[WebSocket] Error unsubscribing:', e);
      }
      this.activeStompSubs.delete(subscriptionId);
    }
  }

  send(destination, message) {
    if (this.client && this.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('[WebSocket] Cannot send, client not connected');
    }
  }

  disconnect() {
    if (this.client) {
      this.activeStompSubs.forEach((sub) => {
        try {
          if (typeof sub.unsubscribe === 'function') sub.unsubscribe();
        } catch (e) {
          // ignore
        }
      });
      this.activeStompSubs.clear();
      this.registeredSubscriptions.clear();
      try {
        this.client.deactivate();
      } catch (e) {
        // ignore
      }
      this.client = null;
      this.connected = false;
    }
    this.onConnectCallbacks.clear();
    this.onErrorCallbacks.clear();
  }

  isConnected() {
    return this.connected;
  }
}

const websocketService = new WebSocketService();
export default websocketService;
