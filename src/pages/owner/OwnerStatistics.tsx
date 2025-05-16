
import { useState, useEffect, useRef } from 'react';
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
  Cell
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
const PAYMENT_TYPES = ["food", "fuel", "labour", "vehicle", "water", "other"];

const OwnerStatistics = () => {
  const { user } = useAuth();
  const [timeframe, setTimeframe] = useState<'today' | 'week'>('today');
  const [projects, setProjects] = useState<Project[]>([]);
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [leaders, setLeaders] = useState<User[]>([]);
  
  // Charts data
  const [expensesByPurpose, setExpensesByPurpose] = useState<any[]>([]);
  const [projectProgress, setProjectProgress] = useState<any[]>([]);
  const [leaderPerformance, setLeaderPerformance] = useState<any[]>([]);
  
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
    
    // Filter paid payments by date
    const filteredPayments = paymentRequests.filter(payment => {
      const paymentDate = new Date(payment.date);
      if (timeframe === 'today') {
        return paymentDate >= today && payment.status === 'paid';
      } else {
        return paymentDate >= weekAgo && payment.status === 'paid';
      }
    });
    
    // Expenses by purpose
    const expenseData = PAYMENT_TYPES.map(purpose => {
      const amount = filteredPayments
        .flatMap(payment => payment.purposes)
        .filter(p => p.type === purpose)
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Only include non-zero values
      return amount > 0 ? { name: purpose, amount } : null;
    }).filter(Boolean); // Remove null items
    
    setExpensesByPurpose(expenseData);
    
    // Project progress
    const progressData = projects
      .filter(project => project.completedWork > 0) // Only show projects with progress
      .map(project => ({
        name: project.name.length > 10 ? project.name.substring(0, 10) + '...' : project.name,
        completedPercent: Math.min(100, Math.round((project.completedWork / project.totalWork) * 100))
      }));
    
    setProjectProgress(progressData);
    
    // Leader performance - work completed in the timeframe
    const leaderData = leaders.map(leader => {
      // Get projects for this leader
      const leaderProjects = projects.filter(p => p.leaderId === leader.id);
      
      // Get progress updates for these projects in the timeframe
      const leaderUpdates = progressUpdates.filter(update => {
        const updateDate = new Date(update.date);
        const isInTimeframe = timeframe === 'today' 
          ? updateDate >= today 
          : updateDate >= weekAgo;
        
        return isInTimeframe && leaderProjects.some(p => p.id === update.projectId);
      });
      
      // Calculate total work completed
      const workCompleted = leaderUpdates.reduce((sum, update) => sum + update.completedWork, 0);
      
      return {
        name: leader.name,
        workCompleted: workCompleted
      };
    }).filter(item => item.workCompleted > 0); // Only include leaders with completed work
    
    setLeaderPerformance(leaderData);
    
  }, [timeframe, projects, paymentRequests, progressUpdates, leaders]);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-6">Project Statistics</h1>
      <p className="text-muted-foreground mb-8">
        View analytics and insights about project progress and expenses.
      </p>
      
      <Tabs 
        defaultValue="today" 
        value={timeframe}
        onValueChange={(value) => setTimeframe(value as 'today' | 'week')}
        className="mb-8"
      >
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">Last 7 Days</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid gap-6 md:grid-cols-2">
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
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
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
            <CardTitle>Expense Distribution</CardTitle>
            <CardDescription>
              Proportion of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {expensesByPurpose.length > 0 ? (
              <FullscreenChart title="Expense Distribution">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesByPurpose}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {expensesByPurpose.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`₹ ${value}`, 'Amount']}
                      labelFormatter={(name) => `${name.charAt(0).toUpperCase()}${name.slice(1)}`}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </FullscreenChart>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No expense data for this period</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OwnerStatistics;
