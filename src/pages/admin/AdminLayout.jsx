import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, LayoutDashboard, Users, Briefcase, MessageSquare, Tag, Settings, CalendarClock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const navItems = [
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'leads', label: 'Leads', icon: Users },
  { to: 'bookings', label: 'Bookings', icon: CalendarClock },
  { to: 'projects', label: 'Projects', icon: Briefcase },
  { to: 'reviews', label: 'Reviews', icon: MessageSquare },
  { to: 'coupons', label: 'Coupons', icon: Tag },
  { to: 'game-settings', label: 'Game Settings', icon: Settings },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const agencyLogoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/ba80c63a-8193-468a-aeee-9f39353b4e99/da4e84807be20560b6128922b55295de.png";


  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate('/admin/login');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        className: "bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none shadow-xl"
      });
    }
  };
  
  const isActive = (path) => location.pathname === `/admin/${path}` || (location.pathname === '/admin' && path === 'dashboard');

  const NavLink = ({ to, label, icon: Icon, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ease-in-out
                  ${isActive(to) ? 'bg-primary text-primary-foreground shadow-md button-hover-glow' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}`}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Link>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/30">
        <Link to="/admin/dashboard" className="flex items-center space-x-2 group">
          <img src={agencyLogoUrl} alt="Outwit Agency Logo" className="h-10 w-auto filter group-hover:brightness-110 transition-all duration-300" />
          <span className="text-xl font-bold text-gradient">Admin Panel</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} label={item.label} icon={item.icon} onClick={() => setIsSheetOpen(false)}/>
        ))}
      </nav>
      <div className="p-4 border-t border-border/30 mt-auto">
        <div className="mb-3 p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Logged in as:</p>
            <p className="text-sm font-medium text-foreground truncate" title={userEmail}>{userEmail || 'Loading...'}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="w-full button-hover-glow text-destructive border-destructive hover:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );


  return (
    <div className="flex h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 border-r border-border/30 bg-card shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Navigation */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between w-full px-4 py-3 border-b border-border/30 bg-card shadow-sm">
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
           <img src={agencyLogoUrl} alt="Outwit Agency Logo - Mobile" className="h-8 w-auto" />
        </Link>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card border-r border-border/30 shadow-xl">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </header>
      
      <main className="flex-1 flex flex-col overflow-y-auto">
         <div className="sticky top-0 md:top-auto z-30 md:static bg-card/80 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none p-4 border-b border-border/30 md:border-none">
           <h2 className="text-xl font-semibold text-gradient capitalize">
             {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}
           </h2>
         </div>
        <div className="p-4 md:p-6 flex-1">
          <Outlet />
        </div>
        <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border/30 bg-card">
          © {new Date().getFullYear()} Outwit Agency Admin Panel. All rights reserved.
        </footer>
      </main>
    </div>
  );
};

export default AdminLayout;