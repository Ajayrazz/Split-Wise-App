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
    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL}/ws/chat/${expenseId}/?token=${accessToken}`;
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

    ws.onerror = () => {
      ws.close();
    };

    wsRef.current = ws;
  }, [expenseId, accessToken]);

  useEffect(() => {
    setMessages([]);
    retryCount.current = 0;
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
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
