import { useState, useEffect, useCallback } from 'react';
import Sidebar, { SidebarToggle } from './components/Sidebar';
import ChatArea from './components/ChatArea';
import MessageInput from './components/MessageInput';
import { useModels } from './hooks/useModels';
import { useConversations } from './hooks/useConversations';
import { useChat } from './hooks/useChat';

export default function App() {
  const { models, loading: modelsLoading } = useModels();
  const {
    conversations,
    activeId,
    activeConversation,
    setActiveId,
    createConversation,
    updateConversation,
    deleteConversation,
    setMessages: setConvMessages,
  } = useConversations();

  const [selectedModel, setSelectedModel] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  // Auto-select first model once loaded
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  // Current messages from active conversation
  const messages = activeConversation?.messages || [];

  const setMessages = useCallback(
    (msgs) => {
      if (activeId) {
        setConvMessages(activeId, msgs);
      }
    },
    [activeId, setConvMessages]
  );

  const currentModel = activeConversation?.model || selectedModel;

  const { isStreaming, error, metadata, sendMessage, regenerate, stopStreaming, clearChat } =
    useChat({
      messages,
      setMessages,
      model: currentModel,
    });

  const handleNewChat = useCallback(() => {
    createConversation(selectedModel);
    setSidebarOpen(false);
  }, [createConversation, selectedModel]);

  const handleSend = useCallback(
    (content) => {
      // Auto-create conversation if none active
      if (!activeId) {
        createConversation(selectedModel);
        setPendingMessage(content);
        return;
      }
      sendMessage(content);
    },
    [activeId, createConversation, selectedModel, sendMessage]
  );

  // Process pending message once activeId becomes available
  useEffect(() => {
    if (activeId && pendingMessage) {
      sendMessage(pendingMessage);
      setPendingMessage(null);
    }
  }, [activeId, pendingMessage, sendMessage]);

  const handleModelChange = useCallback(
    (model) => {
      setSelectedModel(model);
      if (activeId) {
        updateConversation(activeId, { model });
      }
    },
    [activeId, updateConversation]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      // Cmd+K or Ctrl+K → new chat
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        handleNewChat();
      }
      // Cmd+Shift+Backspace → clear chat
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Backspace') {
        e.preventDefault();
        clearChat();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewChat, clearChat]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-primary)]">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={handleNewChat}
        onDelete={deleteConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-border)] md:hidden">
          <SidebarToggle onClick={() => setSidebarOpen(true)} />
          <span className="text-sm font-medium text-[var(--color-text-secondary)] truncate">
            {activeConversation?.title || 'LocalGPT'}
          </span>
          <div className="w-8" /> {/* spacer for centering */}
        </div>

        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          error={error}
          metadata={metadata}
          onRegenerate={regenerate}
          model={currentModel}
        />

        <MessageInput
          onSend={handleSend}
          isStreaming={isStreaming}
          onStop={stopStreaming}
          disabled={!selectedModel}
          models={models}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
        />
      </main>
    </div>
  );
}
