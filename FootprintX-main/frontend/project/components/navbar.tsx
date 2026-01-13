'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut, Moon, Sun, User, LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { setTheme, theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
      logout();
      toast.success('Logged out successfully');
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8 flex">
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-6 w-6 text-green-600" />
            <span className="font-bold">FootprintX</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <nav className="flex items-center space-x-6">
              {user && <Link href="/dashboard" className="text-sm hover:text-foreground/80">Dashboard</Link>}
              {user && <Link href="/live-dashboard" className="text-sm hover:text-foreground/80">Live Dashboard</Link>}
              {user && <Link href="/gamification" className="text-sm hover:text-foreground/80">Gamification</Link>}
              {user && <Link href="/calculate" className="text-sm hover:text-foreground/80">Calculate</Link>}
              {user && <Link href="/digital-carbon" className="text-sm hover:text-foreground/80">Digital Carbon</Link>}
              {user && <Link href="/suggestions" className="text-sm hover:text-foreground/80">Suggestions</Link>}
              {user && <Link href="/tips-blog" className="text-sm hover:text-foreground/80">Tips & Blog</Link>}
              {user && <Link href="/chatbot" className="text-sm hover:text-foreground/80">AI Assistant</Link>}
              {user && <Link href="/complaints" className="text-sm hover:text-foreground/80">Complaints</Link>}
              {user && <Link href="/export" className="text-sm hover:text-foreground/80">Export</Link>}
            </nav>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            {user ? (
                <Button variant="outline" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    <span className="sr-only">Logout</span>
                </Button>
            ) : (
                <>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" /> Login
                        </Link>
                    </Button>
                     <Button variant="default" size="sm" asChild>
                         <Link href="/register">Register</Link>
                    </Button>
                </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}