
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateExportData } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

const AdminExportData: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const handleExportData = () => {
    try {
      // Generate the export data
      const data = generateExportData();
      
      // Convert to JSON string
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create a blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `saibalaji_export_${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data");
    }
  };

  const handleExportPDF = () => {
    toast.info("PDF export functionality", {
      description: "This feature is under development and will be available soon."
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Export Data</h1>
        <p className="text-muted-foreground">
          Export all application data for backup or reporting purposes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export as JSON</CardTitle>
            <CardDescription>
              Export all data in JSON format for backup or programmatic processing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              This will export all projects, progress updates, payment requests, vehicles and drivers.
              User credentials and backup links are excluded for security.
            </p>
            <Button onClick={handleExportData} className="w-full">
              <Download className="mr-2 h-4 w-4" /> Export JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export as PDF</CardTitle>
            <CardDescription>
              Export a formatted PDF report with all system data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              This will generate a comprehensive PDF report with all system data in a readable format.
              Images will be included in the report.
            </p>
            <Button onClick={handleExportPDF} className="w-full" variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Statistics</CardTitle>
          <CardDescription>
            Export specific metrics and statistics from the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Project Completion Report
            </Button>
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Payment Summary
            </Button>
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Worker Performance
            </Button>
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Vehicle Usage Report
            </Button>
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Monthly Progress Report
            </Button>
            <Button variant="outline" onClick={() => toast.info("Feature coming soon")}>
              Financial Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportData;
