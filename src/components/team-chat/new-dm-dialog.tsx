'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { TeamUserProfile } from '@/types/team-chat';
import { UserAvatar } from './user-avatar';

interface NewDmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRoomCreated: (roomId: string) => void;
}

export function NewDmDialog({ open, onOpenChange, onRoomCreated }: NewDmDialogProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<TeamUserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);

  const fetchUsers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/team/users?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => fetchUsers(query), 250);
    return () => clearTimeout(timer);
  }, [query, open, fetchUsers]);

  async function startDm(targetUserId: string) {
    setCreating(targetUserId);
    try {
      const res = await fetch('/api/team/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_user_id: targetUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        onRoomCreated(data.room_id);
        onOpenChange(false);
        setQuery('');
      }
    } finally {
      setCreating(null);
    }
  }

  const roleLabel: Record<string, string> = {
    admin: 'Admin',
    manager: 'Gerente',
    agent: 'Agente',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>

        <div className="relative mt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar membro..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        <div className="mt-2 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {query ? 'Nenhum membro encontrado.' : 'Nenhum membro disponível.'}
            </p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {users.map((u) => (
                <Button
                  key={u.id}
                  variant="ghost"
                  className="justify-start h-auto py-2.5 px-3 gap-3"
                  onClick={() => startDm(u.id)}
                  disabled={creating === u.id}
                >
                  {creating === u.id ? (
                    <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  ) : (
                    <UserAvatar user={u} size="sm" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium">{u.full_name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabel[u.role] ?? u.role}</p>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
