'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2, TrendingDown, Star, RefreshCcw, Calendar, Plus, Target } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface Calculation {
  id: number;
  result: number;
  score: number;
  createdAt: string;
}

function DashboardContent() {
  const [data, setData] = useState<Calculation[]>([]);
  const [summary, setSummary] = useState<{ count: number; totalScore: number; averageScore: number; lastUpdated: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiClient.get('/api/calculate/history?limit=30');
      setData(resp.data.calculations || []);
      setSummary(resp.data.summary || null);
    } catch (e: any) {
      setError(e.response?.data?.msg || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return (data || [])
      .slice()
      .reverse()
      .map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString(),
        score: d.score,
      }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalScore ?? 0}</div>
            <p className="text-sm text-muted-foreground">Sum of your saved calculations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.averageScore ?? 0}</div>
            <p className="text-sm text-muted-foreground">Across {summary?.count ?? 0} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.lastUpdated ? new Date(summary.lastUpdated).toLocaleDateString() : '—'}</div>
            <p className="text-sm text-muted-foreground">Most recent calculation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Score Trend</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 300 }}>
          {chartData.length === 0 ? (
            <p className="text-muted-foreground">No data yet. Save a calculation to see your trend.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#16a34a" fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingDown className="h-5 w-5 text-green-600" /> Quick wins to cut emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Reduce weekly waste by 1 kg to lower your annual footprint noticeably.</li>
              <li>Swap one short flight with rail for immediate score gains.</li>
              <li>Drop home energy usage by 10% this month; aim for efficient appliances.</li>
              <li>Use lower video quality for streaming to reduce digital emissions.</li>
              <li>Clean up cloud storage and delete unused files regularly.</li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">First calculation saved</span>
                <Progress value={summary && summary.count > 0 ? 100 : 0} className="w-40" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">5 calculations</span>
                <Progress value={Math.min(((summary?.count ?? 0) / 5) * 100, 100)} className="w-40" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Score 1000+</span>
                <Progress value={Math.min(((summary?.totalScore ?? 0) / 1000) * 100, 100)} className="w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchData}><RefreshCcw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      {/* Daily Tracking Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Daily Carbon Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Today</div>
              <div className="text-sm text-muted-foreground">Track your daily activities</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">This Week</div>
              <div className="text-sm text-muted-foreground">Weekly progress overview</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">This Month</div>
              <div className="text-sm text-muted-foreground">Monthly carbon summary</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">Goals</div>
              <div className="text-sm text-muted-foreground">Set and track targets</div>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Daily Entry
            </Button>
            <Button variant="outline" size="sm">
              <Target className="h-4 w-4 mr-2" />
              Set Goals
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
} 