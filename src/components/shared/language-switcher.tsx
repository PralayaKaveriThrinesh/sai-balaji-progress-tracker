
import React from 'react';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage, languageOptions } = useLanguage();
  
  const currentLanguage = languageOptions.find(opt => opt.id === language);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1 px-2">
          <languages className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">{currentLanguage?.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languageOptions.map((option) => (
          <DropdownMenuItem 
            key={option.id}
            onClick={() => setLanguage(option.id)}
            className={language === option.id ? "bg-accent" : ""}
          >
            <span className="mr-2">{option.nativeName}</span>
            <span className="text-muted-foreground text-xs">({option.name})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
