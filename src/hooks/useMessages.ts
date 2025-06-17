
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const useMessages = (userName: string) => {
  const getInitialMessages = (): Message[] => [
    {
      id: '1',
      content: `Olá ${userName}! Sou seu assistente especializado em análise de fórmulas de manipulação farmacêutica.

Escolha uma das opções abaixo para começar:

<quick-action>analise</quick-action>

<quick-action>formulas-cadastradas</quick-action>

<quick-action>sugestao-formulas</quick-action>`,
      role: 'assistant',
      timestamp: new Date()
    }
  ];

  const [messages, setMessages] = useState<Message[]>(getInitialMessages());
  const [conversationMode, setConversationMode] = useState<'initial' | 'analysis'>('initial');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const resetMessages = () => {
    setMessages(getInitialMessages());
    setConversationMode('initial');
  };

  return {
    messages,
    setMessages,
    conversationMode,
    setConversationMode,
    messagesEndRef,
    addMessage,
    resetMessages
  };
};
