export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
      <div className="typing-dot w-2 h-2 rounded-full bg-[var(--color-text-muted)]" />
    </div>
  );
}
