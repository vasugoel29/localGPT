import { useState } from 'react';
import { Sparkles, ChevronDown, Code, FileText, TestTube, Lightbulb, MessageCircle, Bug } from 'lucide-react';

const TEMPLATES = [
  {
    icon: Code,
    label: 'Explain Code',
    prompt: 'Explain the following code step by step:\n\n```\n\n```',
  },
  {
    icon: TestTube,
    label: 'Write Tests',
    prompt: 'Write comprehensive unit tests for the following code:\n\n```\n\n```',
  },
  {
    icon: Bug,
    label: 'Debug',
    prompt: 'I have the following code that has a bug. Help me find and fix it:\n\n```\n\n```\n\nThe error I\'m seeing is: ',
  },
  {
    icon: FileText,
    label: 'Summarize',
    prompt: 'Summarize the following text concisely:\n\n',
  },
  {
    icon: Lightbulb,
    label: 'Brainstorm',
    prompt: 'Help me brainstorm ideas for: ',
  },
  {
    icon: MessageCircle,
    label: 'Rewrite',
    prompt: 'Rewrite the following text to be more professional and clear:\n\n',
  },
];

export default function PromptTemplates({ onSelect }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer"
        title="Prompt Templates"
      >
        <Sparkles size={14} />
        <span>Templates</span>
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
          <div className="absolute bottom-full left-0 mb-2 bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg shadow-xl z-50 min-w-[200px]">
            <div className="p-1">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.label}
                    onClick={() => {
                      onSelect(t.prompt);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer text-left"
                  >
                    <Icon size={14} className="flex-shrink-0 text-[var(--color-text-muted)]" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
