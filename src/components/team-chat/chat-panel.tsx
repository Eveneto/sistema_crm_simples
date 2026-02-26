'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, ChevronUp } from 'lucide-react';
import { TeamMessage, TeamRoomWithDetails } from '@/types/team-chat';
import { UserAvatar } from './user-avatar';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  room: TeamRoomWithDetails;
  currentUserId: string;
}

function formatMessageTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
}

function getDateKey(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ChatPanel({ room, currentUserId }: ChatPanelProps) {
  const [messages, setMessages] = useState<TeamMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [text, setText] = useState('');

  const bottomRef = useRef<HTMLDivElement>(null);
  // useRef garante a mesma instância entre renders (evita loop no Realtime)
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  const displayName =
    room.type === 'direct'
      ? room.other_user?.full_name ?? 'Usuário'
      : room.name ?? 'Grupo';

  // ── Carrega histórico ───────────────────────────────────────────────
  const loadMessages = useCallback(async (before?: string) => {
    const url = `/api/team/rooms/${room.id}/messages` + (before ? `?before=${encodeURIComponent(before)}` : '');
    const res = await fetch(url);
    const data = await res.json();
    return data as { messages: TeamMessage[]; has_more: boolean };
  }, [room.id]);

  useEffect(() => {
    setMessages([]);
    setHasMore(false);
    setLoadingHistory(true);

    loadMessages().then(({ messages: msgs, has_more }) => {
      setMessages(msgs);
      setHasMore(has_more);
      setLoadingHistory(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'instant' }), 0);
    });
  }, [room.id, loadMessages]);

  // ── Carregar mais (scroll para cima) ───────────────────────────────
  async function loadMore() {
    if (!messages.length || loadingMore) return;
    setLoadingMore(true);
    const { messages: older, has_more } = await loadMessages(messages[0].created_at);
    setMessages((prev) => [...older, ...prev]);
    setHasMore(has_more);
    setLoadingMore(false);
  }

  // ── Supabase Realtime ───────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`team_room_${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_messages',
          filter: `room_id=eq.${room.id}`,
        },
        async (payload: any) => {
          const msg = payload.new as TeamMessage;
          // Busca perfil do remetente se for outro usuário
          if (msg.sender_id !== currentUserId) {
            const { data: profile } = await (supabase as any)
              .from('user_profiles')
              .select('id, full_name, avatar_url, role')
              .eq('id', msg.sender_id)
              .single();
            msg.sender = profile;
          }
          setMessages((prev) => {
            // Evita duplicata (pode chegar via Realtime E via POST response)
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, currentUserId]); // supabase é estável via useRef

  // ── Enviar mensagem ─────────────────────────────────────────────────
  async function send() {
    const content = text.trim();
    if (!content || sending) return;

    setSending(true);
    setText('');

    const res = await fetch(`/api/team/rooms/${room.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const { message } = await res.json();
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }

    setSending(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  // ── Renderização das mensagens agrupadas por data ──────────────────
  const groups: { date: string; msgs: TeamMessage[] }[] = [];
  let lastDate = '';
  for (const msg of messages) {
    const key = getDateKey(msg.created_at);
    if (key !== lastDate) {
      groups.push({ date: msg.created_at, msgs: [] });
      lastDate = key;
    }
    groups[groups.length - 1].msgs.push(msg);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b shrink-0">
        {room.type === 'direct' && room.other_user ? (
          <UserAvatar user={room.other_user} size="md" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
            {displayName[0]?.toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-sm leading-none">{displayName}</p>
          {room.type === 'direct' && room.other_user && (
            <p className="text-xs text-muted-foreground mt-0.5">{room.other_user.role}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {/* Botão carregar mais */}
        {hasMore && (
          <div className="flex justify-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={loadingMore}
              className="text-xs text-muted-foreground"
            >
              {loadingMore ? (
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              ) : (
                <ChevronUp className="w-3 h-3 mr-1" />
              )}
              Carregar mensagens anteriores
            </Button>
          </div>
        )}

        {loadingHistory ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <span className="text-4xl">👋</span>
            <p className="text-sm">Comece a conversa!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={getDateKey(group.date)}>
              {/* Separador de data */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2 shrink-0">
                  {formatDateSeparator(group.date)}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Mensagens do grupo */}
              <div className="space-y-1">
                {group.msgs.map((msg, idx) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const prevMsg = idx > 0 ? group.msgs[idx - 1] : null;
                  const isContinuation = prevMsg?.sender_id === msg.sender_id;

                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2 items-end',
                        isOwn ? 'flex-row-reverse' : 'flex-row',
                        isContinuation ? 'mt-0.5' : 'mt-3'
                      )}
                    >
                      {/* Avatar (não repetir em mensagens consecutivas) */}
                      {!isOwn ? (
                        isContinuation ? (
                          <div className="w-7 shrink-0" />
                        ) : (
                          <UserAvatar
                            user={msg.sender ?? { full_name: '?', avatar_url: null }}
                            size="sm"
                          />
                        )
                      ) : null}

                      {/* Balão */}
                      <div
                        className={cn(
                          'max-w-[70%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted rounded-bl-sm'
                        )}
                      >
                        {/* Nome do remetente (primeira mensagem de grupo) */}
                        {!isOwn && !isContinuation && msg.sender && (
                          <p className="text-[11px] font-semibold mb-0.5 opacity-70">
                            {msg.sender.full_name}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-1 text-right',
                            isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
                          )}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t shrink-0">
        <div className="flex items-end gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Mensagem... (Enter para enviar, Shift+Enter para quebra)"
            rows={1}
            className="resize-none min-h-[40px] max-h-32 overflow-y-auto"
          />
          <Button
            size="icon"
            onClick={send}
            disabled={!text.trim() || sending}
            className="shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
