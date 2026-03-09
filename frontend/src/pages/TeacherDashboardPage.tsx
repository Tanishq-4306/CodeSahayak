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
  AlertCircle,
  Award,
  BookOpen,
  Activity,
  Download,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
        // Try to fetch from API, but use mock data if it fails
        try {
          const response = await api.request('/user/teacher-dashboard');
          setData(response);
        } catch (error) {
          console.log('Using mock teacher dashboard data');
          // Use mock data
          setData({
            assignments: [
              {
                id: '1',
                title: 'Binary Search Implementation',
                subject: 'Algorithms',
                difficulty: 'MEDIUM',
                isActive: true,
                _count: { submissions: 28 },
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: '2',
                title: 'React Component Design',
                subject: 'Web Development',
                difficulty: 'HARD',
                isActive: true,
                _count: { submissions: 15 },
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: '3',
                title: 'SQL Query Practice',
                subject: 'Databases',
                difficulty: 'EASY',
                isActive: true,
                _count: { submissions: 42 },
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              },
              {
                id: '4',
                title: 'Sorting Algorithms',
                subject: 'Data Structures',
                difficulty: 'MEDIUM',
                isActive: false,
                _count: { submissions: 35 },
                createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
              },
            ],
            stats: {
              totalAssignments: 12,
              totalSubmissions: 156,
              pendingSubmissions: 23,
              reviewedSubmissions: 133,
              averageScore: 78,
              uniqueStudents: 45,
            },
          });
        }
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

  // Mock data for enhanced teacher dashboard
  const topStudents = [
    { id: 1, name: 'Priya Sharma', score: 95, submissions: 12, streak: 15, avatar: '/avatar-1.jpg' },
    { id: 2, name: 'Rahul Kumar', score: 92, submissions: 11, streak: 12, avatar: '/avatar-2.jpg' },
    { id: 3, name: 'Ananya Patel', score: 89, submissions: 10, streak: 10, avatar: '/avatar-3.jpg' },
  ];

  const recentActivity = [
    { id: 1, student: 'Priya Sharma', action: 'Submitted "Binary Search"', time: '5 min ago', type: 'submission' },
    { id: 2, student: 'Rahul Kumar', action: 'Completed "Arrays Module"', time: '1 hour ago', type: 'completion' },
    { id: 3, student: 'Ananya Patel', action: 'Asked for help on "Recursion"', time: '2 hours ago', type: 'help' },
    { id: 4, student: 'Vikram Singh', action: 'Started "Data Structures"', time: '3 hours ago', type: 'start' },
  ];

  const classPerformance = [
    { subject: 'Python Basics', avgScore: 85, students: 45, completion: 78 },
    { subject: 'Data Structures', avgScore: 72, students: 38, completion: 65 },
    { subject: 'Algorithms', avgScore: 68, students: 32, completion: 55 },
    { subject: 'Web Development', avgScore: 80, students: 28, completion: 70 },
  ];

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E8EAF6] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">CS</span>
            </div>
            <div>
              <span className="font-bold text-xl text-[#1A1D2B]">CodeSahayak</span>
              <span className="ml-2 text-xs text-[#636E72] hidden sm:inline">Teacher Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] hover:shadow-lg transition-all hidden sm:flex"
              onClick={() => navigate('/assignments/create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Assignment
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex" onClick={() => navigate('/settings')}>
              <Settings className="w-5 h-5 text-[#636E72]" />
            </Button>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-5 h-5 text-[#636E72]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D2B]">
                Welcome, Professor {user?.name?.split(' ')[0] || 'Teacher'}! 👨‍🏫
              </h1>
              <p className="text-[#636E72] mt-1 text-sm sm:text-base">
                {data?.stats?.pendingSubmissions || 0} submissions awaiting your review
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => {/* Export report */}}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button 
                className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] sm:hidden"
                onClick={() => navigate('/assignments/create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-purple-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Total Assignments</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{data?.stats?.totalAssignments || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-3">
                  📚 Active learning modules
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-green-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Total Submissions</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{data?.stats?.totalSubmissions || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-3">
                  ✅ From {data?.stats?.uniqueStudents || 0} students
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-orange-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Pending Review</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{data?.stats?.pendingSubmissions || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-3">
                  ⏰ Awaiting feedback
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Average Score</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{data?.stats?.averageScore || 0}%</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-3">
                  📈 Class performance
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Assignments & Performance */}
          <div className="lg:col-span-2 space-y-6">
            {/* Assignments List */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Your Assignments</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
                      View All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.assignments && data.assignments.length > 0 ? (
                    data.assignments.slice(0, 5).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-xl hover:bg-[#F0F4FA] hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/assignments/${assignment.id}`)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            assignment.isActive ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#1A1D2B] text-sm sm:text-base truncate">{assignment.title}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {assignment.subject}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  assignment.difficulty === 'EASY' ? 'border-green-500 text-green-700 bg-green-50' :
                                  assignment.difficulty === 'MEDIUM' ? 'border-yellow-500 text-yellow-700 bg-yellow-50' :
                                  'border-red-500 text-red-700 bg-red-50'
                                }`}
                              >
                                {assignment.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-[#1A1D2B]">
                              {assignment._count.submissions}
                            </p>
                            <p className="text-xs text-[#636E72]">submissions</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="flex-shrink-0"
                          >
                            <Eye className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-[#636E72]">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">No assignments yet</p>
                      <p className="text-sm mb-4">Create your first assignment to get started</p>
                      <Button 
                        className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE]"
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

            {/* Class Performance */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#6C5CE7]" />
                  Class Performance by Subject
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {classPerformance.map((subject, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#1A1D2B] text-sm">{subject.subject}</p>
                          <p className="text-xs text-[#636E72]">{subject.students} students enrolled</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#1A1D2B]">{subject.avgScore}%</p>
                          <p className="text-xs text-[#636E72]">{subject.completion}% complete</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Progress value={subject.avgScore} className="h-2" />
                        <Progress value={subject.completion} className="h-1 opacity-50" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Submission Overview */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Submission Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">Reviewed</span>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{data?.stats?.reviewedSubmissions || 0}</p>
                    <p className="text-xs text-green-600 mt-1">
                      {data?.stats?.totalSubmissions ? Math.round(((data?.stats?.reviewedSubmissions || 0) / data.stats.totalSubmissions) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-700">{data?.stats?.pendingSubmissions || 0}</p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Needs your attention
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">Students</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">{data?.stats?.uniqueStudents || 0}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Active learners
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Top Students & Activity */}
          <div className="space-y-6">
            {/* Top Performing Students */}
            <Card className="border-[#E8EAF6] bg-gradient-to-br from-white to-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  Top Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8EAF6] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="relative">
                        <img 
                          src={student.avatar} 
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          'bg-orange-400 text-orange-900'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#1A1D2B] text-sm truncate">{student.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[#636E72]">
                          <span>{student.submissions} submissions</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <span className="text-orange-500">🔥</span>
                            {student.streak}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#6C5CE7]">{student.score}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#6C5CE7]" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-[#E8EAF6] last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'submission' ? 'bg-blue-100' :
                        activity.type === 'completion' ? 'bg-green-100' :
                        activity.type === 'help' ? 'bg-orange-100' :
                        'bg-purple-100'
                      }`}>
                        {activity.type === 'submission' ? <FileText className="w-4 h-4 text-blue-600" /> :
                         activity.type === 'completion' ? <CheckCircle className="w-4 h-4 text-green-600" /> :
                         activity.type === 'help' ? <AlertCircle className="w-4 h-4 text-orange-600" /> :
                         <BookOpen className="w-4 h-4 text-purple-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1A1D2B] leading-tight">
                          {activity.student}
                        </p>
                        <p className="text-xs text-[#636E72] mt-0.5">{activity.action}</p>
                        <p className="text-xs text-[#636E72] mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-[#E8EAF6] bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/assignments/create')}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Assignment
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/submissions/pending')}
                  >
                    <Clock className="w-4 h-4 mr-2" />
                    Review Pending ({data?.stats?.pendingSubmissions || 0})
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/students')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    View All Students
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {/* Export analytics */}}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
