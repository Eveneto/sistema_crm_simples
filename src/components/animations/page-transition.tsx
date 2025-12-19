'use client';

import React from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  delay?: number;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children, delay = 0 }) => {
  return (
    <div
      className="animate-in fade-in slide-in-from-bottom-4"
      style={{
        animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;
