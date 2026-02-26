'use client';

import React from 'react';
import { TeamRoomWithDetails } from '@/types/team-chat';
import { UserAvatar } from './user-avatar';
import { cn } from '@/lib/utils';

interface RoomListProps {
  rooms: TeamRoomWithDetails[];
  activeRoomId: string | null;
  onSelect: (roomId: string) => void;
  loading: boolean;
}

export function RoomList({ rooms, activeRoomId, onSelect, loading }: RoomListProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-1 p-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2.5 bg-muted rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center text-muted-foreground">
        <span className="text-3xl">💬</span>
        <p className="text-sm">Nenhuma conversa ainda.</p>
        <p className="text-xs">Clique em &quot;Nova conversa&quot; para começar.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 p-2">
      {rooms.map((room) => {
        const isActive = room.id === activeRoomId;
        const displayName =
          room.type === 'direct'
            ? room.other_user?.full_name ?? 'Usuário'
            : room.name ?? 'Grupo';

        const lastMsg = room.last_message_content ?? 'Nenhuma mensagem';
        const timeAgo = room.last_message_at
          ? (() => {
              const diff = Date.now() - new Date(room.last_message_at).getTime();
              const mins = Math.floor(diff / 60000);
              const hours = Math.floor(diff / 3600000);
              const days = Math.floor(diff / 86400000);
              if (mins < 1) return 'agora';
              if (mins < 60) return `${mins}min`;
              if (hours < 24) return `${hours}h`;
              return `${days}d`;
            })()
          : null;

        return (
          <button
            key={room.id}
            onClick={() => onSelect(room.id)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg text-left w-full transition-colors hover:bg-accent',
              isActive && 'bg-accent'
            )}
          >
            {/* Avatar */}
            {room.type === 'direct' && room.other_user ? (
              <UserAvatar user={room.other_user} size="md" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-semibold shrink-0">
                {displayName[0]?.toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="font-medium text-sm truncate">{displayName}</span>
                {timeAgo && (
                  <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 mt-0.5">
                <p className="text-xs text-muted-foreground truncate">{lastMsg}</p>
                {room.unread_count > 0 && (
                  <span className="shrink-0 min-w-[18px] h-[18px] rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center px-1">
                    {room.unread_count > 99 ? '99+' : room.unread_count}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
