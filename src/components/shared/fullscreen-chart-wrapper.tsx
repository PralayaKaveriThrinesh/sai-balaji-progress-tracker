
import React, { ReactElement, useState } from 'react';
import { FullscreenChart } from './fullscreen-chart';

interface FullscreenChartWrapperProps {
  children: ReactElement;
  title: string;
}

export const FullscreenChartWrapper = ({ children, title }: FullscreenChartWrapperProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleClose = () => {
    setIsOpen(false);
  };
  
  const handleOpen = () => {
    setIsOpen(true);
  };
  
  return (
    <div onClick={handleOpen} className="cursor-pointer">
      {children}
      {isOpen && (
        <FullscreenChart 
          title={title}
          onClose={handleClose}
          isOpen={isOpen}
        >
          {React.cloneElement(children)}
        </FullscreenChart>
      )}
    </div>
  );
};
