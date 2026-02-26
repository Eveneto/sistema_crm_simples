'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus } from 'lucide-react';
import { TeamRoomWithDetails } from '@/types/team-chat';
import { RoomList } from '@/components/team-chat/room-list';
import { ChatPanel } from '@/components/team-chat/chat-panel';
import { NewDmDialog } from '@/components/team-chat/new-dm-dialog';

export default function TeamChatPage() {
  const [rooms, setRooms] = useState<TeamRoomWithDetails[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [newDmOpen, setNewDmOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // useRef garante a mesma instância entre renders (evita loop no Realtime)
  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;

  // ── ID do usuário atual ──────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []); // supabase é estável via useRef

  // ── Carrega lista de salas ───────────────────────────────────────
  const fetchRooms = useCallback(async (): Promise<TeamRoomWithDetails[]> => {
    const res = await fetch('/api/team/rooms');
    const data = await res.json();
    const updated: TeamRoomWithDetails[] = data.rooms ?? [];
    setRooms(updated);
    setLoadingRooms(false);
    return updated;
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // ── Realtime: atualiza lista em tempo real ────────────────────
  useEffect(() => {
    if (!currentUserId) return;

    const refetch = () =>
      fetch('/api/team/rooms')
        .then((r) => r.json())
        .then((data) => setRooms(data.rooms ?? []));

    const channel = supabase
      .channel('team_rooms_realtime')
      // Nova mensagem → atualiza last_message + unread
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_messages' },
        refetch
      )
      // Novo membership (alguém iniciou DM com este usuário) → aparece nova sala
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'team_room_members',
          filter: `user_id=eq.${currentUserId}` },
        refetch
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]); // supabase é estável via useRef

  // ── Sala ativa ───────────────────────────────────────────────────
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  function handleSelectRoom(roomId: string) {
    setActiveRoomId(roomId);
    // Zera unread_count localmente (o servidor atualiza last_read_at)
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, unread_count: 0 } : r))
    );
  }

  async function handleRoomCreated(roomId: string) {
    const updated = await fetchRooms();
    // Garante que a sala está na lista antes de ativá-la
    if (updated.some((r) => r.id === roomId)) {
      setActiveRoomId(roomId);
    } else {
      // Fallback: sala criada mas ainda não retornada — tenta mais uma vez
      setTimeout(async () => {
        const retry = await fetchRooms();
        if (retry.some((r) => r.id === roomId)) setActiveRoomId(roomId);
      }, 800);
    }
  }

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unread_count ?? 0), 0);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden border rounded-lg bg-background">
      {/* ── Sidebar: lista de conversas ─────────────────────────── */}
      <aside className="w-72 shrink-0 flex flex-col border-r">
        {/* Cabeçalho da sidebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-sm">Chat da equipe</h2>
            {totalUnread > 0 && (
              <span className="min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setNewDmOpen(true)}
            title="Nova conversa"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelect={handleSelectRoom}
            loading={loadingRooms}
          />
        </div>
      </aside>

      {/* ── Painel de chat ──────────────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {activeRoom && currentUserId ? (
          <ChatPanel room={activeRoom} currentUserId={currentUserId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
            <span className="text-5xl">💬</span>
            <p className="text-base font-medium">Selecione uma conversa</p>
            <p className="text-sm">ou clique em &quot;+&quot; para iniciar uma nova</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setNewDmOpen(true)}
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Nova conversa
            </Button>
          </div>
        )}
      </main>

      {/* ── Dialog: novo DM ─────────────────────────────────────── */}
      <NewDmDialog
        open={newDmOpen}
        onOpenChange={setNewDmOpen}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
