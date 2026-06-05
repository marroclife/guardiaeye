import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface SystemStatusProps {
  isConnected: boolean;
}

export function SystemStatus({ isConnected }: SystemStatusProps) {
  const [bootComplete, setBootComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBootComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 glass-card rounded-full boot-fade-in">
      <div className="relative flex items-center justify-center">
        {isConnected ? (
          <>
            <span className="absolute w-2 h-2 bg-marroc-esmeralda rounded-full animate-ping opacity-75" />
            <span className="relative w-2 h-2 bg-marroc-esmeralda rounded-full" />
          </>
        ) : (
          <span className="w-2 h-2 bg-red-500 rounded-full" />
        )}
      </div>
      <span className="font-mono text-xs tracking-wide">
        {!bootComplete ? (
          <span className="text-marroc-salvia/70">Inicializando...</span>
        ) : isConnected ? (
          <span className="text-marroc-esmeralda">Sistema Online</span>
        ) : (
          <span className="text-red-400">Reconectando...</span>
        )}
      </span>
      {isConnected ? (
        <Wifi className="w-3 h-3 text-marroc-esmeralda" />
      ) : (
        <WifiOff className="w-3 h-3 text-red-400" />
      )}
    </div>
  );
}
