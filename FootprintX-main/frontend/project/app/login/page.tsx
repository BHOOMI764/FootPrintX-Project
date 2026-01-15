'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, demoLogin } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (!email || !password) {
            setError('Please enter email and password');
            setLoading(false);
            return;
        }
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message || 'Login failed');
        }
        setLoading(false);
    };

    const handleDemoLogin = async () => {
        setError('');
        setLoading(true);
        const result = await demoLogin();
        if (!result.success) {
            setError(result.message || 'Demo login failed');
        }
        setLoading(false);
    };

    return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12 px-4">
            <div className="w-full max-w-md space-y-4">
                {/* DEMO BUTTON - PROMINENT */}
                <Card className="w-full p-8 border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50">
                    <div className="text-center space-y-4">
                        <div>
                            <p className="text-sm font-semibold text-green-700 mb-2">🚀 QUICK START</p>
                            <h3 className="text-xl font-bold text-green-900">Try Demo Now</h3>
                            <p className="text-sm text-green-700 mt-2">
                                Explore all features instantly. No login required!
                            </p>
                        </div>
                        <Button 
                            onClick={handleDemoLogin} 
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
                            disabled={loading}
                        >
                            {loading ? '🔄 Loading...' : '✨ Try Demo Account'}
                        </Button>
                        <p className="text-xs text-green-600">
                            Instant access • Full features • No signup required
                        </p>
                    </div>
                </Card>

                {/* LOGIN FORM */}
                <Card className="w-full p-6">
                    <h2 className="mb-6 text-2xl font-bold text-center">Login</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && <p className="text-sm text-red-500 text-center font-semibold">{error}</p>}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="your@email.com"
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    
                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <Link href="/register" className="text-primary hover:underline font-semibold">
                            Register here
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage; 