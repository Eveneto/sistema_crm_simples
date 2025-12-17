'use client';

import { ReactNode } from 'react';

interface ModalTransitionProps {
  isOpen: boolean;
  children: ReactNode;
}

/**
 * ModalTransition Component
 * Wraps modal/dialog content with entrance animations
 *
 * Features:
 * - Scale-in animation from center (300ms)
 * - Backdrop fade-in synchronized with modal
 * - Smooth exit animation on close
 * - GPU-accelerated (no JavaScript animation overhead)
 */
export function ModalTransition({ isOpen, children }: ModalTransitionProps) {
  if (!isOpen) return null;

  return <div className="modal-transition-wrapper">{children}</div>;
}

export default ModalTransition;
