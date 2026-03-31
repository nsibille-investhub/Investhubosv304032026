import { ReactNode } from 'react';
import { ClickableText } from './ClickableText';

interface ClickableNameProps {
  children: ReactNode;
  className?: string;
}

export function ClickableName({ children, className }: ClickableNameProps) {
  return (
    <ClickableText
      className={`text-sm font-medium truncate ${className ?? ''}`.trim()}
    >
      {children}
    </ClickableText>
  );
}
