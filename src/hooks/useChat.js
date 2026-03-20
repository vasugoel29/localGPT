import { useState, useRef, useCallback, useEffect } from 'react';
import { streamChat } from '../services/api';

export function useChat({ messages, setMessages, model }) {
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

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !model) return;

      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      const userMessage = { id: crypto.randomUUID(), role: 'user', content: content.trim() };
      const assistantId = crypto.randomUUID();
      
      const newHistory = [...messagesRef.current, userMessage];

      setMessages((prev) => {
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
          setMessages((prev) => [
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
            setMessages((prev) => prev.slice(0, -1));
          }
        },
        abortRef.current.signal
      );
    },
    [model, setMessages]
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

    setMessages([...withoutLast, { id: assistantId, role: 'assistant', content: '' }]);
    setIsStreaming(true);
    setError(null);
    setMetadata(null);

    let assistantContent = '';

    await streamChat(
      model,
      withoutLast,
      (token) => {
        assistantContent += token;
        setMessages((prev) => [
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
          setMessages((prev) => prev.slice(0, -1));
        }
      },
      abortRef.current.signal
    );
  }, [model, setMessages]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setMetadata(null);
  }, [setMessages]);

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
