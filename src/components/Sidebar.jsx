import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  models,
  selectedModel,
  onModelChange,
  isOpen,
  onClose,
}) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-[280px] bg-[var(--color-bg-secondary)] flex flex-col
          border-r border-[var(--color-border)]
          transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-3 flex items-center justify-between">
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm font-medium flex-1 cursor-pointer"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            className="md:hidden ml-2 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Model Selector */}
        <div className="px-3 pb-3">
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm cursor-pointer"
            >
              <span className="truncate text-[var(--color-text-secondary)]">
                {selectedModel || 'Select model'}
              </span>
              <ChevronDown
                size={14}
                className={`text-[var(--color-text-muted)] transition-transform ${
                  modelDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {modelDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                {models.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-[var(--color-text-muted)]">
                    No models found
                  </div>
                ) : (
                  models.map((m) => (
                    <button
                      key={m.name}
                      onClick={() => {
                        onModelChange(m.name);
                        setModelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-bg-hover)] transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                        selectedModel === m.name
                          ? 'text-[var(--color-accent)] bg-[var(--color-bg-hover)]'
                          : 'text-[var(--color-text-secondary)]'
                      }`}
                    >
                      {m.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2">
          {conversations.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] text-xs mt-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-colors ${
                  activeId === conv.id
                    ? 'bg-[var(--color-bg-active)]'
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
              >
                <MessageSquare
                  size={14}
                  className="flex-shrink-0 text-[var(--color-text-muted)]"
                />
                <span className="flex-1 truncate text-sm text-[var(--color-text-secondary)]">
                  {conv.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-all cursor-pointer"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={13} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <p className="text-[10px] text-[var(--color-text-muted)] text-center">
            LocalGPT • Powered by Ollama
          </p>
        </div>
      </aside>
    </>
  );
}

// Hamburger button for mobile
export function SidebarToggle({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="md:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
      aria-label="Open sidebar"
    >
      <Menu size={20} />
    </button>
  );
}
