import { useState, useEffect, useRef, useCallback } from 'react';

export function useWebSocket(expenseId, accessToken) {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const wsRef = useRef(null);
  const retryCount = useRef(0);
  const maxRetries = 3;

  const connect = useCallback(() => {
    if (!expenseId || !accessToken) return;

    setConnectionStatus('connecting');
    const httpUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
    const wsBaseUrl = httpUrl.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/ws/chat/${expenseId}/?token=${accessToken}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnectionStatus('connected');
      retryCount.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_history') {
          setMessages(data.messages || []);
        } else if (data.type === 'chat_message') {
          setMessages((prev) => [...prev, data]);
        }
      } catch (err) {
        console.error('WebSocket message parsing error', err);
      }
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      if (retryCount.current < maxRetries) {
        retryCount.current += 1;
        setTimeout(connect, 3000);
      }
    };

    ws.onerror = (err) => {
      // Ignore errors if the socket is being closed intentionally during connecting
      if (ws.readyState !== WebSocket.CLOSING && ws.readyState !== WebSocket.CLOSED) {
        console.error('WebSocket encountered an error:', err);
      }
    };

    wsRef.current = ws;
  }, [expenseId, accessToken]);

  useEffect(() => {
    setMessages([]);
    retryCount.current = 0;
    connect();

    return () => {
      if (wsRef.current) {
        const socket = wsRef.current;
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => socket.close();
        } else {
          socket.close();
        }
      }
    };
  }, [connect]);

  const sendMessage = useCallback((text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ message: text }));
    }
  }, []);

  return { messages, sendMessage, connectionStatus };
}
