import * as React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

export interface UserCellProps {
  name: string;
  /** Secondary line: role, email, etc. */
  sublabel?: string;
  /** Optional avatar image URL. */
  avatarUrl?: string;
  /** Avatar size — defaults to "sm" (24px) used in compact rows. */
  size?: 'xs' | 'sm' | 'md';
  /** Hide the textual block, keep only the avatar (with name in tooltip). */
  avatarOnly?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<UserCellProps['size']>, string> = {
  xs: 'size-5',
  sm: 'size-6',
  md: 'size-8',
};

const FALLBACK_TEXT_CLASS: Record<NonNullable<UserCellProps['size']>, string> = {
  xs: 'text-[9px]',
  sm: 'text-[10px]',
  md: 'text-xs',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/**
 * Compact user representation reused across listings & timelines.
 * Avatar (initials fallback) + stacked name / sublabel.
 */
export function UserCell({
  name,
  sublabel,
  avatarUrl,
  size = 'sm',
  avatarOnly,
  className,
}: UserCellProps) {
  return (
    <div
      data-slot="user-cell"
      className={cn('flex items-center gap-2 min-w-0', className)}
    >
      <Avatar className={SIZE_CLASS[size]}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt={name} /> : null}
        <AvatarFallback
          className={cn(
            'font-semibold text-primary-foreground bg-primary',
            FALLBACK_TEXT_CLASS[size],
          )}
        >
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>

      {!avatarOnly && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-foreground truncate" title={name}>
            {name}
          </span>
          {sublabel && (
            <span
              className="text-[11px] text-muted-foreground truncate"
              title={sublabel}
            >
              {sublabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
