import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Activity } from 'lucide-react';

export default function SystemMonitor() {
  const [stats, setStats] = useState({ cpu: 0, ram: 0, gpu: 0 });

  useEffect(() => {
    if (!window.__TAURI_INTERNALS__) return;
    let timer;
    let isMounted = true;

    const poll = async () => {
      try {
        const usage = await invoke('get_system_usage');
        if (isMounted) {
          setStats({
            cpu: usage.cpu_usage.toFixed(1),
            ram: (usage.used_memory / 1024 / 1024 / 1024).toFixed(1),
            gpu: usage.gpu_usage.toFixed(1)
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error('[SystemMonitor] Polling failed:', err);
        }
      }
      if (isMounted) {
        timer = setTimeout(poll, 2000);
      }
    };

    poll();

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (!window.__TAURI_INTERNALS__) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-(--color-bg-tertiary) rounded-full border border-(--color-border) text-[9px] sm:text-[10px] text-(--color-text-muted) shadow-sm max-w-full overflow-hidden whitespace-nowrap">
      <div className="flex items-center gap-1 flex-shrink-0">
        <Activity size={12} className="text-(--color-accent) animate-pulse hidden sm:block" />
        <span className="font-medium font-mono w-8 text-right">{stats.cpu}%</span>
        <span className="uppercase text-[9px] tracking-wider opacity-60">CPU</span>
      </div>
      <div className="w-px h-3 bg-(--color-border) opacity-60 flex-shrink-0" />
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-medium font-mono w-8 text-right">{stats.gpu}%</span>
        <span className="uppercase text-[9px] tracking-wider opacity-60">GPU</span>
      </div>
      <div className="w-px h-3 bg-(--color-border) opacity-60 flex-shrink-0" />
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="font-medium font-mono w-6 text-right">{stats.ram}</span>
        <span className="uppercase text-[9px] tracking-wider opacity-60">GB RAM</span>
      </div>
    </div>
  );
}
