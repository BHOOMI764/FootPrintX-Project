'use client';

import { useEffect, useMemo, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import apiClient from '@/lib/apiClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingDown, Star, RefreshCcw, Calendar, Plus, Target, Zap, Globe, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, BarChart, Bar } from 'recharts';
import { io } from 'socket.io-client';

interface Calculation {
  id: number;
  result: number;
  score: number;
  createdAt: string;
}

interface RealTimeData {
  carbonPrice: {
    price: number;
    trend: string;
    lastUpdated: string;
  };
  weather: {
    temperature: number;
    carbonIntensity: number;
    renewablePercentage: number;
  };
  electricityIntensity: {
    carbonIntensity: number;
    renewablePercentage: number;
  };
}

function RealTimeDashboardContent() {
  const [data, setData] = useState<Calculation[]>([]);
  const [summary, setSummary] = useState<{ count: number; totalScore: number; averageScore: number; lastUpdated: string | null } | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);

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

  const fetchRealTimeData = async () => {
    try {
      const [carbonPrice, weather, electricity] = await Promise.all([
        apiClient.get('/api/realtime/carbon-price'),
        apiClient.get('/api/realtime/weather/global'),
        apiClient.get('/api/realtime/electricity-intensity')
      ]);

      setRealTimeData({
        carbonPrice: carbonPrice.data,
        weather: weather.data,
        electricityIntensity: electricity.data
      });
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchRealTimeData();

    // Initialize WebSocket connection
    const newSocket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to real-time server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from real-time server');
    });

    newSocket.on('leaderboard-update', (data) => {
      console.log('Leaderboard updated:', data);
      // Refresh data when leaderboard updates
      fetchData();
    });

    newSocket.on('carbon-price-update', (data) => {
      setRealTimeData(prev => prev ? { ...prev, carbonPrice: data } : null);
    });

    newSocket.on('weather-update', (data) => {
      setRealTimeData(prev => prev ? { ...prev, weather: data } : null);
    });

    // Subscribe to real-time updates
    newSocket.emit('subscribe-carbon-prices');
    newSocket.emit('subscribe-weather', 'global');

    return () => {
      newSocket.close();
    };
  }, []);

  // Update real-time data every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const chartData = useMemo(() => {
    return (data || [])
      .slice()
      .reverse()
      .map((d) => ({
        date: new Date(d.createdAt).toLocaleDateString(),
        score: d.score,
        emissions: d.result
      }));
  }, [data]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

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
      {/* Real-time Status */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Live Carbon Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Live Updates Active' : 'Offline Mode'}
          </span>
        </div>
      </div>

      {/* Real-time Data Cards */}
      {realTimeData && (
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                Carbon Price
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${realTimeData.carbonPrice.price}</div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                {getTrendIcon(realTimeData.carbonPrice.trend)}
                <span>per ton CO₂</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-blue-500" />
                Grid Intensity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.electricityIntensity.carbonIntensity}</div>
              <div className="text-xs text-muted-foreground">gCO₂/kWh</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-green-500" />
                Renewable %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.electricityIntensity.renewablePercentage}%</div>
              <div className="text-xs text-muted-foreground">clean energy</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-500" />
                Weather Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{realTimeData.weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground">affects energy demand</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Personal Data Summary */}
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

      {/* Live Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Score Trend (Live)</CardTitle>
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

        <Card>
          <CardHeader>
            <CardTitle>Emissions vs Score</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            {chartData.length === 0 ? (
              <p className="text-muted-foreground">No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="emissions" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Real-time Suggestions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-green-600" />
              Live Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
              <li>Current carbon price is ${realTimeData?.carbonPrice.price || 'N/A'} - consider offsetting now.</li>
              <li>Grid intensity is {realTimeData?.electricityIntensity.carbonIntensity || 'N/A'} gCO₂/kWh - use energy efficiently.</li>
              <li>Renewable energy is at {realTimeData?.electricityIntensity.renewablePercentage || 'N/A'}% - great time for clean energy.</li>
              <li>Weather shows {realTimeData?.weather.temperature || 'N/A'}°C - adjust heating/cooling accordingly.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Live Achievements
            </CardTitle>
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
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time tracking</span>
                <Badge variant="secondary" className="text-xs">
                  {isConnected ? 'Active' : 'Offline'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={fetchData}>
          <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>
    </div>
  );
}

export default function RealTimeDashboardPage() {
  return (
    <AuthGuard>
      <RealTimeDashboardContent />
    </AuthGuard>
  );
}
