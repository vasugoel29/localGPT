import { useState, useRef, useCallback } from 'react';
import { streamChat } from '../services/api';

export function useChat({ messages, setMessages, model }) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (content) => {
      if (!content.trim() || !model) return;

      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      const userMessage = { id: crypto.randomUUID(), role: 'user', content: content.trim() };
      const assistantId = crypto.randomUUID();
      
      let newMessages = [];
      setMessages((prev) => {
        // Compute new messages to send to streamChat based on actual current state
        newMessages = [...prev, userMessage];
        return [...newMessages, { id: assistantId, role: 'assistant', content: '' }];
      });

      setIsStreaming(true);
      setError(null);
      setMetadata(null);

      let assistantContent = '';

      await streamChat(
        model,
        newMessages,
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
    if (messages.length < 2) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const lastMsg = messages[messages.length - 1];
    const withoutLast = lastMsg?.role === 'assistant' ? messages.slice(0, -1) : messages;
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
  }, [messages, model, setMessages]);

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
