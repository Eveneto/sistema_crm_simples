import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * Page wrapper with smooth fade-in transition
 * Adds automatic fade animation to any page
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div
      className={`animate-in fade-in duration-300 ${className}`}
      style={{
        animation: 'fadeIn 0.3s ease-in-out',
      }}
    >
      {children}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
