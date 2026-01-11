'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Wait until loading is finished
        if (!loading) {
            // If not logged in, redirect to login page
            if (!user) {
                router.push('/login');
            }
        }
    }, [user, loading, router]);

    // While loading, show nothing or a spinner
    if (loading) {
        return <div>Loading...</div>; // Or a proper loading spinner component
    }

    // If logged in, render the children components
    if (user) {
        return <>{children}</>;
    }

    // If not loading and not logged in, we've already initiated redirect,
    // return null or loading indicator to prevent rendering protected content briefly
    return <div>Loading...</div>; // Or null
};

export default AuthGuard; 