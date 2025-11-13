import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Newspaper, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, isReporter, signOut } = useAuth();

  return (
    <header className="border-b border-news-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Newspaper className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-news-heading">NewsHub</h1>
          </Link>
          
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-news-meta">
                  {user.email}
                </span>
                {isReporter && (
                  <Button asChild variant="ghost">
                    <Link to="/admin">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
