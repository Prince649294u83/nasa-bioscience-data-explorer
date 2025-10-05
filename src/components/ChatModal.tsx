'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/app/page.module.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai' | 'web_search_result';
  content: string;
}

export default function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: `**Welcome to BIOSPACE AI - Space Biology Research**

I specialize in NASA space biology research with access to 608 publications.

**I can help you with:**
• Effects of microgravity on human physiology
• Radiation exposure in space
• Muscle atrophy and bone loss countermeasures
• Plant growth in space environments
• Cardiovascular changes during spaceflight
• Immune system responses to microgravity

*Ask me a question about space biology research!*`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to handle sending a message for RAG or Web Search
  const sendMessage = async (userMessage: string, searchType: 'rag' | 'web') => {
    setInput('');
    setIsLoading(true);
   
    // Add a temporary AI message slot for the stream
    const streamIndex = messages.length + 1;
    setMessages((prev) => [...prev, { role: searchType === 'web' ? 'web_search_result' : 'ai', content: '' }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, searchType })
      });

      if (!response.body) {
        throw new Error('Response body is null (Streaming failed).');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        fullResponse += chunk;

        setMessages(prevMessages => {
          return prevMessages.map((msg, index) => {
            if (index === streamIndex) {
              return { ...msg, content: fullResponse };
            }
            return msg;
          });
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => {
        const fallbackMessage = { role: 'ai' as const, content: 'Sorry, I encountered a communication error. Please try again.' };
        return prev.length > streamIndex 
          ? prev.map((msg, index) => index === streamIndex ? fallbackMessage : msg)
          : [...prev, fallbackMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Handlers for User Actions ---

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    sendMessage(userMessage, 'rag');
  };

  const handleWebSearch = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage + " (Web Search)" }]);
    sendMessage(userMessage, 'web');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessage = (content: string, role: Message['role']) => {
    let formattedContent = content
      .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/• /g, '&bull; ')
      .split('\n')
      .join('<br/>');

    if (role === 'web_search_result') {
      return `<strong>🌐 Web Search Results:</strong><br/>` + formattedContent;
    }

    return formattedContent;
  };

  if (!isOpen) return null;

  return (
    <div className={styles.chatModal} data-open={isOpen ? 'true' : 'false'}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <h3>🤖 AI Research Assistant (Powered by Google Gemini)</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </div>

        <div className={styles.chatMessages}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage} ${msg.role === 'web_search_result' ? styles.webSearchResult : ''}`}
            >
              <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content, msg.role) }} />
            </div>
          ))}
          {isLoading && messages[messages.length - 1]?.content.length === 0 && (
            <div className={`${styles.message} ${styles.aiMessage}`}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className={styles.chatInputContainer}>
          <input
            type="text"
            placeholder="Ask about microgravity, radiation, or space biology research..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={isLoading || !input.trim()}>
            Send (Research)
          </button>
          <button className={styles.webSearchBtn} onClick={handleWebSearch} disabled={isLoading || !input.trim()}>
            Search Web 🌐
          </button>
        </div>
      </div>
    </div>
  );
}