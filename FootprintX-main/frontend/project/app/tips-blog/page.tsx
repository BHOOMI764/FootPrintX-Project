'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  BookOpen, 
  Lightbulb, 
  TrendingUp, 
  Calendar,
  Tag,
  ArrowRight,
  Filter
} from 'lucide-react';
import AuthGuard from '@/components/AuthGuard';

interface Tip {
  id: string;
  title: string;
  content: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  impact: 'low' | 'medium' | 'high';
  tags: string[];
  date: string;
  readTime: number;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readTime: number;
  tags: string[];
  featured: boolean;
}

function TipsBlogContent() {
  const [activeTab, setActiveTab] = useState<'tips' | 'blog'>('tips');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tips, setTips] = useState<Tip[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    // Initialize with sample data
    initializeData();
  }, []);

  const initializeData = () => {
    const sampleTips: Tip[] = [
      {
        id: '1',
        title: 'Switch to LED Light Bulbs',
        content: 'LED bulbs use 75% less energy than traditional incandescent bulbs and last 25 times longer. This simple switch can reduce your home energy consumption significantly.',
        category: 'Energy',
        difficulty: 'easy',
        impact: 'medium',
        tags: ['energy', 'home', 'lighting'],
        date: '2024-01-15',
        readTime: 2
      },
      {
        id: '2',
        title: 'Implement Meatless Mondays',
        content: 'Reducing meat consumption by just one day per week can cut your dietary carbon footprint by 15%. Start with Meatless Mondays and gradually increase plant-based meals.',
        category: 'Food',
        difficulty: 'easy',
        impact: 'high',
        tags: ['food', 'diet', 'vegetarian'],
        date: '2024-01-14',
        readTime: 3
      },
      {
        id: '3',
        title: 'Optimize Your Home Heating',
        content: 'Lower your thermostat by 2-3 degrees in winter and use programmable thermostats. This can reduce heating costs by 10% and significantly lower emissions.',
        category: 'Energy',
        difficulty: 'medium',
        impact: 'high',
        tags: ['energy', 'heating', 'home'],
        date: '2024-01-13',
        readTime: 4
      },
      {
        id: '4',
        title: 'Use Public Transportation',
        content: 'Replace car trips with public transport, cycling, or walking. A single bus ride can carry 40+ people, dramatically reducing per-person emissions.',
        category: 'Transportation',
        difficulty: 'medium',
        impact: 'high',
        tags: ['transport', 'public-transit', 'commuting'],
        date: '2024-01-12',
        readTime: 3
      },
      {
        id: '5',
        title: 'Reduce Digital Carbon Footprint',
        content: 'Clean up your cloud storage, use lower video quality for streaming, and close unused browser tabs. Digital activities account for 3.7% of global emissions.',
        category: 'Digital',
        difficulty: 'easy',
        impact: 'low',
        tags: ['digital', 'streaming', 'cloud'],
        date: '2024-01-11',
        readTime: 2
      },
      {
        id: '6',
        title: 'Start Composting',
        content: 'Composting food scraps reduces methane emissions from landfills and creates nutrient-rich soil for your garden. Start with a small bin and gradually expand.',
        category: 'Waste',
        difficulty: 'medium',
        impact: 'medium',
        tags: ['waste', 'composting', 'garden'],
        date: '2024-01-10',
        readTime: 5
      }
    ];

    const sampleBlogPosts: BlogPost[] = [
      {
        id: '1',
        title: 'The Hidden Carbon Cost of Your Digital Life',
        excerpt: 'While we often focus on physical carbon footprints, our digital activities contribute significantly to global emissions. Learn how to reduce your digital carbon footprint.',
        content: 'Our digital lives have a surprising environmental impact. From streaming videos to cloud storage, every digital action consumes energy...',
        author: 'Sarah Chen',
        date: '2024-01-15',
        readTime: 8,
        tags: ['digital', 'carbon-footprint', 'technology'],
        featured: true
      },
      {
        id: '2',
        title: 'Sustainable Transportation: Beyond Electric Cars',
        excerpt: 'Electric vehicles are great, but there are many other sustainable transportation options that can reduce your carbon footprint even more effectively.',
        content: 'While electric vehicles represent a significant step forward in sustainable transportation, they\'re not the only solution...',
        author: 'Mike Rodriguez',
        date: '2024-01-12',
        readTime: 6,
        tags: ['transportation', 'sustainability', 'electric-vehicles'],
        featured: false
      },
      {
        id: '3',
        title: 'The Psychology of Climate Action',
        excerpt: 'Understanding the psychological barriers to climate action can help us make more effective changes in our daily lives.',
        content: 'Why do we know climate change is important but struggle to take action? The psychology behind climate behavior reveals fascinating insights...',
        author: 'Dr. Emily Watson',
        date: '2024-01-10',
        readTime: 10,
        tags: ['psychology', 'climate-action', 'behavior'],
        featured: false
      }
    ];

    setTips(sampleTips);
    setBlogPosts(sampleBlogPosts);
  };

  const categories = ['all', 'Energy', 'Food', 'Transportation', 'Digital', 'Waste', 'Shopping'];

  const filteredTips = tips.filter(tip => {
    const matchesSearch = tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tip.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || tip.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Eco Tips & Insights</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover practical tips and in-depth articles to help you reduce your carbon footprint and live more sustainably.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={activeTab === 'tips' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('tips')}
            className="px-6"
          >
            <Lightbulb className="h-4 w-4 mr-2" />
            Tips
          </Button>
          <Button
            variant={activeTab === 'blog' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('blog')}
            className="px-6"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Blog
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab === 'tips' ? 'tips' : 'articles'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {activeTab === 'tips' && (
          <div className="flex gap-2">
            <Filter className="h-4 w-4 mt-3 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tips Section */}
      {activeTab === 'tips' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTips.map((tip) => (
            <Card key={tip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{tip.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {tip.category}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className={getDifficultyColor(tip.difficulty)}>
                    {tip.difficulty}
                  </Badge>
                  <Badge variant="outline" className={getImpactColor(tip.impact)}>
                    {tip.impact} impact
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{tip.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {tip.readTime} min read
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {tip.tags.slice(0, 2).map(tag => (
                      <Tag key={tag} className="h-3 w-3" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Blog Section */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <Card key={post.id} className={`hover:shadow-lg transition-shadow ${post.featured ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  </div>
                  {post.featured && (
                    <Badge className="bg-primary text-primary-foreground">Featured</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>By {post.author}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span>{post.readTime} min read</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    Read More <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
                <div className="flex gap-2 mt-2">
                  {post.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Newsletter Signup */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className="text-center">
          <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
          <p className="text-muted-foreground mb-4">
            Get the latest sustainability tips and climate news delivered to your inbox.
          </p>
          <div className="flex gap-2 max-w-md mx-auto">
            <Input placeholder="Enter your email" className="flex-1" />
            <Button>Subscribe</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TipsBlogPage() {
  return (
    <AuthGuard>
      <TipsBlogContent />
    </AuthGuard>
  );
}
