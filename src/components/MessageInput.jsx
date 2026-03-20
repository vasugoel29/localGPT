import { useRef, useCallback } from 'react';
import { Send, Square } from 'lucide-react';
import PromptTemplates from './PromptTemplates';
import ModelSelector from './ModelSelector';

export default function MessageInput({ 
  onSend, 
  isStreaming, 
  onStop, 
  disabled,
  models,
  selectedModel,
  onModelChange,
  modelsLoading
}) {
  const textareaRef = useRef(null);

  const handleSubmit = useCallback(() => {
    const value = textareaRef.current?.value?.trim();
    if (!value || isStreaming) return;
    onSend(value);
    textareaRef.current.value = '';
    // Reset height
    textareaRef.current.style.height = 'auto';
  }, [onSend, isStreaming]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.nativeEvent?.isComposing) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleInput = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-4 md:px-6 md:py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3 bg-[var(--color-bg-tertiary)] rounded-2xl px-4 py-3 border border-[var(--color-border)] focus-within:border-[var(--color-text-muted)] transition-colors">
          <textarea
            ref={textareaRef}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Message LocalGPT…"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] text-sm leading-6 max-h-[200px] overflow-y-auto py-1"
          />
          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-80 transition-opacity cursor-pointer"
              aria-label="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={disabled}
              className="flex-shrink-0 p-2 rounded-lg bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] hover:opacity-80 transition-opacity disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3 pb-1">
          <PromptTemplates
            onSelect={(prompt) => {
              if (textareaRef.current) {
                textareaRef.current.value = prompt;
                textareaRef.current.focus();
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height =
                  Math.min(textareaRef.current.scrollHeight, 200) + 'px';
              }
            }}
          />
          <ModelSelector 
            models={models}
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            disabled={isStreaming}
            loading={modelsLoading}
          />
          <div className="flex-1" />
          <p className="text-[10px] text-[var(--color-text-muted)] hidden sm:block">
            LocalGPT uses Ollama. Responses are generated locally.
          </p>
        </div>
      </div>
    </div>
  );
}
