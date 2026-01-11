'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  TrendingDown, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Leaf,
  Car,
  Home,
  ShoppingBag,
  Plane,
  Trash2,
  Wifi,
  Monitor,
  Cloud
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';

interface Suggestion {
  id: string;
  category: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  co2Reduction: number; // kg CO2e per year
  icon: React.ComponentType<any>;
  completed?: boolean;
}

interface UserData {
  totalScore: number;
  averageScore: number;
  calculationCount: number;
  recentCalculations: any[];
}

function SuggestionsContent() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedSuggestions, setCompletedSuggestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await apiClient.get('/api/calculate/history?limit=10');
      const data = response.data;
      
      setUserData({
        totalScore: data.summary?.totalScore || 0,
        averageScore: data.summary?.averageScore || 0,
        calculationCount: data.summary?.count || 0,
        recentCalculations: data.calculations || []
      });

      generatePersonalizedSuggestions(data.summary, data.calculations);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedSuggestions = (summary: any, calculations: any[]) => {
    const baseSuggestions: Suggestion[] = [
      {
        id: 'reduce-driving',
        category: 'Transportation',
        title: 'Switch to Public Transport',
        description: 'Replace 50% of car trips with public transport or cycling',
        impact: 'high',
        difficulty: 'medium',
        co2Reduction: 1200,
        icon: Car
      },
      {
        id: 'energy-efficient-appliances',
        category: 'Energy',
        title: 'Upgrade to Energy Star Appliances',
        description: 'Replace old appliances with energy-efficient models',
        impact: 'high',
        difficulty: 'hard',
        co2Reduction: 800,
        icon: Home
      },
      {
        id: 'reduce-meat-consumption',
        category: 'Food',
        title: 'Meatless Mondays',
        description: 'Skip meat one day per week to reduce dietary emissions',
        impact: 'medium',
        difficulty: 'easy',
        co2Reduction: 400,
        icon: Leaf
      },
      {
        id: 'minimize-shopping',
        category: 'Shopping',
        title: 'Buy Less, Choose Well',
        description: 'Reduce new purchases by 25% and focus on quality items',
        impact: 'medium',
        difficulty: 'medium',
        co2Reduction: 600,
        icon: ShoppingBag
      },
      {
        id: 'avoid-short-flights',
        category: 'Travel',
        title: 'Choose Rail Over Short Flights',
        description: 'Replace flights under 3 hours with train travel',
        impact: 'high',
        difficulty: 'medium',
        co2Reduction: 1500,
        icon: Plane
      },
      {
        id: 'zero-waste-goals',
        category: 'Waste',
        title: 'Reduce Waste by 50%',
        description: 'Implement composting and reduce single-use items',
        impact: 'medium',
        difficulty: 'medium',
        co2Reduction: 300,
        icon: Trash2
      },
      {
        id: 'optimize-streaming',
        category: 'Digital',
        title: 'Optimize Streaming Quality',
        description: 'Use lower video quality and download content for offline viewing',
        impact: 'low',
        difficulty: 'easy',
        co2Reduction: 50,
        icon: Monitor
      },
      {
        id: 'cloud-cleanup',
        category: 'Digital',
        title: 'Clean Up Cloud Storage',
        description: 'Delete unused files and optimize cloud storage usage',
        impact: 'low',
        difficulty: 'easy',
        co2Reduction: 30,
        icon: Cloud
      }
    ];

    // Personalize suggestions based on user data
    let personalizedSuggestions = [...baseSuggestions];

    if (summary?.averageScore > 15000) {
      // High carbon footprint - prioritize high-impact suggestions
      personalizedSuggestions = personalizedSuggestions
        .sort((a, b) => {
          const impactOrder = { high: 3, medium: 2, low: 1 };
          return impactOrder[b.impact] - impactOrder[a.impact];
        });
    } else if (summary?.averageScore < 8000) {
      // Low carbon footprint - focus on optimization
      personalizedSuggestions = personalizedSuggestions
        .filter(s => s.difficulty === 'easy' || s.impact === 'medium')
        .sort((a, b) => {
          const difficultyOrder = { easy: 3, medium: 2, hard: 1 };
          return difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty];
        });
    }

    // Add completion status
    personalizedSuggestions = personalizedSuggestions.map(suggestion => ({
      ...suggestion,
      completed: completedSuggestions.has(suggestion.id)
    }));

    setSuggestions(personalizedSuggestions);
  };

  const toggleSuggestion = (suggestionId: string) => {
    const newCompleted = new Set(completedSuggestions);
    if (newCompleted.has(suggestionId)) {
      newCompleted.delete(suggestionId);
    } else {
      newCompleted.add(suggestionId);
    }
    setCompletedSuggestions(newCompleted);
    
    // Update suggestions with new completion status
    setSuggestions(prev => prev.map(s => ({
      ...s,
      completed: newCompleted.has(s.id)
    })));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalPotentialReduction = suggestions.reduce((sum, s) => sum + s.co2Reduction, 0);
  const completedReduction = suggestions
    .filter(s => s.completed)
    .reduce((sum, s) => sum + s.co2Reduction, 0);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Personalized Carbon Reduction Suggestions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your carbon footprint data, here are tailored recommendations to help you reduce your environmental impact.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Potential Reduction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalPotentialReduction.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">kg CO₂e/year possible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Completed Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedSuggestions.size}</div>
            <p className="text-sm text-muted-foreground">of {suggestions.length} suggestions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round((completedReduction / totalPotentialReduction) * 100)}%</div>
            <p className="text-sm text-muted-foreground">reduction achieved</p>
            <Progress 
              value={(completedReduction / totalPotentialReduction) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => {
          const IconComponent = suggestion.icon;
          return (
            <Card 
              key={suggestion.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                suggestion.completed ? 'bg-green-50 border-green-200' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      suggestion.completed ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        suggestion.completed ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{suggestion.category}</p>
                    </div>
                  </div>
                  {suggestion.completed && (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                
                <div className="flex gap-2">
                  <Badge variant="outline" className={getImpactColor(suggestion.impact)}>
                    {suggestion.impact} impact
                  </Badge>
                  <Badge variant="outline" className={getDifficultyColor(suggestion.difficulty)}>
                    {suggestion.difficulty}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Annual CO₂ Reduction:</span>
                  <span className="font-semibold text-green-600">{suggestion.co2Reduction} kg</span>
                </div>

                <Button
                  variant={suggestion.completed ? "outline" : "default"}
                  className="w-full"
                  onClick={() => toggleSuggestion(suggestion.id)}
                >
                  {suggestion.completed ? 'Mark as Incomplete' : 'Mark as Complete'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Carbon Offset Recommendations */}
      <Card className="p-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Carbon Offset Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Verified Offset Platforms</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Gold Standard:</strong> High-quality carbon credits</li>
                <li>• <strong>Verified Carbon Standard:</strong> Verified emission reductions</li>
                <li>• <strong>Climate Action Reserve:</strong> North American projects</li>
                <li>• <strong>American Carbon Registry:</strong> US-based projects</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Offset Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>Forestry:</strong> Tree planting and forest conservation</li>
                <li>• <strong>Renewable Energy:</strong> Wind and solar projects</li>
                <li>• <strong>Methane Capture:</strong> Landfill and agricultural projects</li>
                <li>• <strong>Energy Efficiency:</strong> Building and industrial improvements</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <AlertCircle className="h-4 w-4 inline mr-2" />
              <strong>Note:</strong> Carbon offsets should complement, not replace, direct emission reductions. 
              Focus on reducing your footprint first, then offset remaining emissions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuggestionsPage() {
  return (
    <AuthGuard>
      <SuggestionsContent />
    </AuthGuard>
  );
}
