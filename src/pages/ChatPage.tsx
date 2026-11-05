import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_CONFIG } from '../config/api';
import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge';
import { useInternetReachability } from '../hooks/useInternetReachability';
import type { ChatMessage } from '../types';

const CHAT_HISTORY_KEY = 'chat_history';
const WS_RECONNECT_MS = 2_000;

// Helper to load chat history from localStorage
const loadChatHistory = (): ChatMessage[] => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: ChatMessage & { timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
    }
  } catch (e) {
    console.error('Failed to load chat history:', e);
  }
  return [];
};

// Helper to save chat history to localStorage
const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history:', e);
  }
};

export function ChatPage() {
  const { user } = useAuth();
  const hasInternet = useInternetReachability();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChatHistory());
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isWsOpen, setIsWsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const hasInternetRef = useRef(hasInternet);
  hasInternetRef.current = hasInternet;

  const canSend = hasInternet && isWsOpen;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Save messages to localStorage whenever they change
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!hasInternet) {
      setIsTyping(false);
    }
  }, [hasInternet]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token || !hasInternet) {
      setIsWsOpen(false);
      return;
    }

    const wsUrl = `${API_CONFIG.BASE_URL.replace('http', 'ws')}/ws/chat?token=${token}`;
    let cancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let activeWs: WebSocket | null = null;

    const attachHandlers = (ws: WebSocket) => {
      ws.onopen = () => {
        if (cancelled || wsRef.current !== ws) return;
        setIsWsOpen(true);
      };

      ws.onmessage = (event) => {
        if (cancelled || wsRef.current !== ws) return;
        const data = JSON.parse(event.data);

        if (data.type === 'chunk') {
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + data.content }
              ];
            }
            return prev;
          });
        } else if (data.type === 'done') {
          setIsTyping(false);
          const assistantMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.complete_response,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, assistantMessage]);
        } else if (data.type === 'error') {
          console.error('WebSocket error:', data.content);
          setIsTyping(false);
        }
      };

      ws.onerror = () => {
        if (cancelled || wsRef.current !== ws) return;
        setIsWsOpen(false);
      };

      ws.onclose = () => {
        if (cancelled) return;
        if (wsRef.current === ws) {
          wsRef.current = null;
          setIsWsOpen(false);
        }
        if (!cancelled && hasInternetRef.current) {
          reconnectTimer = setTimeout(connect, WS_RECONNECT_MS);
        }
      };
    };

    const connect = () => {
      if (cancelled || !hasInternetRef.current) return;

      activeWs?.close();
      const ws = new WebSocket(wsUrl);
      activeWs = ws;
      wsRef.current = ws;
      setIsWsOpen(false);
      attachHandlers(ws);
    };

    connect();

    return () => {
      cancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current = null;
      activeWs?.close();
      activeWs = null;
      setIsWsOpen(false);
    };
  }, [user, hasInternet]);

  const handleSend = async () => {
    if (!input.trim() || !canSend || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput('');
    setIsTyping(true);

    wsRef.current.send(JSON.stringify({ message: messageToSend }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header - hidden on mobile, shown on desktop */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-6 md:px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-[1fr_auto] items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6F42C1] to-[#8b5cf6] flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
              <p className="text-gray-500 mt-1">Message your health companion</p>
            </div>
          </div>
          <ConnectionStatusBadge isOnline={hasInternet} />
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="md:hidden flex justify-end">
            <ConnectionStatusBadge isOnline={hasInternet} />
          </div>
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                  {message.role === 'user' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  ) : (
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-[#6F42C1] text-white rounded-br-md'
                      : 'bg-white border border-gray-100 shadow-sm rounded-bl-md'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-1 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CairCompanion" className="w-full h-full object-cover" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-gray-400"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-above-nav md:!bottom-0 px-4 py-3 pointer-events-none">
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className="flex items-center gap-3 bg-white rounded-full shadow-lg shadow-black/10 border border-gray-100 p-1.5 pl-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message CairCompanion..."
              className="flex-1 h-9 bg-transparent focus:outline-none text-sm"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!input.trim() || !canSend}
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                input.trim()
                  ? 'bg-[#6F42C1] text-white shadow-md shadow-[#6F42C1]/30'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
