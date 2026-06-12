import { useState, useEffect, useCallback, useRef } from 'react';

const useWebSocket = (expenseId, accessToken) => {
  const [messages, setMessages] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('Connecting');
  const ws = useRef(null);

  useEffect(() => {
    if (!expenseId || !accessToken) return;

    const connect = () => {
      ws.current = new WebSocket(`${import.meta.env.VITE_WS_BASE_URL}/ws/chat/${expenseId}/?token=${accessToken}`);

      ws.current.onopen = () => {
        setConnectionStatus('Connected');
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat_history') {
          setMessages(data.messages);
        } else if (data.type === 'chat_message') {
          setMessages((prev) => [...prev, data]);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Disconnected');
        setTimeout(connect, 3000);
      };
      
      ws.current.onerror = () => {
        setConnectionStatus('Error');
        ws.current.close();
      };
    };

    connect();

    return () => {
      if (ws.current) {
        ws.current.onclose = null;
        ws.current.close();
      }
    };
  }, [expenseId, accessToken]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ message }));
    }
  }, []);

  return { messages, sendMessage, connectionStatus };
};

export default useWebSocket;
