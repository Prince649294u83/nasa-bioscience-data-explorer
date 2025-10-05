'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatModal from './ChatModal';

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg hover:shadow-[0_0_40px_rgba(112,182,246,0.6)] transition-all duration-300 flex items-center justify-center group hover:scale-110"
        aria-label="Open AI Chat"
      >
        <MessageCircle className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
      </button>

      {/* Chat Modal */}
      <ChatModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}