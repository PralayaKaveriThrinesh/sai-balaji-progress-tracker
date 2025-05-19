
import React, { ReactElement } from 'react';
import { FullscreenChart } from './fullscreen-chart';

interface FullscreenChartWrapperProps {
  children: ReactElement;
  title: string;
}

export const FullscreenChartWrapper = ({ children, title }: FullscreenChartWrapperProps) => {
  return (
    <FullscreenChart 
      title={title}
      onClose={() => {}}
      isOpen={false}
    >
      {children}
    </FullscreenChart>
  );
};
