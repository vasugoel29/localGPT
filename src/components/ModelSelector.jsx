import { useState } from 'react';
import { ChevronDown, Cpu } from 'lucide-react';

export default function ModelSelector({ models, selectedModel, onModelChange }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        title="Select Model"
      >
        <Cpu size={14} />
        <span className="truncate max-w-[120px]">{selectedModel || 'Select model'}</span>
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 min-w-[200px] max-h-60 overflow-y-auto">
            <div className="p-1">
              {models.length === 0 ? (
                <div className="px-3 py-2 text-sm text-[var(--color-text-muted)] whitespace-nowrap">
                  No models found
                </div>
              ) : (
                models.map((m) => (
                  <button
                    key={m.name}
                    onClick={() => {
                      onModelChange(m.name);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer ${
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
          </div>
        </>
      )}
    </div>
  );
}
