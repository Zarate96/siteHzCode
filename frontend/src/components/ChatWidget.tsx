'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { api } from '@/services/api';

// ------------------------------------------------------------------ //
// Types                                                                //
// ------------------------------------------------------------------ //
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// ------------------------------------------------------------------ //
// Helpers                                                              //
// ------------------------------------------------------------------ //
function getOrCreateSessionId(): string {
  const key = 'hz_chat_session';
  try {
    let id = sessionStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(key, id);
    }
    return id;
  } catch {
    // sessionStorage puede no estar disponible en SSR (no debería, pero por seguridad)
    return crypto.randomUUID();
  }
}

const GREETING: Message = {
  role: 'assistant',
  content: '¡Hola! Soy el asistente de hzcode.mx 👋\n¿En qué te puedo ayudar hoy?',
};

// ------------------------------------------------------------------ //
// Component                                                            //
// ------------------------------------------------------------------ //
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef<string>('');

  // Inicializar sessionId solo en el cliente
  useEffect(() => {
    sessionId.current = getOrCreateSessionId();
  }, []);

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus en el input al abrir el chat
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ---------------------------------------------------------------- //
  // Handlers                                                          //
  // ---------------------------------------------------------------- //
  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updatedMessages: Message[] = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // El historial que se envía al API excluye el saludo inicial del asistente
      // para no contaminar el contexto con un mensaje de bienvenida hardcodeado.
      const historyForApi = updatedMessages.slice(1);
      const reply = await api.sendChatMessage(text, historyForApi, sessionId.current);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo o contáctame directamente en hzcode.mx/cotizacion',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  // ---------------------------------------------------------------- //
  // Render                                                            //
  // ---------------------------------------------------------------- //
  return (
    <>
      {/* ── Burbuja flotante ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
        className={`
          fixed bottom-6 right-6 z-50
          flex items-center justify-center
          w-14 h-14 rounded-full shadow-lg
          bg-hzgold-500 hover:bg-hzgold-400
          text-[#050505]
          transition-all duration-300
          ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}
        `}
      >
        <MessageCircle size={26} />
      </button>

      {/* ── Ventana de chat ── */}
      <div
        className={`
          fixed bottom-6 right-6 z-50
          flex flex-col
          w-[calc(100vw-3rem)] max-w-sm sm:max-w-md
          h-[520px] sm:h-[560px]
          rounded-2xl shadow-2xl
          bg-[#111111] border border-gray-800
          overflow-hidden
          transition-all duration-300 origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-75 opacity-0 pointer-events-none'}
        `}
        role="dialog"
        aria-label="Chat con asistente de hzcode.mx"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0d0d0d] border-b border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hzgold-900 border border-hzgold-600 flex items-center justify-center">
              <MessageCircle size={14} className="text-hzgold-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white">Asistente hzcode.mx</p>
              <p className="text-xs text-gray-500">Responde sobre servicios y proyectos</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white transition-colors p-1 rounded"
            aria-label="Cerrar chat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line
                  ${msg.role === 'user'
                    ? 'bg-hzgold-600 text-white rounded-br-sm'
                    : 'bg-[#1a1a1a] text-gray-200 border border-gray-800 rounded-bl-sm'
                  }
                `}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                <Loader2 size={14} className="animate-spin text-hzgold-400" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-800 bg-[#0d0d0d] flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta..."
            disabled={isLoading}
            maxLength={500}
            className="
              flex-1 text-sm text-white placeholder-gray-600
              bg-[#1a1a1a] border border-gray-700
              rounded-full px-4 py-2
              focus:outline-none focus:border-hzgold-600
              disabled:opacity-50
              transition-colors
            "
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensaje"
            className="
              flex items-center justify-center
              w-9 h-9 rounded-full flex-shrink-0
              bg-hzgold-500 hover:bg-hzgold-400
              text-[#050505]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
