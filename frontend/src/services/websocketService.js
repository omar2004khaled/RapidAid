import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

/**
 * WebSocket Service
 * Manages WebSocket connections using SockJS and STOMP
 */
class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.subscriptions = new Map();
    this.reconnectDelay = 5000;
    this.isConnecting = false;
    this.connectionUrl = null;
    this.onConnectCallbacks = [];
    this.onErrorCallbacks = [];
  }

  /**
   * Connect to WebSocket server
   * @param {string} url - WebSocket endpoint URL (default: http://localhost:8080/ws)
   * @param {function} onConnect - Callback when connection is established
   * @param {function} onError - Callback when connection error occurs
   */
  connect(url = 'http://localhost:8080/ws', onConnect, onError) {
    // If already connected, just call the onConnect callback
    if (this.stompClient && this.stompClient.connected) {
      console.log('[WebSocket] Already connected, executing callback');
      if (onConnect) onConnect();
      return;
    }

    // If connecting, queue the callbacks
    if (this.isConnecting) {
      console.log('[WebSocket] Connection in progress, queueing callbacks');
      if (onConnect) this.onConnectCallbacks.push(onConnect);
      if (onError) this.onErrorCallbacks.push(onError);
      return;
    }

    this.isConnecting = true;
    this.connectionUrl = url;
    if (onConnect) this.onConnectCallbacks.push(onConnect);
    if (onError) this.onErrorCallbacks.push(onError);

    // Pass a factory function instead of an instance for auto-reconnect support
    this.stompClient = Stomp.over(() => new SockJS(url));

    // Disable debug messages in production
    if (process.env.NODE_ENV === 'production') {
      this.stompClient.debug = () => {};
    }

    this.stompClient.connect(
      {},
      (frame) => {
        this.isConnecting = false;
        console.log('[WebSocket] Connected:', frame);
        
        // Execute all queued onConnect callbacks
        while (this.onConnectCallbacks.length > 0) {
          const callback = this.onConnectCallbacks.shift();
          try {
            callback(frame);
          } catch (error) {
            console.error('[WebSocket] Error in onConnect callback:', error);
          }
        }
      },
      (error) => {
        this.isConnecting = false;
        console.error('[WebSocket] Connection error:', error);
        
        // Execute all queued onError callbacks
        const errorCallbacks = [...this.onErrorCallbacks];
        this.onErrorCallbacks = [];
        errorCallbacks.forEach(callback => {
          try {
            callback(error);
          } catch (err) {
            console.error('[WebSocket] Error in onError callback:', err);
          }
        });
        
        // Auto-reconnect - but don't queue the callbacks again
        setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          // Clear old callbacks to avoid duplicates
          this.onConnectCallbacks = [];
          this.connect(this.connectionUrl);
        }, this.reconnectDelay);
      }
    );
  }

  /**
   * Subscribe to a topic
   * @param {string} topic - Topic path (e.g., '/topic/incidents')
   * @param {function} callback - Message handler callback
   * @returns {string} Subscription ID
   */
  subscribe(topic, callback) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('[WebSocket] Cannot subscribe: not connected');
      return null;
    }

    const subscription = this.stompClient.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
        callback(message.body);
      }
    });

    this.subscriptions.set(subscription.id, subscription);
    console.log(`[WebSocket] Subscribed to ${topic} with id ${subscription.id}`);
    return subscription.id;
  }

  /**
   * Unsubscribe from a topic
   * @param {string} subscriptionId - ID of the subscription to unsubscribe
   */
  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(subscriptionId);
      console.log(`[WebSocket] Unsubscribed subscription ${subscriptionId}`);
    }
  }

  /**
   * Send a message to a destination
   * @param {string} destination - Destination path (e.g., '/app/message')
   * @param {object} message - Message object to send
   */
  send(destination, message) {
    if (!this.stompClient || !this.stompClient.connected) {
      console.error('[WebSocket] Cannot send: not connected');
      return;
    }

    this.stompClient.send(destination, {}, JSON.stringify(message));
    console.log(`[WebSocket] Sent message to ${destination}`, message);
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.stompClient) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      // Disconnect
      this.stompClient.disconnect(() => {
        console.log('[WebSocket] Disconnected');
      });
      this.stompClient = null;
    }
    
    // Clear any queued callbacks
    this.onConnectCallbacks = [];
    this.onErrorCallbacks = [];
    this.isConnecting = false;
  }

  /**
   * Check if connected
   * @returns {boolean}
   */
  isConnected() {
    return this.stompClient && this.stompClient.connected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
