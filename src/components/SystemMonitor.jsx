import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Activity } from 'lucide-react';

export default function SystemMonitor() {
  const [stats, setStats] = useState({ cpu: 0, ram: 0 });

  useEffect(() => {
    // Only run if we are in Tauri (native wrapper)
    if (!window.__TAURI_INTERNALS__) return;

    const interval = setInterval(async () => {
      try {
        const usage = await invoke('get_system_usage');
        setStats({
          cpu: usage.cpu_usage.toFixed(1),
          ram: (usage.used_memory / 1024 / 1024 / 1024).toFixed(1)
        });
      } catch (err) {
        // silently ignore
      }
    }, 2000); // refresh every 2s

    return () => clearInterval(interval);
  }, []);

  if (!window.__TAURI_INTERNALS__) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-[var(--color-bg-tertiary)] rounded-full border border-[var(--color-border)] text-[10px] sm:text-xs text-[var(--color-text-muted)] shadow-sm">
      <div className="flex items-center gap-1.5">
        <Activity size={12} className="text-[var(--color-accent)] animate-pulse" />
        <span className="font-medium font-mono w-10 text-right">{stats.cpu}%</span>
        <span className="uppercase text-[9px] tracking-wider opacity-60">CPU</span>
      </div>
      <div className="w-px h-3 bg-[var(--color-border)] opacity-60" />
      <div className="flex items-center gap-1.5">
        <span className="font-medium font-mono w-8 text-right">{stats.ram}</span>
        <span className="uppercase text-[9px] tracking-wider opacity-60">GB RAM</span>
      </div>
    </div>
  );
}
