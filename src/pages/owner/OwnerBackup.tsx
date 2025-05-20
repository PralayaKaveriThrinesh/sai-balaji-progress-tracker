
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'lucide-react';

interface BackupLink {
  id: string;
  url: string;
  description: string;
  created_at: string;
  created_by: string;
}

const OwnerBackup = () => {
  const { user } = useAuth();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch backup links
  useEffect(() => {
    const fetchBackupLinks = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('backup_links')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching backup links:', error);
          toast.error('Failed to fetch backup links');
          return;
        }
        
        setBackupLinks(data || []);
      } catch (error) {
        console.error('Error in fetchBackupLinks:', error);
        toast.error('An error occurred while fetching backup links');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBackupLinks();
    
    // Set up realtime subscription for backup_links table
    const channel = supabase
      .channel('backup_links_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'backup_links' },
        (payload) => {
          console.log('Backup links changed:', payload);
          fetchBackupLinks();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Backup Links</h1>
        <p className="text-muted-foreground">
          Access backup links shared by admin
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Backup Links</CardTitle>
          <CardDescription>
            These links are provided by the admin for backup purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : backupLinks.length > 0 ? (
            <div className="space-y-4">
              {backupLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center"
                    >
                      <Link className="h-4 w-4 mr-2" />
                      {link.url}
                    </a>
                    {link.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {link.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Added {formatDate(link.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No backup links have been added yet.</p>
              <p className="text-sm">The admin will add backup links soon.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerBackup;
