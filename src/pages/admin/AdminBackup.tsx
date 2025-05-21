
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { BackupLink } from '@/lib/mock-data/backup-links';
import backupLinksService from '@/lib/mock-data/backup-links';
import { Link, ExternalLink, Plus, Pencil, Trash2 } from 'lucide-react';
import { DataViewToggle } from '@/components/shared/data-view-toggle';

const AdminBackup = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<BackupLink | null>(null);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  const fetchBackupLinks = async () => {
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
    }
  };

  useEffect(() => {
    fetchBackupLinks();
  }, []);

  const handleAddLink = async () => {
    if (!newLinkUrl) {
      toast.error('URL is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await backupLinksService.addLink({
        url: newLinkUrl,
        description: newLinkDescription || null,
        created_by: user?.id || null
      });

      if (error) {
        toast.error('Failed to add backup link');
        return;
      }

      toast.success('Backup link added successfully');
      setNewLinkUrl('');
      setNewLinkDescription('');
      setIsAddDialogOpen(false);
      fetchBackupLinks();
    } catch (error) {
      console.error('Error adding backup link:', error);
      toast.error('Failed to add backup link');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLink = async () => {
    if (!currentLink || !newLinkUrl) {
      toast.error('URL is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await backupLinksService.updateLink(currentLink.id, {
        url: newLinkUrl,
        description: newLinkDescription || null
      });

      if (error) {
        toast.error('Failed to update backup link');
        return;
      }

      toast.success('Backup link updated successfully');
      setIsEditDialogOpen(false);
      fetchBackupLinks();
    } catch (error) {
      console.error('Error updating backup link:', error);
      toast.error('Failed to update backup link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLink = async () => {
    if (!currentLink) return;

    setLoading(true);
    try {
      const { error } = await backupLinksService.deleteLink(currentLink.id);

      if (error) {
        toast.error('Failed to delete backup link');
        return;
      }

      toast.success('Backup link deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchBackupLinks();
    } catch (error) {
      console.error('Error deleting backup link:', error);
      toast.error('Failed to delete backup link');
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setNewLinkUrl('');
    setNewLinkDescription('');
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (link: BackupLink) => {
    setCurrentLink(link);
    setNewLinkUrl(link.url);
    setNewLinkDescription(link.description || '');
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (link: BackupLink) => {
    setCurrentLink(link);
    setIsDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto p-4 pt-16">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('backupLinks')}</h1>
        <div className="flex items-center gap-2">
          <DataViewToggle 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
          <Button onClick={openAddDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t('add')}
          </Button>
        </div>
      </div>

      {backupLinks.length === 0 ? (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
            <Link className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">{t('noBackupLinks')}</h3>
            <p className="text-muted-foreground mt-2">{t('adminAddBackupLinks')}</p>
            <Button onClick={openAddDialog} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> {t('add')}
            </Button>
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
                <th className="h-10 px-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {backupLinks.map((link) => (
                <tr key={link.id} className="border-b hover:bg-muted/50">
                  <td className="p-4 align-middle max-w-[200px] truncate">
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
                  <td className="p-4 align-middle max-w-[300px] truncate">{link.description || '-'}</td>
                  <td className="p-4 align-middle">{formatDate(link.created_at)}</td>
                  <td className="p-4 align-middle text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => openEditDialog(link)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => openDeleteDialog(link)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {backupLinks.map((link) => (
            <Card key={link.id}>
              <CardHeader className="pb-3">
                <CardTitle className="truncate">
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    {link.url}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </CardTitle>
                <CardDescription>
                  {formatDate(link.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {link.description || 'No description provided'}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => openEditDialog(link)}
                >
                  <Pencil className="mr-2 h-4 w-4" /> {t('edit')}
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => openDeleteDialog(link)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> {t('delete')}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Backup Link</DialogTitle>
            <DialogDescription>
              Add a new backup link for users to access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 shrink-0" />
                <Input 
                  id="url" 
                  value={newLinkUrl} 
                  onChange={(e) => setNewLinkUrl(e.target.value)} 
                  placeholder="https://example.com/backup"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={newLinkDescription} 
                onChange={(e) => setNewLinkDescription(e.target.value)} 
                placeholder="Describe what this backup link is for"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsAddDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleAddLink}
              disabled={loading || !newLinkUrl}
            >
              {loading ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Backup Link</DialogTitle>
            <DialogDescription>
              Update the backup link details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <div className="flex items-center gap-2">
                <Link className="h-4 w-4 shrink-0" />
                <Input 
                  id="edit-url" 
                  value={newLinkUrl} 
                  onChange={(e) => setNewLinkUrl(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Textarea 
                id="edit-description" 
                value={newLinkDescription} 
                onChange={(e) => setNewLinkDescription(e.target.value)} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={handleEditLink}
              disabled={loading || !newLinkUrl}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Backup Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this backup link? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteLink}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBackup;
