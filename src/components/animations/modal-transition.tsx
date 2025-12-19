'use client';

import React from 'react';

interface ModalTransitionProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

export const ModalTransition: React.FC<ModalTransitionProps> = ({ children, isOpen = true }) => {
  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in zoom-in-95"
      style={{
        animation: `fadeInScale 0.3s ease-out`,
      }}
    >
      {children}
    </div>
  );
};

export default ModalTransition;
