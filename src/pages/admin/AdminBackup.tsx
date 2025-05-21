import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { FileDown, Link, Plus, Trash2, FileEdit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
// Import the type augmentation for jsPDF instead of the module
import 'jspdf-autotable';
import { CustomDatabase } from '@/types/supabase-database-types';

// Add type augmentation for the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => any;
    lastAutoTable: {
      finalY: number;
    } | undefined;
  }
}

interface BackupLink {
  id: string;
  url: string;
  description?: string;
  created_by: string;
  created_at: string;
}

const AdminBackup = () => {
  const { user } = useAuth();
  const [backupLinks, setBackupLinks] = useState<BackupLink[]>([]);
  const [newLink, setNewLink] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentLink, setCurrentLink] = useState<BackupLink | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  
  // Fetch backup links
  useEffect(() => {
    const fetchBackupLinks = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('backup_links' as keyof CustomDatabase['public']['Tables'])
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching backup links:', error);
          toast({ title: "Error", description: "Failed to fetch backup links", variant: "destructive" });
          return;
        }
        
        setBackupLinks(data || []);
      } catch (error) {
        console.error('Error in fetchBackupLinks:', error);
        toast({ title: "Error", description: "An error occurred while fetching backup links", variant: "destructive" });
      }
    };
    
    fetchBackupLinks();
    
    // Set up realtime subscription for backup_links table
    const channel = supabase.channel('backup_links_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'backup_links'
      }, (payload) => {
        console.log('Backup links changed:', payload);
        fetchBackupLinks();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  const handleAddLink = async () => {
    if (!newLink) {
      toast({ title: "Error", description: "Please enter a backup link", variant: "destructive" });
      return;
    }
    
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to add backup links", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('backup_links' as keyof CustomDatabase['public']['Tables'])
        .insert({
          url: newLink,
          description: newLinkDescription || '',
          created_by: user.id
        } as any);
      
      if (error) {
        console.error('Error adding backup link:', error);
        toast({ title: "Error", description: "Failed to add backup link", variant: "destructive" });
        return;
      }
      
      toast({ title: "Success", description: "Backup link added successfully" });
      setIsAddDialogOpen(false);
      setNewLink('');
      setNewLinkDescription('');
    } catch (error) {
      console.error('Error in handleAddLink:', error);
      toast({ title: "Error", description: "An error occurred while adding the backup link", variant: "destructive" });
    }
  };
  
  const handleEditLink = async () => {
    if (!currentLink || !currentLink.url) {
      toast({ title: "Error", description: "Please enter a valid URL", variant: "destructive" });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('backup_links' as keyof CustomDatabase['public']['Tables'])
        .update({
          url: currentLink.url,
          description: currentLink.description || ''
        } as any)
        .eq('id', currentLink.id);
      
      if (error) {
        console.error('Error updating backup link:', error);
        toast({ title: "Error", description: "Failed to update backup link", variant: "destructive" });
        return;
      }
      
      toast({ title: "Success", description: "Backup link updated successfully" });
      setIsEditDialogOpen(false);
      setCurrentLink(null);
    } catch (error) {
      console.error('Error in handleEditLink:', error);
      toast({ title: "Error", description: "An error occurred while updating the backup link", variant: "destructive" });
    }
  };
  
  const handleDeleteLink = async (id: string) => {
    if (!confirm('Are you sure you want to delete this backup link?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('backup_links' as keyof CustomDatabase['public']['Tables'])
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting backup link:', error);
        toast({ title: "Error", description: "Failed to delete backup link", variant: "destructive" });
        return;
      }
      
      toast({ title: "Success", description: "Backup link deleted successfully" });
    } catch (error) {
      console.error('Error in handleDeleteLink:', error);
      toast({ title: "Error", description: "An error occurred while deleting the backup link", variant: "destructive" });
    }
  };
  
  const exportToExcel = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all data from tables
      const [
        { data: projects },
        { data: progressUpdates },
        { data: paymentRequests },
        { data: paymentPurposes },
        { data: profiles }
      ] = await Promise.all([
        supabase.from('projects' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('progress_updates' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('payment_requests' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('payment_purposes' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('profiles' as keyof CustomDatabase['public']['Tables']).select('*')
      ]);
      
      // Create workbook with multiple sheets
      const wb = XLSX.utils.book_new();
      
      // Add each table as a sheet
      if (projects) {
        const ws = XLSX.utils.json_to_sheet(projects);
        XLSX.utils.book_append_sheet(wb, ws, 'Projects');
      }
      
      if (progressUpdates) {
        const ws = XLSX.utils.json_to_sheet(progressUpdates);
        XLSX.utils.book_append_sheet(wb, ws, 'Progress Updates');
      }
      
      if (paymentRequests) {
        const ws = XLSX.utils.json_to_sheet(paymentRequests);
        XLSX.utils.book_append_sheet(wb, ws, 'Payment Requests');
      }
      
      if (paymentPurposes) {
        const ws = XLSX.utils.json_to_sheet(paymentPurposes);
        XLSX.utils.book_append_sheet(wb, ws, 'Payment Purposes');
      }
      
      if (profiles) {
        // Remove sensitive data
        const safeProfiles = profiles.map(({ id, name, role, email }) => ({
          id, name, role, email
        }));
        const ws = XLSX.utils.json_to_sheet(safeProfiles);
        XLSX.utils.book_append_sheet(wb, ws, 'Users');
      }
      
      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Save the file
      saveAs(data, `saibalaji_data_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({ title: "Success", description: "Data exported successfully to Excel" });
    } catch (error) {
      console.error('Error exporting data to Excel:', error);
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };
  
  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      // Fetch all data from tables
      const [
        { data: projects },
        { data: progressUpdates },
        { data: paymentRequests },
        { data: profiles }
      ] = await Promise.all([
        supabase.from('projects' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('progress_updates' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('payment_requests' as keyof CustomDatabase['public']['Tables']).select('*'),
        supabase.from('profiles' as keyof CustomDatabase['public']['Tables']).select('*')
      ]);
      
      // Create PDF document
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text('SaiBalaji Progress Tracker - Data Export', 14, 22);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      // Add Projects table
      doc.setFontSize(14);
      doc.text('Projects', 14, 40);
      if (projects && projects.length > 0) {
        const projectsData = projects.map(p => [
          p.name, 
          p.workers, 
          p.total_work, 
          p.completed_work, 
          new Date(p.created_at).toLocaleDateString()
        ]);
        
        doc.autoTable({
          head: [['Name', 'Workers', 'Total Work', 'Completed', 'Created Date']],
          body: projectsData,
          startY: 45
        });
      } else {
        doc.setFontSize(10);
        doc.text('No projects found', 14, 45);
      }
      
      // Add Progress Updates table
      const progressY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 60;
      doc.setFontSize(14);
      doc.text('Progress Updates', 14, progressY);
      if (progressUpdates && progressUpdates.length > 0) {
        const updatesData = progressUpdates.map(u => [
          u.project_id, 
          u.completed_work, 
          u.time_taken,
          new Date(u.date).toLocaleDateString()
        ]);
        
        doc.autoTable({
          head: [['Project ID', 'Completed Work', 'Time Taken', 'Date']],
          body: updatesData,
          startY: progressY + 5
        });
      } else {
        doc.setFontSize(10);
        doc.text('No progress updates found', 14, progressY + 5);
      }
      
      // Add Payment Requests table
      const paymentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 80;
      doc.setFontSize(14);
      doc.text('Payment Requests', 14, paymentY);
      if (paymentRequests && paymentRequests.length > 0) {
        const requestsData = paymentRequests.map(r => [
          r.project_id, 
          r.total_amount, 
          r.status,
          new Date(r.date).toLocaleDateString()
        ]);
        
        doc.autoTable({
          head: [['Project ID', 'Amount', 'Status', 'Date']],
          body: requestsData,
          startY: paymentY + 5
        });
      } else {
        doc.setFontSize(10);
        doc.text('No payment requests found', 14, paymentY + 5);
      }
      
      // Save the PDF
      doc.save(`saibalaji_data_export_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({ title: "Success", description: "Data exported successfully to PDF" });
    } catch (error) {
      console.error('Error exporting data to PDF:', error);
      toast({ title: "Error", description: "Failed to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };
  
  const handleExport = () => {
    if (exportFormat === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };
  
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Backup & Data Export</h1>
          <p className="text-muted-foreground">
            Manage backup links and export project data
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setIsExportDialogOpen(true)}>
            <FileDown className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Backup Link
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Backup Links</CardTitle>
            <CardDescription>
              Backup links shared with project owners
            </CardDescription>
          </CardHeader>
          <CardContent>
            {backupLinks.length > 0 ? (
              <div className="space-y-4">
                {backupLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex-grow mr-4">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCurrentLink(link);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <FileEdit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No backup links have been added yet.</p>
                <p className="text-sm">Add a link using the button above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Add Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Backup Link</DialogTitle>
            <DialogDescription>
              Add a backup link to share with project owners.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="backup-url">Backup URL</Label>
              <Input
                id="backup-url"
                placeholder="https://..."
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Textarea
                id="backup-description"
                placeholder="Enter a description for this backup link"
                value={newLinkDescription}
                onChange={(e) => setNewLinkDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Link Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Backup Link</DialogTitle>
            <DialogDescription>
              Update the backup link details.
            </DialogDescription>
          </DialogHeader>
          
          {currentLink && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-url">Backup URL</Label>
                <Input
                  id="edit-url"
                  placeholder="https://..."
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({ ...currentLink, url: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter a description for this backup link"
                  value={currentLink.description || ''}
                  onChange={(e) => setCurrentLink({ ...currentLink, description: e.target.value })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEditLink}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Project Data</DialogTitle>
            <DialogDescription>
              Export all project data to a file for backup or analysis.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="format-excel"
                    name="export-format"
                    className="mr-2"
                    checked={exportFormat === 'excel'}
                    onChange={() => setExportFormat('excel')}
                  />
                  <Label htmlFor="format-excel">Excel (.xlsx)</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="format-pdf"
                    name="export-format"
                    className="mr-2"
                    checked={exportFormat === 'pdf'}
                    onChange={() => setExportFormat('pdf')}
                  />
                  <Label htmlFor="format-pdf">PDF</Label>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <p className="text-sm text-muted-foreground">
                The export will include:
              </p>
              <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                <li>All projects data</li>
                <li>All progress updates</li>
                <li>All payment requests and purposes</li>
                <li>User information (excluding credentials)</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isExporting}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBackup;
