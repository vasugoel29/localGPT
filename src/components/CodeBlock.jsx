import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

export default function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const language = className?.replace('language-', '') || 'text';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Clipboard write failed:', error);
      setCopied(false);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden my-3 border border-[var(--color-border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-code-header)] text-[13px] text-[var(--color-text-muted)]">
        <span className="font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: '1em',
          background: 'var(--color-code-bg)',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
        }}
        showLineNumbers={code.split('\n').length > 5}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
