
import React from 'react';

export const AuthLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-2 mb-6">
      <img 
        src="/lovable-uploads/a723c9c5-8174-41c6-b9d7-2d8646801ec6.png"
        alt="SB Constructions" 
        className="h-16 w-16 rounded-full" 
      />
      <h1 className="text-2xl font-bold">SB Constructions</h1>
    </div>
  );
};
