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
  TrendingUp,
  Award,
  Settings,
  LogOut,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
        const data = await api.request('/user/dashboard');
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#6C5CE7] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user || !stats) return null;

  const xpToNextLevel = user.level * 100;
  const currentLevelXp = user.xp % 100;
  const xpProgress = (currentLevelXp / 100) * 100;

  return (
    <div className="min-h-screen bg-[#F6F7FB]">
      {/* Header */}
      <header className="bg-white border-b border-[#DFE6E9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6C5CE7] to-[#A29BFE] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">CS</span>
            </div>
            <span className="font-bold text-xl text-[#2D3436]">CodeSahayak</span>
          </div>

          <div className="flex items-center gap-4">
            {user.isPro && (
              <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full text-white text-sm font-medium">
                <Crown className="w-4 h-4" />
                PRO
              </div>
            )}
            <div className="flex items-center gap-2 text-[#636E72]">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-medium">{stats.user.streak}</span>
            </div>
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
            Welcome back, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-[#636E72] mt-1">
            Keep up your {stats.user.streak}-day streak. You're doing great!
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
                    <p className="text-sm text-[#636E72]">Level {user.level}</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{user.xp} XP</p>
                  </div>
                  <Trophy className="w-8 h-8 text-[#6C5CE7]" />
                </div>
                <div className="mt-4">
                  <Progress value={xpProgress} className="h-2" />
                  <p className="text-xs text-[#636E72] mt-1">
                    {currentLevelXp} / {xpToNextLevel} XP to next level
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#636E72]">Streak</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{stats.user.streak} days</p>
                  </div>
                  <Flame className="w-8 h-8 text-orange-500" />
                </div>
                <p className="text-sm text-[#636E72] mt-4">
                  Keep learning daily to maintain it!
                </p>
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
                    <p className="text-sm text-[#636E72]">Concepts Mastered</p>
                    <p className="text-2xl font-bold text-[#2D3436]">
                      {stats.stats.masteredConcepts} / {stats.stats.totalConcepts}
                    </p>
                  </div>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <p className="text-sm text-[#636E72] mt-4">
                  {stats.stats.averageMastery}% average mastery
                </p>
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
                    <p className="text-sm text-[#636E72]">Total Attempts</p>
                    <p className="text-2xl font-bold text-[#2D3436]">{stats.stats.totalAttempts}</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <p className="text-sm text-[#636E72] mt-4">
                  Practice makes perfect!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList className="bg-white border border-[#DFE6E9]">
            <TabsTrigger value="progress" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="achievements" className="gap-2">
              <Award className="w-4 h-4" />
              Achievements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <Card>
              <CardHeader>
                <CardTitle>Concept Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.progress.length > 0 ? (
                    stats.progress.map((item) => (
                      <div key={item.concept} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-[#2D3436]">{item.concept}</span>
                          <span className="text-sm text-[#636E72]">{item.masteryLevel}%</span>
                        </div>
                        <Progress value={item.masteryLevel} className="h-2" />
                        <p className="text-xs text-[#636E72]">
                          {item.attempts} attempts
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#636E72]">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Start learning to track your progress!</p>
                      <Button 
                        className="mt-4 bg-[#6C5CE7]"
                        onClick={() => navigate('/editor')}
                      >
                        Start Learning
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentSubmissions.length > 0 ? (
                    stats.recentSubmissions.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-4 bg-[#F6F7FB] rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-[#2D3436]">{sub.assignment.title}</p>
                          <p className="text-sm text-[#636E72]">{sub.assignment.subject}</p>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            sub.status === 'PASSED' ? 'bg-green-100 text-green-700' :
                            sub.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                            sub.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {sub.status}
                          </span>
                          {sub.score !== undefined && (
                            <p className="text-sm text-[#636E72] mt-1">{sub.score}/100</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[#636E72]">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No submissions yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'First Steps', desc: 'Complete your first lesson', icon: 'target', unlocked: stats.stats.totalAttempts > 0 },
                    { name: 'Streak Starter', desc: '3-day learning streak', icon: 'flame', unlocked: stats.user.streak >= 3 },
                    { name: 'Streak Master', desc: '7-day learning streak', icon: 'zap', unlocked: stats.user.streak >= 7 },
                    { name: 'Concept Master', desc: 'Master 5 concepts', icon: 'brain', unlocked: stats.stats.masteredConcepts >= 5 },
                    { name: 'XP Hunter', desc: 'Earn 500 XP', icon: 'gem', unlocked: user.xp >= 500 },
                    { name: 'Level Up', desc: 'Reach level 5', icon: 'rocket', unlocked: user.level >= 5 },
                    { name: 'Pro Member', desc: 'Upgrade to Pro', icon: 'crown', unlocked: user.isPro },
                    { name: 'Helper', desc: 'Help a peer', icon: 'handshake', unlocked: false },
                  ].map((achievement) => (
                    <div
                      key={achievement.name}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        achievement.unlocked
                          ? 'border-[#6C5CE7] bg-[#6C5CE7]/5'
                          : 'border-[#DFE6E9] opacity-50'
                      }`}
                    >
                      <span className="text-3xl block mb-2">{achievement.icon}</span>
                      <p className="font-medium text-sm text-[#2D3436]">{achievement.name}</p>
                      <p className="text-xs text-[#636E72]">{achievement.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
