'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

const RegisterPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter email and password');
            return;
        }
        const result = await register(email, password);
        if (!result.success) {
            setError(result.message || 'Registration failed');
        }
    };

    return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
            <Card className="w-full max-w-md p-6">
                <h2 className="mb-6 text-2xl font-bold">Create your account</h2>
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
                            placeholder="you@example.com"
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
                            placeholder="Enter a strong password"
                        />
                    </div>
                    <Button type="submit" className="w-full">
                        Create account
                    </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage; 