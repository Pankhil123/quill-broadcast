import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogIn, LayoutDashboard, LogOut, Megaphone } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user, isReporter, signOut } = useAuth();

  return (
    <header className="border-b border-news-divider bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/lovable-uploads/32e4b16e-b4c5-4ee7-bc13-7ddb23bb5b88.png" alt="ToadToe Logo" className="h-10 w-10" />
            <h1 className="text-2xl font-bold text-news-heading">ToadToe</h1>
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button asChild variant="default" size="sm" className="bg-primary hover:bg-primary/90">
              <Link to="/advertise">
                <Megaphone className="h-4 w-4 mr-2" />
                Advertise With Us
              </Link>
            </Button>
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
