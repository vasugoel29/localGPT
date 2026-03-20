import { useState, useRef, useCallback, useEffect } from 'react';
import { streamChat } from '../services/api';

export function useChat({ messages, setMessages, model, activeId }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const abortRef = useRef(null);

  // Sync messages to a ref so they can be read synchronously inside callbacks
  // without depending on React's unpredictable eager updater evaluation.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Reset streaming UI bindings when switching chats securely
  useEffect(() => {
    setIsStreaming(false);
    setError(null);
    setMetadata(null);
  }, [activeId]);

  const sendMessage = useCallback(
    async (content, specificId = activeId) => {
      if (!content.trim() || !model) return;
      
      if (!specificId) {
        console.warn('[useChat] Dropping message, no valid conversation scope');
        return;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      const userMessage = { id: crypto.randomUUID(), role: 'user', content: content.trim() };
      const assistantId = crypto.randomUUID();
      
      const newHistory = [...messagesRef.current, userMessage];

      setMessages(specificId, (prev) => {
        return [...prev, userMessage, { id: assistantId, role: 'assistant', content: '' }];
      });

      setIsStreaming(true);
      setError(null);
      setMetadata(null);

      let assistantContent = '';

      await streamChat(
        model,
        newHistory,
        (token) => {
          assistantContent += token;
          setMessages(specificId, (prev) => [
            ...prev.slice(0, -1),
            { id: assistantId, role: 'assistant', content: assistantContent },
          ]);
        },
        (meta) => {
          setMetadata(meta);
          setIsStreaming(false);
        },
        (errMsg) => {
          setError(errMsg);
          setIsStreaming(false);
          if (!assistantContent) {
            setMessages(specificId, (prev) => prev.slice(0, -1));
          }
        },
        abortRef.current.signal
      );
    },
    [model, setMessages, activeId]
  );

  const regenerate = useCallback(async () => {
    const currentMessages = messagesRef.current;
    if (currentMessages.length < 2) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const lastMsg = currentMessages[currentMessages.length - 1];
    const withoutLast = lastMsg?.role === 'assistant' ? currentMessages.slice(0, -1) : currentMessages;
    const assistantId = crypto.randomUUID();

    setMessages(activeId, [...withoutLast, { id: assistantId, role: 'assistant', content: '' }]);
    setIsStreaming(true);
    setError(null);
    setMetadata(null);

    let assistantContent = '';

    await streamChat(
      model,
      withoutLast,
      (token) => {
        assistantContent += token;
        setMessages(activeId, (prev) => [
          ...prev.slice(0, -1),
          { id: assistantId, role: 'assistant', content: assistantContent },
        ]);
      },
      (meta) => {
        setMetadata(meta);
        setIsStreaming(false);
      },
      (errMsg) => {
        setError(errMsg);
        setIsStreaming(false);
        if (!assistantContent) {
          setMessages(activeId, (prev) => prev.slice(0, -1));
        }
      },
      abortRef.current.signal
    );
  }, [model, setMessages, activeId]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setMessages(activeId, []);
    setError(null);
    setMetadata(null);
  }, [setMessages, activeId]);

  return {
    isStreaming,
    error,
    metadata,
    sendMessage,
    regenerate,
    stopStreaming,
    clearChat,
  };
}
