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

      const userMessage = { role: 'user', content: content.trim() };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsStreaming(true);
      setError(null);
      setMetadata(null);

      // We'll build the assistant response incrementally
      let assistantContent = '';
      const messagesWithAssistant = [...newMessages, { role: 'assistant', content: '' }];
      setMessages(messagesWithAssistant);

      abortRef.current = new AbortController();

      await streamChat(
        model,
        newMessages, // send history without the empty assistant placeholder
        (token) => {
          assistantContent += token;
          setMessages([
            ...newMessages,
            { role: 'assistant', content: assistantContent },
          ]);
        },
        (meta) => {
          setMetadata(meta);
          setIsStreaming(false);
        },
        (errMsg) => {
          setError(errMsg);
          setIsStreaming(false);
          // Remove empty assistant message on error
          if (!assistantContent) {
            setMessages(newMessages);
          }
        },
        abortRef.current.signal
      );
    },
    [messages, model, setMessages]
  );

  const regenerate = useCallback(async () => {
    if (messages.length < 2) return;

    // Remove last assistant message
    const withoutLast = messages.slice(0, -1);
    setMessages(withoutLast);
    setIsStreaming(true);
    setError(null);
    setMetadata(null);

    let assistantContent = '';
    setMessages([...withoutLast, { role: 'assistant', content: '' }]);

    abortRef.current = new AbortController();

    await streamChat(
      model,
      withoutLast,
      (token) => {
        assistantContent += token;
        setMessages([
          ...withoutLast,
          { role: 'assistant', content: assistantContent },
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
          setMessages(withoutLast);
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
