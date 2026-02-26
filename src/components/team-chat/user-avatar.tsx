'use client';

import React from 'react';
import { TeamUserProfile } from '@/types/team-chat';

interface UserAvatarProps {
  user: Pick<TeamUserProfile, 'full_name' | 'avatar_url'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
};

export function UserAvatar({ user, size = 'md', className = '' }: UserAvatarProps) {
  const initials = user.full_name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  if (user.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.full_name}
        className={`${sizeMap[size]} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0 ${className}`}
    >
      {initials}
    </div>
  );
}
