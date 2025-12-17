'use client';

import { ComponentType, ReactNode } from 'react';

interface WithModalAnimationProps {
  isOpen: boolean;
  children: ReactNode;
  onClose?: () => void;
}

/**
 * withModalAnimation HOC
 * Wraps modal/dialog components with entrance and exit animations
 *
 * Usage:
 * const AnimatedDialog = withModalAnimation(YourDialogComponent);
 *
 * Features:
 * - Scale-in animation on mount
 * - Scale-out animation on unmount
 * - Synchronized backdrop animation
 * - Smooth transitions
 */
export function withModalAnimation<P extends WithModalAnimationProps>(Component: ComponentType<P>) {
  return function WithModalAnimationComponent(props: P) {
    return (
      <div className={props.isOpen ? 'modal-transition-wrapper' : 'modal-exit'}>
        <Component {...props} />
      </div>
    );
  };
}

export default withModalAnimation;
