import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react';

export interface EnhancedToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

/**
 * Enhanced toast notification with icons and animations
 * Integrates with existing use-toast hook
 */
export function EnhancedToastIcon(variant: string = 'default') {
  const iconProps = { className: 'h-5 w-5' };

  switch (variant) {
    case 'success':
      return <CheckCircle2 {...iconProps} className="text-green-500" />;
    case 'error':
      return <XCircle {...iconProps} className="text-red-500" />;
    case 'info':
      return <Info {...iconProps} className="text-blue-500" />;
    default:
      return <AlertCircle {...iconProps} className="text-yellow-500" />;
  }
}

/**
 * Hook helper to show enhanced toasts
 */
export function getToastConfig(
  title: string,
  description?: string,
  variant: 'default' | 'success' | 'error' | 'info' = 'default'
) {
  return {
    title,
    description,
    variant: variant === 'success' ? 'default' : variant,
  };
}
