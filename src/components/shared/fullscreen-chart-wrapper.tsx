
import React, { ReactElement } from 'react';
import { FullscreenChart } from './fullscreen-chart';

interface FullscreenChartWrapperProps {
  children: ReactElement;
  title: string;
}

// This is a wrapper component that adapts the children + title pattern
// to the chart prop expected by FullscreenChart
export const FullscreenChartWrapper = ({ children, title }: FullscreenChartWrapperProps) => {
  return (
    <FullscreenChart 
      title={title}
      children={children}
    />
  );
};
