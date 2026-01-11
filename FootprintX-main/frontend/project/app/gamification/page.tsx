'use client';

import { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star, 
  Crown, 
  Zap, 
  Leaf, 
  Target, 
  TrendingUp,
  Calendar,
  CheckCircle,
  Lock,
  Gift,
  Flame,
  Droplets,
  Wind,
  Sun,
  Moon,
  Activity,
  BarChart3,
  Users,
  Share2,
  Heart,
  MessageCircle,
  ThumbsUp,
  Loader2
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'tracking' | 'reduction' | 'social' | 'milestone' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: Date;
  points: number;
  requirements: string[];
}

interface UserStats {
  totalPoints: number;
  level: number;
  experience: number;
  nextLevelExp: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  streak: number;
  longestStreak: number;
  carbonSaved: number;
  socialShares: number;
  communityRank: number;
}

function GamificationContent() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    setLoading(true);
    try {
      // Fetch user's calculation data
      const response = await apiClient.get('/api/calculate/history?limit=100');
      const calculations = response.data.calculations || [];
      const summary = response.data.summary || { count: 0, totalScore: 0, averageScore: 0 };

      // Generate achievements based on user data
      let generatedAchievements = generateAchievements(calculations, summary);

      // If local flag is set to unlock all achievements, force-unlock them
      try {
        if (typeof window !== 'undefined' && localStorage.getItem('unlockAllAchievements') === 'true') {
          generatedAchievements = generatedAchievements.map(a => ({
            ...a,
            unlocked: true,
            progress: a.maxProgress,
            unlockedAt: a.unlockedAt || new Date()
          }));
        }
      } catch (e) {
        // ignore localStorage errors
      }

      setAchievements(generatedAchievements);

      // Calculate user stats
      const stats = calculateUserStats(calculations, summary, generatedAchievements);
      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockAllAchievements = () => {
    try {
      localStorage.setItem('unlockAllAchievements', 'true');
    } catch (e) {}
    const forced = achievements.map(a => ({ ...a, unlocked: true, progress: a.maxProgress, unlockedAt: a.unlockedAt || new Date() }));
    setAchievements(forced);
    setUserStats(prev => prev ? { ...prev, achievementsUnlocked: forced.length, totalPoints: forced.reduce((s, x) => s + x.points, 0) } : prev);
  };

  const resetAchievements = () => {
    try { localStorage.removeItem('unlockAllAchievements'); } catch (e) {}
    // regenerate from source data
    fetchGamificationData();
  };

  const generateAchievements = (calculations: any[], summary: any): Achievement[] => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-steps',
        name: 'First Steps',
        description: 'Complete your first carbon footprint calculation',
        icon: Star,
        category: 'tracking',
        rarity: 'common',
        unlocked: calculations.length > 0,
        progress: Math.min(calculations.length, 1),
        maxProgress: 1,
        unlockedAt: calculations.length > 0 ? new Date(calculations[0].createdAt) : undefined,
        points: 10,
        requirements: ['Complete 1 calculation']
      },
      {
        id: 'consistent-tracker',
        name: 'Consistent Tracker',
        description: 'Track your carbon footprint for 7 consecutive days',
        icon: Calendar,
        category: 'tracking',
        rarity: 'rare',
        unlocked: calculations.length >= 7,
        progress: Math.min(calculations.length, 7),
        maxProgress: 7,
        unlockedAt: calculations.length >= 7 ? new Date() : undefined,
        points: 25,
        requirements: ['Complete 7 calculations']
      },
      {
        id: 'carbon-warrior',
        name: 'Carbon Warrior',
        description: 'Complete 30 carbon footprint calculations',
        icon: Trophy,
        category: 'tracking',
        rarity: 'epic',
        unlocked: calculations.length >= 30,
        progress: Math.min(calculations.length, 30),
        maxProgress: 30,
        unlockedAt: calculations.length >= 30 ? new Date() : undefined,
        points: 50,
        requirements: ['Complete 30 calculations']
      },
      {
        id: 'eco-champion',
        name: 'Eco Champion',
        description: 'Achieve a total score of 1000+ points',
        icon: Crown,
        category: 'milestone',
        rarity: 'legendary',
        unlocked: summary.totalScore >= 1000,
        progress: Math.min(summary.totalScore, 1000),
        maxProgress: 1000,
        unlockedAt: summary.totalScore >= 1000 ? new Date() : undefined,
        points: 100,
        requirements: ['Achieve 1000+ total score']
      },
      {
        id: 'digital-optimizer',
        name: 'Digital Optimizer',
        description: 'Calculate your digital carbon footprint',
        icon: Activity,
        category: 'tracking',
        rarity: 'rare',
        unlocked: calculations.some(c => c.inputData.type === 'digital'),
        progress: calculations.filter(c => c.inputData.type === 'digital').length,
        maxProgress: 1,
        unlockedAt: calculations.some(c => c.inputData.type === 'digital') ? new Date() : undefined,
        points: 20,
        requirements: ['Calculate digital footprint']
      },
      {
        id: 'carbon-saver',
        name: 'Carbon Saver',
        description: 'Reduce your average carbon footprint by 20%',
        icon: Leaf,
        category: 'reduction',
        rarity: 'epic',
        unlocked: false, // This would need historical data to calculate
        progress: 0,
        maxProgress: 20,
        points: 75,
        requirements: ['Reduce footprint by 20%']
      },
      {
        id: 'social-advocate',
        name: 'Social Advocate',
        description: 'Share your carbon footprint on social media',
        icon: Share2,
        category: 'social',
        rarity: 'common',
        unlocked: false, // This would need social sharing tracking
        progress: 0,
        maxProgress: 1,
        points: 15,
        requirements: ['Share on social media']
      },
      {
        id: 'community-leader',
        name: 'Community Leader',
        description: 'Help 5 other users with sustainability tips',
        icon: Users,
        category: 'social',
        rarity: 'rare',
        unlocked: false, // This would need community features
        progress: 0,
        maxProgress: 5,
        points: 40,
        requirements: ['Help 5 community members']
      },
      {
        id: 'streak-master',
        name: 'Streak Master',
        description: 'Maintain a 30-day calculation streak',
        icon: Flame,
        category: 'tracking',
        rarity: 'legendary',
        unlocked: false, // This would need streak calculation
        progress: 0,
        maxProgress: 30,
        points: 150,
        requirements: ['30-day streak']
      },
      {
        id: 'carbon-neutral',
        name: 'Carbon Neutral',
        description: 'Achieve carbon neutrality through offsets',
        icon: Sun,
        category: 'special',
        rarity: 'legendary',
        unlocked: false, // This would need offset tracking
        progress: 0,
        maxProgress: 1,
        points: 200,
        requirements: ['Purchase carbon offsets']
      }
    ];

    return baseAchievements;
  };

  const calculateUserStats = (calculations: any[], summary: any, achievements: Achievement[]): UserStats => {
    const unlockedAchievements = achievements.filter(a => a.unlocked);
    const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
    const level = Math.floor(totalPoints / 100) + 1;
    const experience = totalPoints % 100;
    const nextLevelExp = 100 - experience;

    return {
      totalPoints,
      level,
      experience,
      nextLevelExp,
      achievementsUnlocked: unlockedAchievements.length,
      totalAchievements: achievements.length,
      streak: 0, // Would need streak calculation
      longestStreak: 0,
      carbonSaved: 0, // Would need historical comparison
      socialShares: 0,
      communityRank: 1
    };
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100';
      case 'rare': return 'text-blue-600 bg-blue-100';
      case 'epic': return 'text-purple-600 bg-purple-100';
      case 'legendary': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'tracking': return <BarChart3 className="h-4 w-4" />;
      case 'reduction': return <TrendingUp className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'special': return <Gift className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            🏆 Gamification Center
          </h1>
          <p className="text-xl text-muted-foreground">
            Level up your sustainability journey with achievements and rewards
          </p>
        </div>

        {/* User Stats Overview */}
        {userStats && (
          <div className="grid gap-6 md:grid-cols-4">
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Level</p>
                    <p className="text-3xl font-bold">{userStats.level}</p>
                    <p className="text-purple-100 text-xs">Carbon Warrior</p>
                  </div>
                  <Crown className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Points</p>
                    <p className="text-3xl font-bold">{userStats.totalPoints}</p>
                    <p className="text-blue-100 text-xs">XP earned</p>
                  </div>
                  <Star className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Achievements</p>
                    <p className="text-3xl font-bold">{userStats.achievementsUnlocked}</p>
                    <p className="text-green-100 text-xs">of {userStats.totalAchievements}</p>
                  </div>
                  <Trophy className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Next Level</p>
                    <p className="text-3xl font-bold">{userStats.nextLevelExp}</p>
                    <p className="text-orange-100 text-xs">XP needed</p>
                  </div>
                  <Target className="h-12 w-12 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Level Progress */}
        {userStats && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-yellow-600" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Level {userStats.level}</span>
                  <span>{userStats.experience}/100 XP</span>
                </div>
                <Progress value={userStats.experience} className="h-3" />
                <div className="text-center text-sm text-muted-foreground">
                  {userStats.nextLevelExp} XP until Level {userStats.level + 1}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex justify-center gap-2">
          {['all', 'tracking', 'reduction', 'social', 'milestone', 'special'].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full capitalize"
            >
              {getCategoryIcon(category)}
              <span className="ml-2">{category}</span>
            </Button>
          ))}
        </div>

        {/* Achievements Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAchievements.map((achievement) => {
            const IconComponent = achievement.icon;
            return (
              <Card 
                key={achievement.id}
                className={`border-0 shadow-xl transition-all duration-300 hover:shadow-2xl ${
                  achievement.unlocked 
                    ? 'bg-white/90 backdrop-blur-sm' 
                    : 'bg-gray-100/50 backdrop-blur-sm'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      achievement.unlocked 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' 
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {achievement.unlocked ? (
                        <IconComponent className="h-6 w-6" />
                      ) : (
                        <Lock className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {achievement.name}
                        </h3>
                        <Badge className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                          {achievement.rarity}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        achievement.unlocked ? 'text-gray-700' : 'text-gray-500'
                      }`}>
                        {achievement.description}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{achievement.points} XP</span>
                          {achievement.unlocked && achievement.unlockedAt && (
                            <span className="text-green-600">
                              Unlocked {achievement.unlockedAt.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Leaderboard Preview */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Community Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Join the Community!</h3>
              <p className="text-muted-foreground mb-4">
                Compete with other users and climb the sustainability leaderboard
              </p>
              <Button className="rounded-full">
                <Share2 className="h-4 w-4 mr-2" />
                Share Your Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function GamificationPage() {
  return (
    <AuthGuard>
      <GamificationContent />
    </AuthGuard>
  );
}
