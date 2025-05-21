
import React, { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useLanguage } from '@/context/language-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FilePdf, FileExport } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { generateExportData } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { exportToPDF, convertChartDataForPdf } from '@/utils/pdf-export';

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

  const handleExportPDF = async () => {
    try {
      toast.info("Generating PDF report...");
      
      // Generate the export data
      const data = generateExportData();
      
      // Prepare project data for PDF
      const projectData = data.projects.map(project => ({
        id: project.id,
        name: project.name,
        location: project.location,
        leader: project.leaderName,
        completedWork: project.completedWork,
        totalWork: project.totalWork,
        progress: `${Math.round((project.completedWork / project.totalWork) * 100)}%`
      }));
      
      // Export projects to PDF
      await exportToPDF({
        title: 'Projects Report',
        description: 'Overview of all projects in the system',
        data: projectData,
        columns: [
          { key: 'name', header: 'Project Name', width: 150 },
          { key: 'location', header: 'Location', width: 100 },
          { key: 'leader', header: 'Team Leader', width: 100 },
          { key: 'completedWork', header: 'Completed (m)', width: 100 },
          { key: 'totalWork', header: 'Total (m)', width: 100 },
          { key: 'progress', header: 'Progress', width: 80 }
        ],
        fileName: `saibalaji_projects_report_${new Date().toISOString().split('T')[0]}.pdf`,
        orientation: 'landscape'
      });
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  const handleExportStatisticsReport = async (reportType: string) => {
    try {
      toast.info(`Generating ${reportType} report...`);
      
      // Generate the export data
      const data = generateExportData();
      
      switch (reportType) {
        case 'project-completion': {
          // Project completion statistics
          const projectStats = data.projects.map(project => ({
            name: project.name,
            value: Math.round((project.completedWork / project.totalWork) * 100)
          }));
          
          const pdfOptions = convertChartDataForPdf(
            projectStats, 
            'Project Completion Report', 
            'Completion percentage for all projects'
          );
          
          await exportToPDF({
            ...pdfOptions,
            columns: [
              { key: 'name', header: 'Project Name', width: 300 },
              { key: 'value', header: 'Completion %', width: 150 }
            ]
          });
          break;
        }
        
        case 'payment-summary': {
          // Payment summary
          const paymentData = data.payments.map(payment => ({
            id: payment.id,
            project: payment.projectName,
            amount: `₹${payment.totalAmount.toLocaleString()}`,
            status: payment.status,
            requestDate: new Date(payment.requestDate).toLocaleDateString(),
            requestedBy: payment.leaderName
          }));
          
          await exportToPDF({
            title: 'Payment Summary Report',
            description: 'Summary of all payment requests',
            data: paymentData,
            columns: [
              { key: 'project', header: 'Project', width: 150 },
              { key: 'amount', header: 'Amount', width: 100 },
              { key: 'status', header: 'Status', width: 100 },
              { key: 'requestDate', header: 'Request Date', width: 100 },
              { key: 'requestedBy', header: 'Requested By', width: 150 }
            ],
            fileName: `payment_summary_${new Date().toISOString().split('T')[0]}.pdf`,
            orientation: 'landscape'
          });
          break;
        }

        case 'worker-performance': {
          // Worker performance report
          const leaderStats = data.leaderStats?.map(leader => ({
            name: leader.leaderName,
            projects: leader.projectCount,
            completionRate: `${leader.completionPercentage}%`,
            distance: `${leader.totalDistance} meters`,
            time: `${leader.totalTime} hours`
          })) || [];
          
          await exportToPDF({
            title: 'Worker Performance Report',
            description: 'Performance metrics for team leaders',
            data: leaderStats,
            columns: [
              { key: 'name', header: 'Team Leader', width: 150 },
              { key: 'projects', header: 'Projects', width: 80 },
              { key: 'completionRate', header: 'Completion %', width: 100 },
              { key: 'distance', header: 'Total Distance', width: 120 },
              { key: 'time', header: 'Total Hours', width: 100 }
            ],
            fileName: `worker_performance_${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
        }
        
        case 'vehicle-usage': {
          // Vehicle usage report
          const vehicleData = data.vehicles?.map(vehicle => ({
            name: vehicle.registrationNumber,
            type: vehicle.vehicleType,
            capacity: vehicle.capacity,
            status: vehicle.status,
            assignedTo: vehicle.assignedDriver || 'Unassigned'
          })) || [];
          
          await exportToPDF({
            title: 'Vehicle Usage Report',
            description: 'Status and assignment of all vehicles',
            data: vehicleData,
            columns: [
              { key: 'name', header: 'Registration', width: 120 },
              { key: 'type', header: 'Type', width: 100 },
              { key: 'capacity', header: 'Capacity', width: 80 },
              { key: 'status', header: 'Status', width: 100 },
              { key: 'assignedTo', header: 'Driver', width: 150 }
            ],
            fileName: `vehicle_usage_${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
        }
        
        case 'monthly-progress': {
          // Monthly progress report (simplified example)
          const monthlyData = [
            { name: 'January', value: 120 },
            { name: 'February', value: 150 },
            { name: 'March', value: 180 },
            { name: 'April', value: 220 },
            { name: 'May', value: 310 },
            { name: 'June', value: 290 }
          ];
          
          const pdfOptions = convertChartDataForPdf(
            monthlyData, 
            'Monthly Progress Report', 
            'Construction progress by month (meters completed)'
          );
          
          await exportToPDF({
            ...pdfOptions,
            columns: [
              { key: 'name', header: 'Month', width: 150 },
              { key: 'value', header: 'Meters Completed', width: 150 }
            ]
          });
          break;
        }
        
        case 'financial-summary': {
          // Financial summary (simplified example)
          const financialData = [
            { category: 'Labor Costs', amount: 450000, percentage: '45%' },
            { category: 'Materials', amount: 320000, percentage: '32%' },
            { category: 'Equipment', amount: 150000, percentage: '15%' },
            { category: 'Transportation', amount: 50000, percentage: '5%' },
            { category: 'Miscellaneous', amount: 30000, percentage: '3%' }
          ];
          
          await exportToPDF({
            title: 'Financial Summary Report',
            description: 'Breakdown of project expenditures',
            data: financialData,
            columns: [
              { key: 'category', header: 'Expense Category', width: 200 },
              { key: 'amount', header: 'Amount (₹)', width: 150 },
              { key: 'percentage', header: 'Percentage', width: 100 }
            ],
            fileName: `financial_summary_${new Date().toISOString().split('T')[0]}.pdf`
          });
          break;
        }
        
        default:
          toast.error("Unknown report type");
          return;
      }
      
      toast.success(`${reportType} report exported successfully`);
    } catch (error) {
      console.error("Statistics export error:", error);
      toast.error("Failed to export statistics report");
    }
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
              <FileExport className="mr-2 h-4 w-4" /> Export JSON
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
              <FilePdf className="mr-2 h-4 w-4" /> Export PDF
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
            <Button variant="outline" onClick={() => handleExportStatisticsReport('project-completion')}>
              Project Completion Report
            </Button>
            <Button variant="outline" onClick={() => handleExportStatisticsReport('payment-summary')}>
              Payment Summary
            </Button>
            <Button variant="outline" onClick={() => handleExportStatisticsReport('worker-performance')}>
              Worker Performance
            </Button>
            <Button variant="outline" onClick={() => handleExportStatisticsReport('vehicle-usage')}>
              Vehicle Usage Report
            </Button>
            <Button variant="outline" onClick={() => handleExportStatisticsReport('monthly-progress')}>
              Monthly Progress Report
            </Button>
            <Button variant="outline" onClick={() => handleExportStatisticsReport('financial-summary')}>
              Financial Summary
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExportData;
