
import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { BackupLink } from '@/lib/mock-data/backup-links';
import backupLinksService from '@/lib/mock-data/backup-links';
import { Card, CardContent } from '@/components/ui/card';
import { Link, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { DataViewToggle } from '@/components/shared/data-view-toggle';

const OwnerBackup = () => {
  const { t } = useLanguage();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const fetchBackupLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await backupLinksService.getLinks();
      if (error) {
        toast.error('Failed to load backup links');
        return;
      }
      if (data) {
        setBackupLinks(data);
      }
    } catch (error) {
      console.error('Error fetching backup links:', error);
      toast.error('Failed to load backup links');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackupLinks();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('backupLinks')}</h1>
        <DataViewToggle 
          viewMode={viewMode} 
          setViewMode={setViewMode} 
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : backupLinks.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <Link className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('noBackupLinks')}</h3>
            <p className="text-muted-foreground mt-2">{t('adminAddBackupLinks')}</p>
          </CardContent>
        </Card>
      ) : viewMode === 'table' ? (
        <div className="rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">URL</th>
                <th className="h-10 px-4 text-left font-medium">Description</th>
                <th className="h-10 px-4 text-left font-medium">Created At</th>
              </tr>
            </thead>
            <tbody>
              {backupLinks.map((link) => (
                <tr key={link.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle max-w-[300px] truncate">
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      {link.url}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </td>
                  <td className="p-4 align-middle max-w-[400px] truncate">{link.description || '-'}</td>
                  <td className="p-4 align-middle">{formatDate(link.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {backupLinks.map((link) => (
            <Card key={link.id} className="overflow-hidden">
              <CardContent className="p-6 flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4 text-blue-600 shrink-0" />
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate font-medium"
                  >
                    {link.url}
                    <ExternalLink className="ml-1 h-3 w-3 inline" />
                  </a>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  {link.description || 'No description provided'}
                </div>
                <div className="text-xs text-muted-foreground mt-4">
                  Added: {formatDate(link.created_at)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerBackup;
