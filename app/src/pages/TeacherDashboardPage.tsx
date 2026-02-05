import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Plus,
  Eye,
  BarChart3,
  Settings,
  LogOut,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/store/authStore';

interface TeacherDashboardData {
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    isActive: boolean;
    _count: { submissions: number };
    createdAt: string;
  }>;
  stats: {
    totalAssignments: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    reviewedSubmissions: number;
    averageScore: number;
    uniqueStudents: number;
  };
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    if (user?.role !== 'TEACHER' && user?.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await api.request('/user/teacher-dashboard');
        setData(response);
      } catch (error) {
        console.error('Failed to fetch teacher dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !data) return null;

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Header */}
      <header className="bg-white border-b border-[#DFE6E9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CS</span>
            </div>
            <div>
              <span className="font-bold text-xl text-[#2D3436]">CodeSahayak</span>
              <span className="ml-2 text-sm text-[#636E72]">Teacher Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[#2D3436]">
            Welcome, Professor {user.name.split(' ')[0]}!
          </h1>
          <p className="text-[#636E72] mt-1">
            Manage your assignments and track student progress
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#636E72]">Total Assignments</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{data.stats.totalAssignments}</p>
                  </div>
                  <FileText className="w-8 h-8 text-[#6C5CE7]" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#636E72]">Total Submissions</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{data.stats.totalSubmissions}</p>
                  </div>
                  <GraduationCap className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#636E72]">Pending Review</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{data.stats.pendingSubmissions}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#636E72]">Average Score</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{data.stats.averageScore}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border border-[#DFE6E9]">
              <TabsTrigger value="assignments" className="gap-2">
                <FileText className="w-4 h-4" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <Button 
              className="bg-[#6C5CE7]"
              onClick={() => navigate('/assignments/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
          </div>

          <TabsContent value="assignments">
            <Card>
              <CardHeader>
                <CardTitle>Your Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.assignments.length > 0 ? (
                    data.assignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-lg hover:bg-[#E8EAF6] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            assignment.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-[#2D3436]">{assignment.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {assignment.subject}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  assignment.difficulty === 'EASY' ? 'border-green-500 text-green-700' :
                                  assignment.difficulty === 'MEDIUM' ? 'border-yellow-500 text-yellow-700' :
                                  'border-red-500 text-red-700'
                                }`}
                              >
                                {assignment.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm font-medium text-[#2D3436]">
                              {assignment._count.submissions} submissions
                            </p>
                            <p className="text-xs text-[#636E72]">
                              Created {new Date(assignment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/assignments/${assignment.id}`)}
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[#636E72]">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No assignments yet</p>
                      <p className="text-sm mt-1">Create your first assignment to get started</p>
                      <Button 
                        className="mt-4 bg-[#6C5CE7]"
                        onClick={() => navigate('/assignments/create')}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Submission Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-[#2D3436]">Reviewed</span>
                      </div>
                      <span className="font-bold text-green-700">{data.stats.reviewedSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-600" />
                        <span className="text-[#2D3436]">Pending</span>
                      </div>
                      <span className="font-bold text-yellow-700">{data.stats.pendingSubmissions}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-[#2D3436]">Unique Students</span>
                      </div>
                      <span className="font-bold text-blue-700">{data.stats.uniqueStudents}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#636E72]">Average Score</span>
                        <span className="font-bold text-[#2D3436]">{data.stats.averageScore}%</span>
                      </div>
                      <div className="h-3 bg-[#DFE6E9] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] rounded-full transition-all"
                          style={{ width: `${data.stats.averageScore}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#F6F7FB] rounded-lg text-center">
                        <p className="text-3xl font-bold text-[#6C5CE7]">{data.stats.totalAssignments}</p>
                        <p className="text-sm text-[#636E72]">Assignments</p>
                      </div>
                      <div className="p-4 bg-[#F6F7FB] rounded-lg text-center">
                        <p className="text-3xl font-bold text-green-600">{data.stats.totalSubmissions}</p>
                        <p className="text-sm text-[#636E72]">Submissions</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
