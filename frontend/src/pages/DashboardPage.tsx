import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Trophy,
  Star,
  Target,
  BookOpen,
  Clock,
  Award,
  Settings,
  LogOut,
  Crown,
  Code,
  Calendar,
  CheckCircle2,
  Play,
  Zap,
  Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/store/authStore';

interface DashboardStats {
  user: {
    streak: number;
    xp: number;
    level: number;
    isPro: boolean;
    lastActive?: string;
  };
  stats: {
    totalConcepts: number;
    masteredConcepts: number;
    totalAttempts: number;
    averageMastery: number;
  };
  progress: Array<{
    concept: string;
    masteryLevel: number;
    attempts: number;
  }>;
  recentSubmissions: Array<{
    id: string;
    assignment: {
      title: string;
      subject: string;
    };
    status: string;
    score?: number;
    submittedAt: string;
  }>;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchDashboard = async () => {
      try {
        // Try to fetch from API, but use mock data if it fails
        try {
          const data = await api.request('/user/dashboard');
          setStats(data);
        } catch (error) {
          console.log('Using mock dashboard data');
          // Use mock data
          setStats({
            user: {
              streak: user?.streak || 7,
              xp: user?.xp || 450,
              level: user?.level || 5,
              isPro: user?.isPro || false,
              lastActive: new Date().toISOString(),
            },
            stats: {
              totalConcepts: 15,
              masteredConcepts: 8,
              totalAttempts: 45,
              averageMastery: 65,
            },
            progress: [
              { concept: 'Variables & Data Types', masteryLevel: 85, attempts: 12 },
              { concept: 'Control Flow', masteryLevel: 70, attempts: 8 },
              { concept: 'Functions', masteryLevel: 60, attempts: 10 },
              { concept: 'Arrays & Lists', masteryLevel: 75, attempts: 15 },
            ],
            recentSubmissions: [
              {
                id: '1',
                assignment: { title: 'Binary Search Implementation', subject: 'Algorithms' },
                status: 'PASSED',
                score: 95,
                submittedAt: new Date().toISOString(),
              },
              {
                id: '2',
                assignment: { title: 'Sorting Algorithm', subject: 'Data Structures' },
                status: 'REVIEWED',
                score: 88,
                submittedAt: new Date().toISOString(),
              },
            ],
          });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#636E72] mb-4">Unable to load dashboard</p>
          <Button onClick={() => navigate('/auth')}>Back to Login</Button>
        </div>
      </div>
    );
  }

  const xpToNextLevel = (user.level || 1) * 100;
  const currentLevelXp = (user.xp || 0) % 100;
  const xpProgress = (currentLevelXp / 100) * 100;

  // Mock data for learning paths and upcoming assignments
  const learningPaths = [
    { id: 1, title: 'Python Basics', progress: 75, lessons: 12, completed: 9, color: '#2E86AB' },
    { id: 2, title: 'Data Structures', progress: 40, lessons: 15, completed: 6, color: '#6C5CE7' },
    { id: 3, title: 'Web Development', progress: 20, lessons: 20, completed: 4, color: '#14b8a6' },
  ];

  const upcomingAssignments = [
    { id: 1, title: 'Binary Search Implementation', subject: 'Algorithms', dueDate: '2026-03-12', difficulty: 'Medium' },
    { id: 2, title: 'React Component Design', subject: 'Web Dev', dueDate: '2026-03-15', difficulty: 'Hard' },
    { id: 3, title: 'SQL Query Practice', subject: 'Databases', dueDate: '2026-03-18', difficulty: 'Easy' },
  ];

  const recentActivity = [
    { id: 1, type: 'completed', title: 'Completed "Arrays & Lists"', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-500' },
    { id: 2, type: 'streak', title: 'Maintained 7-day streak!', time: '1 day ago', icon: Flame, color: 'text-orange-500' },
    { id: 3, type: 'level', title: 'Reached Level 5', time: '2 days ago', icon: Trophy, color: 'text-yellow-500' },
    { id: 4, type: 'submission', title: 'Submitted "Sorting Algorithm"', time: '3 days ago', icon: Code, color: 'text-blue-500' },
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
              <span className="ml-2 text-xs text-[#636E72] hidden sm:inline">Student Dashboard</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.isPro && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-xs font-semibold shadow-md">
                <Crown className="w-3.5 h-3.5" />
                PRO
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 rounded-full">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-sm text-orange-700">{stats?.user?.streak || 0}</span>
            </div>
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
        {/* Welcome Section with Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1D2B]">
                Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
              </h1>
              <p className="text-[#636E72] mt-1 text-sm sm:text-base">
                Keep up your {stats?.user?.streak || 0}-day streak. You're doing amazing!
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                className="bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE] hover:shadow-lg transition-all"
                onClick={() => navigate('/ide')}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Coding
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/editor')}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Learn
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
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Level {user?.level || 1}</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{user?.xp || 0} XP</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-xl flex items-center justify-center shadow-md">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={xpProgress} className="h-2 bg-purple-100" />
                  <p className="text-xs text-[#636E72] mt-2">
                    {currentLevelXp} / {xpToNextLevel} XP to level {(user?.level || 1) + 1}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-orange-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Streak</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{stats?.user?.streak || 0} days</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-md">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-4">
                  🔥 Keep learning daily to maintain it!
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-yellow-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Concepts Mastered</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">
                      {stats?.stats?.masteredConcepts || 0} / {stats?.stats?.totalConcepts || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-md">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-4">
                  ⭐ {stats?.stats?.averageMastery || 0}% average mastery
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="hover:shadow-lg transition-all border-[#E8EAF6] bg-gradient-to-br from-white to-green-50">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-[#636E72] font-medium">Total Attempts</p>
                    <p className="text-xl sm:text-2xl font-bold text-[#1A1D2B] mt-1">{stats?.stats?.totalAttempts || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-xs text-[#636E72] mt-4">
                  💪 Practice makes perfect!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Learning Paths & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learning Paths */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg sm:text-xl">Your Learning Paths</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/editor')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {learningPaths.map((path) => (
                    <div
                      key={path.id}
                      className="p-4 rounded-xl border border-[#E8EAF6] hover:border-[#6C5CE7] hover:shadow-md transition-all cursor-pointer bg-white"
                      onClick={() => navigate('/editor')}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${path.color}15` }}
                          >
                            <BookOpen className="w-5 h-5" style={{ color: path.color }} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1A1D2B]">{path.title}</h4>
                            <p className="text-xs text-[#636E72]">
                              {path.completed} / {path.lessons} lessons completed
                            </p>
                          </div>
                        </div>
                        <span className="text-sm font-bold" style={{ color: path.color }}>
                          {path.progress}%
                        </span>
                      </div>
                      <Progress value={path.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Concept Progress */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Concept Mastery</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats?.progress && stats.progress.length > 0 ? (
                    stats.progress.map((item) => (
                      <div key={item.concept} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#1A1D2B] text-sm">{item.concept}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-[#636E72]">{item.attempts} attempts</span>
                            <Badge 
                              variant={item.masteryLevel >= 80 ? "default" : "secondary"}
                              className={item.masteryLevel >= 80 ? "bg-green-500" : ""}
                            >
                              {item.masteryLevel}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={item.masteryLevel} className="h-2" />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#636E72]">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">Start learning to track your progress!</p>
                      <Button 
                        className="mt-4 bg-gradient-to-r from-[#6C5CE7] to-[#A29BFE]"
                        onClick={() => navigate('/editor')}
                      >
                        Start Learning
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                    stats.recentSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-xl hover:bg-[#F0F4FA] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Code className="w-5 h-5 text-[#6C5CE7]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#1A1D2B] text-sm">{sub.assignment.title}</p>
                            <p className="text-xs text-[#636E72]">{sub.assignment.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            sub.status === 'PASSED' ? 'bg-green-500' :
                            sub.status === 'FAILED' ? 'bg-red-500' :
                            sub.status === 'REVIEWED' ? 'bg-blue-500' :
                            'bg-yellow-500'
                          }>
                            {sub.status}
                          </Badge>
                          {sub.score !== undefined && (
                            <p className="text-xs text-[#636E72] mt-1">{sub.score}/100</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#636E72]">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-sm">No submissions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Upcoming & Activity */}
          <div className="space-y-6">
            {/* Upcoming Assignments */}
            <Card className="border-[#E8EAF6]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#6C5CE7]" />
                  Upcoming
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="p-3 rounded-lg border border-[#E8EAF6] hover:border-[#6C5CE7] hover:shadow-sm transition-all cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm text-[#1A1D2B] leading-tight">
                          {assignment.title}
                        </h4>
                        <Badge 
                          variant="outline"
                          className={`text-xs ${
                            assignment.difficulty === 'Easy' ? 'border-green-500 text-green-700' :
                            assignment.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-700' :
                            'border-red-500 text-red-700'
                          }`}
                        >
                          {assignment.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#636E72] mb-2">{assignment.subject}</p>
                      <div className="flex items-center gap-1 text-xs text-orange-600">
                        <Clock className="w-3 h-3" />
                        Due {assignment.dueDate}
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
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full bg-${activity.color.split('-')[1]}-50 flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#1A1D2B] font-medium leading-tight">
                          {activity.title}
                        </p>
                        <p className="text-xs text-[#636E72] mt-0.5">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements Preview */}
            <Card className="border-[#E8EAF6] bg-gradient-to-br from-white to-purple-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#6C5CE7]" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: '🎯', unlocked: (stats?.stats?.totalAttempts || 0) > 0 },
                    { icon: '🔥', unlocked: (stats?.user?.streak || 0) >= 3 },
                    { icon: '⚡', unlocked: (stats?.user?.streak || 0) >= 7 },
                    { icon: '🧠', unlocked: (stats?.stats?.masteredConcepts || 0) >= 5 },
                    { icon: '💎', unlocked: (user?.xp || 0) >= 500 },
                    { icon: '🚀', unlocked: (user?.level || 0) >= 5 },
                  ].map((achievement, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl transition-all ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] shadow-md'
                          : 'bg-gray-100 opacity-40 grayscale'
                      }`}
                    >
                      {achievement.icon}
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {/* Navigate to achievements */}}
                >
                  View All Achievements
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
