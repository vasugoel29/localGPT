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

  // Auto-select first model once loaded
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  // Sync selectedModel UI strictly from current activeConversation when navigating records
  useEffect(() => {
    if (activeConversation?.model) {
      setSelectedModel(activeConversation.model);
    }
  }, [activeId, activeConversation?.model]);

  const currentModel = activeConversation?.model || selectedModel;
  const messages = activeConversation?.messages || [];

  const { isStreaming, error, metadata, sendMessage, regenerate, stopStreaming, clearChat } =
    useChat({
      messages,
      setMessages: setConvMessages,
      model: currentModel,
      activeId
    });

  const handleNewChat = useCallback(() => {
    createConversation(selectedModel);
    setSidebarOpen(false);
  }, [createConversation, selectedModel]);

  const handleSend = useCallback(
    (content) => {
      let currentActiveId = activeId;
      // Auto-create conversation strictly synchronously
      if (!currentActiveId) {
        const newConv = createConversation(selectedModel);
        currentActiveId = newConv.id;
      }
      sendMessage(content, currentActiveId);
    },
    [activeId, createConversation, selectedModel, sendMessage]
  );

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
