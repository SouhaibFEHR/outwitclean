import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Briefcase, MessageSquare as MessageSquareText, Tag, Settings, Loader2, Bell, Mail, BarChart3, FileDown, CalendarClock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    leads: 0,
    projects: 0,
    reviews: 0,
    coupons: 0,
    gameSettings: 0,
    bookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New lead 'John Doe' received.", time: "10m ago", read: false, type: "lead" },
    { id: 2, message: "Project 'Alpha Site' published.", time: "1h ago", read: true, type: "project" },
    { id: 3, message: "Review for 'Beta Service' needs approval.", time: "3h ago", read: false, type: "review" },
    { id: 4, message: "New meeting booked by 'Jane Smith'.", time: "5m ago", read: false, type: "booking"},
  ]);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const countsPromises = [
        supabase.from('client_needs').select('*', { count: 'exact', head: true }), // Using client_needs for leads count
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('coupons').select('*', { count: 'exact', head: true }),
        supabase.from('game_settings').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
      ];
      
      const [
        { count: leadsCount, error: leadsError },
        { count: projectsCount, error: projectsError },
        { count: reviewsCount, error: reviewsError },
        { count: couponsCount, error: couponsError },
        { count: gameSettingsCount, error: gameSettingsError },
        { count: bookingsCount, error: bookingsError },
      ] = await Promise.all(countsPromises);

      const errors = [leadsError, projectsError, reviewsError, couponsError, gameSettingsError, bookingsError].filter(Boolean);
      if (errors.length > 0) {
        errors.forEach(err => console.error("Supabase count error:", err));
        throw new Error("Failed to fetch some statistics. Check console for details.");
      }

      setStats({
        leads: leadsCount || 0,
        projects: projectsCount || 0,
        reviews: reviewsCount || 0,
        coupons: couponsCount || 0,
        gameSettings: gameSettingsCount || 0,
        bookings: bookingsCount || 0,
      });

      const { data: leadsData, error: recentLeadsError } = await supabase
        .from('client_needs') // Using client_needs for recent leads
        .select('id, full_name, submitted_at, services_interested')
        .order('submitted_at', { ascending: false })
        .limit(3);
      
      if (recentLeadsError) {
        console.error("Supabase recent leads error:", recentLeadsError);
        throw new Error("Failed to fetch recent leads.");
      }
      setRecentLeads(leadsData || []);

      const { data: bookingsData, error: recentBookingsError } = await supabase
        .from('meetings')
        .select('id, name, meeting_date, meeting_time, status')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentBookingsError) {
         console.error("Supabase recent bookings error:", recentBookingsError);
         throw new Error("Failed to fetch recent bookings.");
      }
      setRecentBookings(bookingsData || []);


    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({ title: 'Error Loading Dashboard', description: error.message || 'Failed to load dashboard data. Please refresh.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const exportClientNeedsCSV = async () => {
    setLoading(true);
    try {
        const { data: leadsData, error: supabaseError } = await supabase
            .from('client_needs')
            .select('*')
            .order('submitted_at', { ascending: false });

        if (supabaseError) throw supabaseError;

        if (leadsData.length === 0) {
            toast({ title: 'No Data', description: 'No client needs data to export.', variant: 'default' });
            setLoading(false);
            return;
        }

        const headers = [
            'ID', 'Full Name', 'Email', 'Phone Number', 'Company Name', 'Website',
            'Services Interested', 'Budget Range', 'Deadline', 'Main Objective',
            'Target Audience', 'Competitors/Inspirations', 'Past Agency Experience',
            'How Did You Find Us', 'Additional Details', 'GDPR Consent', 'Submitted At'
        ];
        const rows = leadsData.map(lead => [
            lead.id,
            `"${(lead.full_name || '').replace(/"/g, '""')}"`,
            `"${(lead.email || '').replace(/"/g, '""')}"`,
            `"${(lead.phone_number || '').replace(/"/g, '""')}"`,
            `"${(lead.company_name || '').replace(/"/g, '""')}"`,
            `"${(lead.website || '').replace(/"/g, '""')}"`,
            `"${(lead.services_interested || []).join(', ').replace(/"/g, '""')}"`,
            `"${(lead.budget_range || '').replace(/"/g, '""')}"`,
            lead.deadline ? new Date(lead.deadline).toLocaleDateString() : '',
            `"${(lead.main_objective || '').replace(/"/g, '""')}"`,
            `"${(lead.target_audience || '').replace(/"/g, '""')}"`,
            `"${(lead.competitors_inspirations || '').replace(/"/g, '""')}"`,
            lead.past_agency_experience === null ? '' : (lead.past_agency_experience ? 'Yes' : 'No'),
            `"${(lead.how_did_you_find_us || '').replace(/"/g, '""')}"`,
            `"${(lead.additional_details || '').replace(/"/g, '""')}"`,
            lead.gdpr_consent ? 'Yes' : 'No',
            lead.submitted_at ? new Date(lead.submitted_at).toLocaleString() : '',
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "outwit_client_needs_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Export Successful', description: 'Client needs data exported to CSV.' });

    } catch (error) {
        console.error("Error exporting client needs CSV:", error);
        toast({ title: 'Export Error', description: 'Failed to export client needs data.', variant: 'destructive' });
    } finally {
        setLoading(false);
    }
};


  const statCardsData = [
    { title: 'Total Leads', valueKey: 'leads', icon: <Users className="h-6 w-6 text-primary" />, color: 'text-primary', link: '/admin/leads' },
    { title: 'Total Bookings', valueKey: 'bookings', icon: <CalendarClock className="h-6 w-6 text-indigo-500" />, color: 'text-indigo-500', link: '/admin/bookings' },
    { title: 'Managed Projects', valueKey: 'projects', icon: <Briefcase className="h-6 w-6 text-green-500" />, color: 'text-green-500', link: '/admin/projects' },
    { title: 'Client Reviews', valueKey: 'reviews', icon: <MessageSquareText className="h-6 w-6 text-blue-500" />, color: 'text-blue-500', link: '/admin/reviews' },
    { title: 'Active Coupons', valueKey: 'coupons', icon: <Tag className="h-6 w-6 text-yellow-500" />, color: 'text-yellow-500', link: '/admin/coupons' },
    { title: 'Game Configs', valueKey: 'gameSettings', icon: <Settings className="h-6 w-6 text-purple-500" />, color: 'text-purple-500', link: '/admin/game-settings' },
  ];

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? {...n, read: true} : n));
  };
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 p-1">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)} className="relative text-muted-foreground hover:text-primary">
            <Bell className="h-6 w-6" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-0 right-0 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary text-xs text-primary-foreground items-center justify-center">{unreadNotificationsCount}</span>
              </span>
            )}
          </Button>
          {showNotifications && (
            <Card className="absolute right-0 mt-2 w-80 glassmorphism shadow-xl z-50">
              <CardHeader className="p-3 border-b border-border/30">
                <CardTitle className="text-base text-gradient">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="p-0 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className={`p-3 border-b border-border/20 last:border-b-0 hover:bg-muted/30 cursor-pointer ${!notif.read ? 'bg-primary/5' : ''}`} onClick={() => markNotificationAsRead(notif.id)}>
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-foreground' : 'text-foreground/80'}`}>{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.time}</p>
                    </div>
                  ))
                )}
              </CardContent>
              <CardFooter className="p-2 border-t border-border/30">
                 <Button variant="link" size="sm" className="w-full text-primary">View All (Conceptual)</Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
      
      {loading && !stats.leads && !stats.bookings ? ( // Show loader if critical stats are zero and loading
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="ml-4 text-lg text-muted-foreground">Loading System Stats...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCardsData.map((card) => (
            <Link to={card.link} key={card.title}>
              <Card className="glassmorphism hover:shadow-lg hover:border-primary/50 transition-all duration-300 border border-transparent h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                  {card.icon}
                </CardHeader>
                <CardContent>
                  <div className={`text-4xl font-bold ${card.color}`}>{loading && stats[card.valueKey] === 0 ? <Loader2 className="h-8 w-8 animate-spin inline-block"/> : stats[card.valueKey]}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 glassmorphism">
          <CardHeader>
            <CardTitle className="text-xl text-gradient">Recent Leads</CardTitle>
            <CardDescription>Last 3 client needs submissions.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && recentLeads.length === 0 ? (
              <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
            ) : recentLeads.length > 0 ? (
              <ul className="space-y-3">
                {recentLeads.map(lead => (
                  <li key={lead.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{lead.full_name}</p>
                      <p className="text-xs text-muted-foreground">{(lead.services_interested && lead.services_interested.length > 0 ? lead.services_interested[0] : 'General Inquiry')} - {new Date(lead.submitted_at).toLocaleDateString()}</p>
                    </div>
                    <Link to={`/admin/leads#${lead.id}`}> {/* Ensure leads page can handle hash for specific lead */}
                       <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-6">No recent leads.</p>
            )}
          </CardContent>
        </Card>
        
         <Card className="lg:col-span-1 glassmorphism">
          <CardHeader>
            <CardTitle className="text-xl text-gradient">Recent Bookings</CardTitle>
            <CardDescription>Last 3 bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading && recentBookings.length === 0 ? (
              <div className="flex justify-center items-center py-6"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
            ) : recentBookings.length > 0 ? (
              <ul className="space-y-3">
                {recentBookings.map(booking => (
                  <li key={booking.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{booking.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.meeting_date).toLocaleDateString()} at {booking.meeting_time} - <span className={`capitalize font-medium ${booking.status === 'confirmed' ? 'text-green-500' : booking.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>{booking.status || 'N/A'}</span>
                      </p>
                    </div>
                     <Link to={`/admin/bookings#${booking.id}`}> {/* Ensure bookings page can handle hash */}
                       <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">View</Button>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-6">No recent bookings.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 glassmorphism">
          <CardHeader>
            <CardTitle className="text-xl text-gradient">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start text-primary border-primary hover:bg-primary/10 button-hover-glow">
              <Link to="/admin/projects"><Briefcase className="mr-2 h-4 w-4" /> Add New Project</Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start text-primary border-primary hover:bg-primary/10 button-hover-glow">
              <Link to="/admin/leads"><Users className="mr-2 h-4 w-4" /> View All Leads</Link>
            </Button>
             <Button asChild variant="outline" className="w-full justify-start text-primary border-primary hover:bg-primary/10 button-hover-glow">
              <Link to="/admin/bookings"><CalendarClock className="mr-2 h-4 w-4" /> Manage Bookings</Link>
            </Button>
             <Button variant="outline" className="w-full justify-start text-primary border-primary hover:bg-primary/10 button-hover-glow" onClick={() => toast({title: "Conceptual Feature", description: "Analytics reporting view would open here."})}>
              <BarChart3 className="mr-2 h-4 w-4" /> View Analytics
            </Button>
             <Button variant="outline" className="w-full justify-start text-primary border-primary hover:bg-primary/10 button-hover-glow" onClick={exportClientNeedsCSV} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />} Export Leads Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;