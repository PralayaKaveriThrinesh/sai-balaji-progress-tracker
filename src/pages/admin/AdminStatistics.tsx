
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FullscreenChart } from '@/components/shared/fullscreen-chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  getAllProjects, 
  getAllPaymentRequests, 
  getAllProgressUpdates,
  getAllUsers
} from '@/lib/storage';
import { Project, PaymentRequest, ProgressUpdate, User } from '@/lib/types';

// Custom colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AdminStatistics = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [projects, setProjects] = useState<Project[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [leaders, setLeaders] = useState<User[]>([]);
  
  // Charts data
  const [expensesByPurpose, setExpensesByPurpose] = useState<any[]>([]);
  const [projectProgress, setProjectProgress] = useState<any[]>([]);
  const [leaderPerformance, setLeaderPerformance] = useState<any[]>([]);
  const [paymentStatusData, setPaymentStatusData] = useState<any[]>([]);
  const [progressTimeline, setProgressTimeline] = useState<any[]>([]);
  
  useEffect(() => {
    // Fetch all data
    const allProjects = getAllProjects();
    setProjects(allProjects);
    
    const allPayments = getAllPaymentRequests();
    setPaymentRequests(allPayments);
    
    const allProgress = getAllProgressUpdates();
    setProgressUpdates(allProgress);
    
    const allLeaders = getAllUsers().filter(user => user.role === 'leader');
    setLeaders(allLeaders);
  }, []);
  
  useEffect(() => {
    // Filter data based on timeframe
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    let startDate: Date;
    switch (timeframe) {
      case 'today':
        startDate = today;
        break;
      case 'week':
        startDate = weekAgo;
        break;
      case 'month':
        startDate = monthAgo;
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
    }
    
    // Filter payments
    const filteredPayments = paymentRequests.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startDate;
    });
    
    // Filter progress updates
    const filteredUpdates = progressUpdates.filter(update => {
      const updateDate = new Date(update.date);
      return updateDate >= startDate;
    });
    
    // Expenses by purpose
    const purposeTypes = ["food", "fuel", "labour", "vehicle", "water", "other"];
    const expenseData = purposeTypes.map(purpose => {
      const amount = filteredPayments
        .filter(payment => payment.status === 'paid')
        .flatMap(payment => payment.purposes)
        .filter(p => p.type === purpose)
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Only include non-zero values
      return amount > 0 ? { name: purpose, amount } : null;
    }).filter(Boolean); // Remove null values
    
    setExpensesByPurpose(expenseData);
    
    // Project progress
    const progressData = projects
      .filter(project => project.completedWork > 0) // Only show projects with progress
      .map(project => ({
        name: project.name.length > 12 ? project.name.substring(0, 12) + '...' : project.name,
        completedPercent: Math.min(100, Math.round((project.completedWork / project.totalWork) * 100))
      }));
    
    setProjectProgress(progressData);
    
    // Leader performance
    const leaderData = leaders.map(leader => {
      // Get projects for this leader
      const leaderProjects = projects.filter(p => p.leaderId === leader.id);
      
      // Get progress updates for these projects in the timeframe
      const leaderUpdates = filteredUpdates.filter(update => 
        leaderProjects.some(p => p.id === update.projectId)
      );
      
      // Calculate total work completed
      const workCompleted = leaderUpdates.reduce((sum, update) => sum + update.completedWork, 0);
      
      return {
        name: leader.name,
        workCompleted: workCompleted
      };
    }).filter(item => item.workCompleted > 0); // Only include leaders with work completed
    
    setLeaderPerformance(leaderData);
    
    // Payment status distribution
    const statusCounts = filteredPayments.reduce((acc: Record<string, number>, payment) => {
      acc[payment.status] = (acc[payment.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }));
    
    setPaymentStatusData(statusData);
    
    // Progress timeline data
    // Group progress updates by date and sum completed work
    const timelineData = filteredUpdates.reduce((acc: Record<string, number>, update) => {
      const date = new Date(update.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + update.completedWork;
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const timelineArray = Object.entries(timelineData)
      .map(([date, work]) => ({ date, work }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    setProgressTimeline(timelineArray);
    
  }, [timeframe, projects, paymentRequests, progressUpdates, leaders]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Project Statistics</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive analytics and insights about all project activities.
      </p>
      
      <Tabs 
        defaultValue="all" 
        value={timeframe}
        onValueChange={(value) => setTimeframe(value as 'today' | 'week' | 'month' | 'all')}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Last 7 Days</TabsTrigger>
          <TabsTrigger value="month">Last 30 Days</TabsTrigger>
          <TabsTrigger value="all">All Time</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Purpose</CardTitle>
            <CardDescription>
              Breakdown of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {expensesByPurpose.length > 0 ? (
              <FullscreenChart title="Expenses by Purpose">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expensesByPurpose}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`₹ ${value}`, 'Amount']}
                      labelFormatter={(name) => `${name.charAt(0).toUpperCase()}${name.slice(1)}`}
                    />
                    <Legend />
                    <Bar dataKey="amount" name="Amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </FullscreenChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Project Completion</CardTitle>
            <CardDescription>
              Percentage of work completed per project
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {projectProgress.length > 0 ? (
              <FullscreenChart title="Project Completion">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={projectProgress}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Completed']} />
                    <Legend />
                    <Bar dataKey="completedPercent" name="Completed %" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </FullscreenChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No project progress data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Work by Leader</CardTitle>
            <CardDescription>
              Work completed (meters) by each project leader
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {leaderPerformance.length > 0 ? (
              <FullscreenChart title="Work by Leader">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leaderPerformance}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="workCompleted" name="Meters Completed" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </FullscreenChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No leader performance data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              Distribution of payment requests by status
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {paymentStatusData.length > 0 ? (
              <FullscreenChart title="Payment Status">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </FullscreenChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No payment data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Timeline</CardTitle>
          <CardDescription>
            Work completed (meters) over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          {progressTimeline.length > 0 ? (
            <FullscreenChart title="Progress Timeline">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={progressTimeline}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => [`${value} meters`, 'Work Completed']} />
                  <Legend />
                  <Line type="monotone" dataKey="work" name="Work Completed" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </FullscreenChart>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No progress timeline data for this period</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatistics;
