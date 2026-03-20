import {
  Plus,
  MessageSquare,
  Trash2,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import SystemMonitor from './SystemMonitor';

export default function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isOpen,
  onClose,
}) {
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
        <div className="px-3 py-4 flex items-center justify-between">
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm font-medium flex-1 cursor-pointer"
          >
            <Plus size={16} />
            New Chat
          </button>
          <button
            className="md:hidden ml-2 p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 mt-1">
          {conversations.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] text-xs mt-8">
              No conversations yet
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.target !== e.currentTarget) return;
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(conv.id);
                    onClose();
                  }
                }}
                className={`group flex items-center gap-3 px-3 py-3 rounded-lg mb-1 cursor-pointer transition-colors ${
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
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 p-1 rounded hover:bg-[var(--color-bg-tertiary)] transition-all cursor-pointer"
                  aria-label="Delete conversation"
                >
                  <Trash2 size={13} className="text-[var(--color-text-muted)]" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[var(--color-border)] flex flex-col items-center gap-4">
          <SystemMonitor />
          <p className="text-[10px] text-[var(--color-text-muted)] text-center leading-relaxed">
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
