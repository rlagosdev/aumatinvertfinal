import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Minimize2, Sparkles, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../supabase/client';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatbotAdmin: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Charger l'état depuis localStorage
  const [isOpen, setIsOpen] = useState(() => {
    const saved = localStorage.getItem('chatbot_admin_isOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    const saved = localStorage.getItem('chatbot_admin_isMinimized');
    return saved ? JSON.parse(saved) : false;
  });
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chatbot_admin_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }));
      } catch {
        // Si erreur, utiliser le message par défaut
      }
    }
    return [
      {
        role: 'assistant',
        content: 'Bonjour ! 👋 Je suis Au Matin Vert Admin AI, votre assistant de gestion. Je peux vous aider avec votre business, votre marketing, la gestion de l\'application ou toute question administrative. Comment puis-je vous aider ?',
        timestamp: new Date()
      }
    ];
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(true);
  const [isChatbotEnabled, setIsChatbotEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Vérifier si l'utilisateur est admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || profile?.role !== 'admin') {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }
    };

    checkAdmin();
  }, [user]);

  // Charger la clé API et l'état d'activation depuis la base de données
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['chatbot_api_key', 'chatbot_admin_enabled']);

        if (error) {
          console.warn('Erreur lors du chargement des paramètres:', error);
        } else if (data) {
          const apiKeySetting = data.find(s => s.setting_key === 'chatbot_api_key');
          const enabledSetting = data.find(s => s.setting_key === 'chatbot_admin_enabled');

          if (apiKeySetting?.setting_value) {
            setApiKey(apiKeySetting.setting_value);
          }

          // Chatbot admin désactivé par défaut si le paramètre n'existe pas
          setIsChatbotEnabled(enabledSetting?.setting_value === 'true');
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoadingApiKey(false);
      }
    };

    fetchSettings();
  }, []);

  // Auto-scroll vers le bas quand un nouveau message arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Sauvegarder l'état isOpen dans localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_admin_isOpen', JSON.stringify(isOpen));
  }, [isOpen]);

  // Sauvegarder l'état isMinimized dans localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_admin_isMinimized', JSON.stringify(isMinimized));
  }, [isMinimized]);

  // Sauvegarder les messages dans localStorage
  useEffect(() => {
    localStorage.setItem('chatbot_admin_messages', JSON.stringify(messages));
  }, [messages]);

  // Focus sur l'input quand on ouvre le chat
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Vérifier que la clé API est configurée
    if (!apiKey) {
      toast.error('Clé API non configurée. Veuillez configurer la clé dans les paramètres.');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Appel à l'Edge Function ADMIN
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/chatbot-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          userMessage: inputMessage,
          apiKey: apiKey
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec l\'assistant');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chatbot error:', error);
      toast.error('Erreur : ' + error.message);

      // Message d'erreur de fallback
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Désolé, je rencontre un problème technique. Veuillez réessayer dans quelques instants.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = () => {
    const initialMessage: Message = {
      role: 'assistant',
      content: 'Bonjour ! 👋 Je suis Au Matin Vert Admin AI, votre assistant de gestion. Je peux vous aider avec votre business, votre marketing, la gestion de l\'application ou toute question administrative. Comment puis-je vous aider ?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    toast.success('Historique de conversation effacé');
  };

  // Ne pas afficher le chatbot si :
  // - En cours de chargement
  // - Pas de clé API configurée
  // - Chatbot désactivé dans les paramètres
  // - Utilisateur n'est pas admin
  // - PAS sur une page admin
  const isAdminPage = location.pathname.startsWith('/admin');

  // Debug logs
  console.log('🤖 ChatbotAdmin Debug:', {
    isLoadingApiKey,
    hasApiKey: !!apiKey,
    isChatbotEnabled,
    isAdmin,
    isAdminPage,
    pathname: location.pathname,
    user: user?.email
  });

  if (isLoadingApiKey || !apiKey || !isChatbotEnabled || !isAdmin || !isAdminPage) {
    console.log('❌ ChatbotAdmin masqué car:', {
      'En chargement': isLoadingApiKey,
      'Pas de clé API': !apiKey,
      'Chatbot désactivé': !isChatbotEnabled,
      'Pas admin': !isAdmin,
      'Pas sur page admin': !isAdminPage
    });
    return null;
  }

  if (!isOpen) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2" style={{ zIndex: 9999 }}>
        {/* Zone de détection de survol élargie */}
        <div className="relative group">
          {/* Zone invisible pour détecter le survol - 75px de large */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[75px] h-[250px] pointer-events-auto"></div>

          {/* Languette qui apparaît au survol */}
          <button
            onClick={() => setIsOpen(true)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:translate-x-0 hover:shadow-2xl text-white px-4 py-10 rounded-l-2xl shadow-lg transition-all duration-300 flex flex-col items-center gap-3 pointer-events-auto"
            title="Ouvrir l'assistant Admin"
            style={{
              minWidth: '60px',
              background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
            }}
          >
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div
              className="text-xs font-semibold whitespace-nowrap tracking-wide"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              Admin AI
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6" style={{ zIndex: 9999 }}>
        <button
          onClick={() => setIsMinimized(false)}
          className="text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
          }}
        >
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">Admin AI</span>
          {messages.length > 1 && (
            <span className="px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
              {messages.length - 1}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border border-zinc-200" style={{ zIndex: 9999 }}>
      {/* Header */}
      <div className="p-4 rounded-t-2xl flex items-center justify-between" style={{
        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
      }}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white bg-opacity-20 rounded-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Au Matin Vert Admin AI</h3>
            <p className="text-xs text-white/70">Propulsé par Claude</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 1 && (
            <button
              onClick={clearHistory}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              title="Effacer l'historique"
            >
              <Trash2 className="h-4 w-4 text-white" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Réduire"
          >
            <Minimize2 className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
            title="Fermer"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                message.role === 'user'
                  ? 'text-white'
                  : 'bg-zinc-100 text-zinc-800'
              }`}
              style={message.role === 'user' ? {
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
              } : {}}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-white/70' : 'text-zinc-500'
              }`}>
                {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-zinc-100 text-zinc-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 text-sm"
            style={{
              focusRing: '2px solid #10b981'
            }}
            disabled={isTyping}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="p-2 disabled:bg-zinc-300 text-white rounded-lg transition-colors"
            style={{
              background: inputMessage.trim() && !isTyping
                ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                : undefined
            }}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Appuyez sur Entrée pour envoyer
        </p>
      </div>
    </div>
  );
};

export default ChatbotAdmin;
