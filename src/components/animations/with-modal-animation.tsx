'use client';

import React from 'react';
import { ModalTransition } from './modal-transition';

interface WithModalAnimationProps {
  children: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function withModalAnimation<P extends object>(Component: React.ComponentType<P>) {
  return React.forwardRef<HTMLDivElement, P & WithModalAnimationProps>(
    ({ isOpen = true, onClose, ...props }, ref) => (
      <ModalTransition isOpen={isOpen} onClose={onClose}>
        <Component {...(props as P)} ref={ref} />
      </ModalTransition>
    )
  );
}

export default withModalAnimation;
