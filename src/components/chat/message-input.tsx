/**
 * MessageInput Component
 * Message input with validation
 * Integrates with POST /api/messages
 *
 * Padrão: Shadcn/ui com Tailwind
 */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Message } from '@/types/database';

interface MessageInputProps {
  conversationId: string;
  onMessageSent?: (message: Message) => void;
  disabled?: boolean;
}

export function MessageInput({ conversationId, onMessageSent, disabled }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar mensagem');
      }

      const message = await response.json();
      setContent('');

      if (onMessageSent) {
        onMessageSent(message);
      }

      toast({
        description: 'Mensagem enviada',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao enviar mensagem',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('flex gap-2 p-4 border-t', 'bg-card/80 backdrop-blur')}>
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite uma mensagem..."
        disabled={disabled || loading}
        className="flex-1 h-10 rounded-full bg-muted/30 px-4"
      />
      <Button
        onClick={handleSend}
        disabled={disabled || loading || !content.trim()}
        size="sm"
        className="h-10 w-10 rounded-full p-0"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}
