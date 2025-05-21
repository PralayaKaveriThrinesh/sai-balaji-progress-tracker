
import React from 'react';
import { useLanguage } from '@/context/language-context';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="flex items-center gap-1">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setLanguage('en')}>
          English {language === 'en' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('te')}>
          తెలుగు (Telugu) {language === 'te' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('kn')}>
          ಕನ್ನಡ (Kannada) {language === 'kn' && '✓'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
