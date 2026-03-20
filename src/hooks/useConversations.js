import { useState, useCallback, useEffect } from 'react';

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

function saveConversations(conversations) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function useConversations() {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [activeId, setActiveId] = useState(null);

  // Persist on change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

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

  const setMessages = useCallback((id, messages) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        // Auto-title from first user message
        const title =
          c.title === 'New Chat' && messages.length > 0
            ? messages.find((m) => m.role === 'user')?.content?.slice(0, 50) || 'New Chat'
            : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
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
