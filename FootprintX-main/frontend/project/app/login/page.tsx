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
    const { login } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        const result = await login(email, password);
        if (!result.success) {
            setError(result.message || 'Login failed');
        }
        // Redirect is handled within the login function on success
    };

    return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
            <Card className="w-full max-w-md p-6">
                <h2 className="mb-6 text-2xl font-bold">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
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
                            placeholder="Enter your password"
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-primary hover:underline">
                        Register here
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage; 