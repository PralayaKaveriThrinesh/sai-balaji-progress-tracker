
import React from 'react';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Table as TableIcon, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'table' | 'card';

interface DataViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  className?: string;
}

export function DataViewToggle({ viewMode, setViewMode, className }: DataViewToggleProps) {
  const { t } = useLanguage();
  
  return (
    <div className={cn("flex items-center rounded-lg border p-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('table')}
        className={cn(
          "flex items-center gap-2 text-xs h-8",
          viewMode === 'table' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        )}
      >
        <TableIcon className="h-3.5 w-3.5" />
        <span>{t('tableView')}</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setViewMode('card')}
        className={cn(
          "flex items-center gap-2 text-xs h-8",
          viewMode === 'card' && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
        )}
      >
        <Grid className="h-3.5 w-3.5" />
        <span>{t('cardView')}</span>
      </Button>
    </div>
  );
}

export default DataViewToggle;
