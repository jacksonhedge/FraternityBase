/**
 * MessagesPanel Component
 * iMessage-style messaging interface that slides in from the right
 */

import { X, Send, Paperclip, ChevronLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sent: boolean; // true = sent by user, false = received
  timestamp: Date;
}

interface MessagesThread {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  unread: boolean;
}

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MessagesPanel({ isOpen, onClose }: MessagesPanelProps) {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock threads
  const threads: MessagesThread[] = [
    {
      id: 'prophetx',
      name: 'ProphetX',
      avatar: 'P',
      lastMessage: 'Welcome to ProphetX! How can we help?',
      unread: true
    }
  ];

  // Mock messages for ProphetX thread
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to ProphetX! How can we help?',
      sent: false,
      timestamp: new Date(Date.now() - 3600000)
    }
  ]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (selectedThread) {
          setSelectedThread(null);
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, selectedThread, onClose]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sent: true,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setMessageText('');

    // Simulate response after 1 second
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Thanks for reaching out! Our team will get back to you shortly.',
        sent: false,
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, response]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: 'var(--overlay)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)'
        }}
        onClick={onClose}
      />

      {/* Messages Panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col shadow-2xl animate-slide-in-right"
        style={{
          width: '25%',
          minWidth: '350px',
          maxWidth: '500px',
          backgroundColor: 'var(--surface)'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border)' }}
        >
          {selectedThread ? (
            <button
              onClick={() => setSelectedThread(null)}
              className="p-2 -ml-2 rounded-full transition-standard hover:opacity-70"
              style={{ backgroundColor: 'transparent' }}
            >
              <ChevronLeft size={20} style={{ color: 'var(--brand)' }} />
            </button>
          ) : (
            <div />
          )}

          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--text)' }}
          >
            {selectedThread ? threads.find(t => t.id === selectedThread)?.name : 'Messages'}
          </h2>

          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-full transition-standard hover:opacity-70"
            style={{ backgroundColor: 'transparent' }}
          >
            <X size={20} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Thread List */}
        {!selectedThread && (
          <div className="flex-1 overflow-y-auto">
            {threads.map((thread) => (
              <button
                key={thread.id}
                onClick={() => setSelectedThread(thread.id)}
                className="w-full flex items-center gap-3 px-4 py-4 border-b transition-standard hover:opacity-80"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: thread.unread ? 'var(--muted)' : 'transparent'
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, var(--brand) 0%, var(--accent) 100%)',
                    color: 'white'
                  }}
                >
                  {thread.avatar}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: 'var(--text)' }}
                    >
                      {thread.name}
                    </div>
                    {thread.unread && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--brand)' }}
                      />
                    )}
                  </div>
                  <div
                    className="text-xs truncate"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {thread.lastMessage}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Messages View */}
        {selectedThread && (
          <>
            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[75%]">
                    <div
                      className="px-4 py-2 rounded-2xl"
                      style={{
                        backgroundColor: message.sent ? 'var(--brand)' : 'var(--surface)',
                        color: message.sent ? 'white' : 'var(--text)',
                        borderRadius: message.sent
                          ? '18px 18px 4px 18px'
                          : '18px 18px 18px 4px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      <p className="text-sm leading-relaxed">{message.text}</p>
                    </div>
                    <div
                      className={`text-xs mt-1 px-2 ${
                        message.sent ? 'text-right' : 'text-left'
                      }`}
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              className="px-4 py-3 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div
                className="flex items-end gap-2 px-3 py-2 rounded-full border transition-standard focus-within:shadow-sm"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--surface)'
                }}
              >
                <button
                  className="p-1 rounded-full transition-standard hover:opacity-70"
                  style={{ backgroundColor: 'transparent' }}
                >
                  <Paperclip size={20} style={{ color: 'var(--text-muted)' }} />
                </button>

                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="iMessage"
                  rows={1}
                  className="flex-1 bg-transparent border-none outline-none resize-none text-sm py-1"
                  style={{ color: 'var(--text)', maxHeight: '100px' }}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="p-1.5 rounded-full transition-standard disabled:opacity-40"
                  style={{
                    backgroundColor: messageText.trim() ? 'var(--brand)' : 'transparent'
                  }}
                >
                  <Send
                    size={18}
                    style={{ color: messageText.trim() ? 'white' : 'var(--text-muted)' }}
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s cubic-bezier(0.2, 1.0, 0.2, 1.0);
        }
      `}</style>
    </>
  );
}
