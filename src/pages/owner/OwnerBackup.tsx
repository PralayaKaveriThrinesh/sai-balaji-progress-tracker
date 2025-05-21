
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { Link as LinkIcon, Calendar, FileText } from 'lucide-react';
import { DataViewToggle } from '@/components/shared/data-view-toggle';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface BackupLink {
  id: string;
  url: string;
  description: string;
  created_at: string;
  created_by: string;
}

const OwnerBackup = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('card');
  
  // Fetch backup links from localStorage
  useEffect(() => {
    const fetchBackupLinks = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get backup links from localStorage or use demo data
        const storedLinks = localStorage.getItem('backup_links');
        let links = [];
        
        if (storedLinks) {
          links = JSON.parse(storedLinks);
        } else {
          // Demo data if no links exist
          links = [
            {
              id: "1",
              url: "https://example.com/backup1",
              description: "Weekly database backup",
              created_at: new Date().toISOString(),
              created_by: "admin"
            },
            {
              id: "2",
              url: "https://example.com/backup2",
              description: "Monthly complete system backup",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              created_by: "admin"
            }
          ];
          localStorage.setItem('backup_links', JSON.stringify(links));
        }
        
        setBackupLinks(links);
      } catch (error) {
        console.error('Error in fetchBackupLinks:', error);
        toast.error(t('somethingWentWrong'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBackupLinks();
    
    // Check for preferred view mode in localStorage
    const savedViewMode = localStorage.getItem('backup_view_mode');
    if (savedViewMode && (savedViewMode === 'table' || savedViewMode === 'card')) {
      setViewMode(savedViewMode);
    }
  }, [t]);
  
  // Save view mode preference
  useEffect(() => {
    localStorage.setItem('backup_view_mode', viewMode);
  }, [viewMode]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('backupLinks')}</h1>
          <p className="text-muted-foreground">
            {t('accessBackupLinks')}
          </p>
        </div>
        
        <DataViewToggle 
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{t('availableBackupLinks')}</CardTitle>
          <CardDescription>
            {t('backupLinksAdminProvided')}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : backupLinks.length > 0 ? (
            viewMode === 'table' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('link')}</TableHead>
                    <TableHead>{t('description')}</TableHead>
                    <TableHead>{t('dateAdded')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <a 
                          href={link.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" />
                          {link.url}
                        </a>
                      </TableCell>
                      <TableCell>{link.description}</TableCell>
                      <TableCell>{formatDate(link.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="space-y-4">
                {backupLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4"
                  >
                    <div>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center font-medium mb-1"
                      >
                        <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{link.url}</span>
                      </a>
                      {link.description && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <p>{link.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground sm:text-right">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      {formatDate(link.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>{t('noBackupLinks')}</p>
              <p className="text-sm mt-2">{t('adminAddBackupLinks')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerBackup;
