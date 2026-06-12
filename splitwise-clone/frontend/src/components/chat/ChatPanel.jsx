import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';

const ChatPanel = ({ expense, onClose }) => {
  const { user, accessToken } = useAuth();
  const { messages, sendMessage, connectionStatus } = useWebSocket(expense?.id, accessToken);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!expense) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const statusColors = {
    connected: 'bg-emerald-500',
    connecting: 'bg-amber-500',
    disconnected: 'bg-rose-500',
    idle: 'bg-slate-500'
  };

  return (
    <div className={`fixed top-0 right-0 w-80 h-full bg-slate-800 border-l border-slate-700 shadow-2xl flex flex-col z-40 transform transition-transform duration-300 ${expense ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="bg-slate-900 border-b border-slate-700 p-4 flex justify-between items-center h-[73px]">
        <div>
          <h2 className="font-semibold text-white truncate max-w-[200px]">{expense.description}</h2>
          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono font-medium mt-1 inline-block">
            ₹{parseFloat(expense.total_amount).toFixed(2)}
          </span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white p-1">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar relative">
        <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-slate-900/80 rounded-full px-2 py-1 z-10 backdrop-blur-sm">
          <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]}`}></div>
          <span className="text-[10px] text-slate-300 uppercase tracking-wider">{connectionStatus}</span>
        </div>
        
        {messages.map((msg, idx) => {
          const isMe = msg.user_id === user?.id;
          const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] ${isMe ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' : 'bg-slate-700 text-slate-100 rounded-2xl rounded-tl-sm'} px-3 py-2 shadow-sm`}>
                <p className="text-sm break-words">{msg.message}</p>
                <div className={`text-[10px] mt-1 flex items-center ${isMe ? 'justify-end text-emerald-200' : 'justify-between text-slate-400'}`}>
                  {!isMe && <span className="font-medium mr-2 truncate max-w-[100px]">{msg.username}</span>}
                  <span>{time}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-slate-900 border-t border-slate-700 p-3">
        <form onSubmit={handleSend} className="flex space-x-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={connectionStatus !== 'connected'}
            placeholder={connectionStatus === 'connected' ? "Type a message..." : "Connecting..."}
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={connectionStatus !== 'connected' || !inputText.trim()}
            className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center min-w-[60px]"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
