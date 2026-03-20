import { useState, useCallback, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'localgpt_conversations';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(conversations, setConversationsFallback) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error instanceof DOMException) {
      console.warn('LocalStorage quota exceeded, pruning old conversations');
      const pruned = conversations.slice(0, Math.max(1, Math.floor(conversations.length / 2)));
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
        if (setConversationsFallback) setConversationsFallback(pruned);
      } catch (retryErr) {
        console.error('Failed to save even after pruning:', retryErr);
      }
    } else {
      console.error('Failed to save conversations:', error);
    }
  }
}

export function useConversations() {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeId, setActiveId] = useState(null);

  // Persist on change
  useEffect(() => {
    const timer = setTimeout(() => {
      saveConversations(conversations, setConversations);
    }, 1000);
    return () => clearTimeout(timer);
  }, [conversations]);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  const createConversation = useCallback((model) => {
    const newConv = {
      id: generateId(),
      title: 'New Chat',
      model: model || '',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    return newConv;
  }, []);

  const updateConversation = useCallback((id, updates) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
      )
    );
  }, []);

  const deleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    setActiveId((currentId) => (currentId === id ? null : currentId));
  }, []);

  const setMessages = useCallback((id, messagesOrUpdater) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        
        // Evaluate if updater function was passed
        const newMessages = typeof messagesOrUpdater === 'function' 
          ? messagesOrUpdater(c.messages) 
          : messagesOrUpdater;

        // Auto-title from first user message
        const title =
          c.title === 'New Chat' && newMessages.length > 0
            ? newMessages.find((m) => m.role === 'user')?.content?.slice(0, 50) || 'New Chat'
            : c.title;
            
        return { ...c, messages: newMessages, title, updatedAt: Date.now() };
      })
    );
  }, []);

  return {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    setMessages,
  };
}
