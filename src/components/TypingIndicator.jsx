export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2" role="status" aria-live="polite">
      <span className="sr-only">Assistant is typing</span>
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" aria-hidden="true" />
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" aria-hidden="true" />
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" aria-hidden="true" />
    </div>
  );
}
