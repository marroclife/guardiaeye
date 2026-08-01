import { useState, useRef, useEffect } from 'react';
import { AgentMessage, ToolCall } from '@/ai/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Loader2, CheckCircle2, XCircle, Wrench, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatProps {
  messages: AgentMessage[];
  loading: boolean;
  pendingToolCalls: ToolCall[] | null;
  onSend: (message: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function AIChat({ messages, loading, pendingToolCalls, onSend, onApprove, onReject, onClose }: AIChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-marroc-muscgo/95 border border-marroc-dourado/15 rounded-xl overflow-hidden glass-card">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-marroc-dourado/15">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-marroc-esmeralda/15 border border-marroc-esmeralda/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-marroc-esmeralda" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-marroc-dourado">Nexo Operador</h3>
            <p className="text-[10px] text-marroc-salvia/70">Agente AI do CRM</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-marroc-salvia/60 hover:text-marroc-dourado transition-colors text-sm"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 text-marroc-salvia/50">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-1">Olá, Marroc.</p>
              <p className="text-xs">Posso ajudar com leads, reuniões, projetos e análises.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {['Quais leads estão parados?', 'Agende follow-up para amanhã', 'Resuma meus projetos críticos', 'Crie um lead para Yume Sushi'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSend(suggestion)}
                    className="text-xs px-3 py-1.5 rounded-full border border-marroc-dourado/20 text-marroc-salvia hover:bg-marroc-dourado/10 hover:text-marroc-dourado transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-marroc-salvia/60 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Operador processando...
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Approval Bar */}
      {pendingToolCalls && pendingToolCalls.length > 0 && (
        <div className="px-4 py-3 border-t border-marroc-dourado/15 bg-marroc-dourado/5">
          <div className="flex items-start gap-3">
            <Wrench className="w-4 h-4 text-marroc-dourado mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-marroc-texto mb-2">
                O Operador quer executar {pendingToolCalls.length} ação(ões):
              </p>
              <ul className="text-xs text-marroc-salvia/80 space-y-1 mb-3">
                {pendingToolCalls.map((call, i) => (
                  <li key={i}>
                    • <span className="text-marroc-dourado font-medium">{call.tool}</span>: {call.reason}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="btn-marroc"
                  onClick={onApprove}
                  disabled={loading}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-marroc-dourado/15 hover:bg-red-500/10 hover:text-red-300"
                  onClick={onReject}
                  disabled={loading}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1" />
                  Recusar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-marroc-dourado/15 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Digite uma tarefa ou pergunta..."
          className="flex-1 bg-marroc-dourado/5 border-marroc-dourado/15 focus:border-marroc-esmeralda"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn-marroc px-3"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.role === 'user';
  const isTool = message.role === 'tool';

  return (
    <div className={cn(
      'flex gap-2',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      <div className={cn(
        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
        isUser ? 'bg-marroc-dourado/20 text-marroc-dourado' : 'bg-marroc-esmeralda/15 text-marroc-esmeralda'
      )}>
        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>
      <div className={cn(
        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
        isUser
          ? 'bg-marroc-dourado/15 text-marroc-texto border border-marroc-dourado/10'
          : isTool
            ? 'bg-marroc-esmeralda/10 text-marroc-salvia border border-marroc-esmeralda/20 font-mono text-xs'
            : 'bg-marroc-dourado/5 text-marroc-texto border border-marroc-dourado/10'
      )}>
        <div className="whitespace-pre-wrap">{message.content}</div>
        {message.toolResults && message.toolResults.length > 0 && (
          <div className="mt-2 pt-2 border-t border-marroc-dourado/10 space-y-1">
            {message.toolResults.map((result, i) => (
              <div key={i} className="text-xs flex items-center gap-1.5">
                {result.success ? (
                  <CheckCircle2 className="w-3 h-3 text-marroc-esmeralda" />
                ) : (
                  <XCircle className="w-3 h-3 text-red-400" />
                )}
                <span className={result.success ? 'text-marroc-esmeralda' : 'text-red-300'}>
                  {result.tool}: {result.success ? 'ok' : result.error}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
