import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from './CodeBlock';
import TypingIndicator from './TypingIndicator';
import { RefreshCw, User, Bot, Zap } from 'lucide-react';

function formatDuration(ns) {
  if (!ns) return null;
  const ms = ns / 1e6;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTokenSpeed(evalCount, evalDuration) {
  if (!evalCount || !evalDuration) return null;
  const seconds = evalDuration / 1e9;
  const speed = evalCount / seconds;
  return `${speed.toFixed(1)} tok/s`;
}

export default function ChatArea({
  messages,
  isStreaming,
  error,
  metadata,
  onRegenerate,
  model,
}) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom conditionally
  useEffect(() => {
    if (!containerRef.current || !bottomRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom || messages.length <= 1) {
      bottomRef.current.scrollIntoView({ behavior: isStreaming ? 'auto' : 'smooth' });
    }
  }, [messages, isStreaming]);

  const hasMessages = messages.length > 0;
  const lastIsAssistant =
    messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {!hasMessages ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[var(--color-bg-tertiary)] mb-8">
              <Bot size={40} className="text-[var(--color-accent)]" />
            </div>
            <h1 className="text-3xl font-semibold mb-4">LocalGPT</h1>
            <p className="text-[var(--color-text-muted)] text-base max-w-md mx-auto leading-relaxed">
              {model
                ? `Using ${model}. Start typing below to begin a conversation.`
                : 'Select a model from the sidebar to get started.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.map((msg, i) => {
            const isLastEmptyAssistant = 
              msg.role === 'assistant' && !msg.content && isStreaming && i === messages.length - 1;

            return (
            <div
              key={msg.id || i}
              className={`flex gap-5 mb-8 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center mt-0.5">
                  <Bot size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[85%] ${
                  msg.role === 'user'
                    ? 'bg-[var(--color-user-bubble)] rounded-2xl rounded-br-md px-5 py-3.5'
                    : 'flex-1 min-w-0'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </p>
                ) : isLastEmptyAssistant ? (
                  <div className="-ml-1 mt-1">
                    <TypingIndicator />
                  </div>
                ) : (
                  <div className="prose-chat">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          if (inline) {
                            return (
                              <code className={className} {...props}>
                                {children}
                              </code>
                            );
                          }
                          return (
                            <CodeBlock className={className}>
                              {children}
                            </CodeBlock>
                          );
                        },
                      }}
                    >
                      {msg.content || ' '}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center mt-0.5">
                  <User size={16} className="text-[var(--color-text-secondary)]" />
                </div>
              )}
            </div>
          )})}

          {/* Metadata + Regenerate */}
          {!isStreaming && lastIsAssistant && (
            <div className="flex items-center gap-3 ml-12 -mt-3 mb-4">
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors cursor-pointer"
              >
                <RefreshCw size={12} />
                Regenerate
              </button>
              {metadata?.total_duration && (
                <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Zap size={10} />
                  {formatDuration(metadata.total_duration)}
                  {metadata.eval_count && (
                    <>
                      {' • '}
                      {metadata.eval_count} tokens
                      {' • '}
                      {formatTokenSpeed(
                        metadata.eval_count,
                        metadata.eval_duration
                      )}
                    </>
                  )}
                </span>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="ml-12 mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-800/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
