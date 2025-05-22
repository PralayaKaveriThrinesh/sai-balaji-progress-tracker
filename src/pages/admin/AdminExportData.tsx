
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileOutput, Printer } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateExportData } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { exportToPDF, generateProjectPdfReport } from '@/utils/pdf-export';
import { exportToDocx } from '@/utils/docx-export';

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

  const handleExportDocx = async () => {
    try {
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Prepare project data for Word document
      const projectData = data.projects.map(project => ({
        id: project.id,
        name: project.name,
        location: 'N/A',
        leader: 'N/A',
        completedWork: project.completedWork || 0,
        totalWork: project.totalWork || 0,
        progress: `${Math.round(((project.completedWork || 0) / (project.totalWork || 1)) * 100)}%`
      }));
      
      // Export projects to Word
      await exportToDocx({
        title: t("app.reports.projectsReport"),
        description: t("app.reports.projectsDescription"),
        data: projectData,
        columns: [
          { key: 'name', header: t("app.reports.projectName") },
          { key: 'completedWork', header: t("app.reports.completed") },
          { key: 'totalWork', header: t("app.reports.total") },
          { key: 'progress', header: t("app.reports.progress") }
        ],
        fileName: `saibalaji_projects_report_${new Date().toISOString().split('T')[0]}.docx`
      });
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("Word export error:", error);
      toast.error(t("common.exportError"));
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Get first project for demo
      const firstProject = data.projects[0] || {};
      
      // Generate sample progress data for the project
      const progressUpdates = data.progressUpdates 
        .filter(entry => entry.projectId === firstProject.id)
        .slice(0, 5); // Limit to 5 entries
        
      // Generate sample payment data for the project
      const paymentRequests = data.paymentRequests
        .filter(payment => payment.projectId === firstProject.id)
        .slice(0, 5); // Limit to 5 entries
      
      // Generate PDF report
      const doc = await generateProjectPdfReport(firstProject, progressUpdates, paymentRequests);
      
      // Save the PDF
      doc.save(`project_report_${firstProject.id}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("common.exportError"));
    }
  };

  const handlePrintReport = async () => {
    try {
      toast.info(t("common.generating"));
      
      // Generate the export data
      const data = generateExportData();
      
      // Prepare project data for PDF
      const projectData = data.projects.map(project => ({
        id: project.id,
        name: project.name,
        completedWork: project.completedWork || 0,
        totalWork: project.totalWork || 0,
        progress: `${Math.round(((project.completedWork || 0) / (project.totalWork || 1)) * 100)}%`
      }));
      
      // Export projects to PDF
      await exportToPDF({
        title: t("app.reports.projectsReport"),
        description: t("app.reports.projectsDescription"),
        data: projectData,
        columns: [
          { key: 'name', header: t("app.reports.projectName"), width: 150 },
          { key: 'completedWork', header: t("app.reports.completed"), width: 100 },
          { key: 'totalWork', header: t("app.reports.total"), width: 100 },
          { key: 'progress', header: t("app.reports.progress"), width: 80 }
        ],
        fileName: `saibalaji_projects_report_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'landscape'
      });
      
      toast.success(t("common.exportSuccess"));
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error(t("common.exportError"));
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t("app.reports.exportData")}</h1>
        <p className="text-muted-foreground">
          {t("app.reports.exportDescription")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("app.reports.exportWord")}</CardTitle>
            <CardDescription>
              {t("app.reports.exportWordDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {t("app.reports.exportWordDetails")}
            </p>
            <Button onClick={handleExportDocx} className="w-full">
              <FileText className="mr-2 h-4 w-4" /> {t("app.reports.exportWord")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("app.reports.exportPDF")}</CardTitle>
            <CardDescription>
              {t("app.reports.exportPDFDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6">
              {t("app.reports.exportPDFDetails")}
            </p>
            <Button onClick={handleExportPDF} className="w-full" variant="outline">
              <FileOutput className="mr-2 h-4 w-4" /> {t("app.reports.exportPDF")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("app.reports.printReports")}</CardTitle>
          <CardDescription>
            {t("app.reports.printDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            {t("app.reports.printDetails")}
          </p>
          <Button variant="outline" onClick={handlePrintReport} className="w-full md:w-auto">
            <Printer className="mr-2 h-4 w-4" /> {t("app.reports.print")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportData;
