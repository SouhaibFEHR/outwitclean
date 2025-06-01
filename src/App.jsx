import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import { supabase } from '@/lib/supabaseClient';
import { Toaster } from '@/components/ui/toaster'; 
import ProjectQuoteForm from '@/components/ProjectQuoteForm'; 

// Lazy load admin components
const AdminLoginPage = React.lazy(() => import('@/pages/admin/AdminLoginPage'));
const AdminLayout = React.lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboardPage = React.lazy(() => import('@/pages/admin/AdminDashboardPage'));
const LeadsManagementPage = React.lazy(() => import('@/pages/admin/LeadsManagementPage'));
const BookingsManagementPage = React.lazy(() => import('@/pages/admin/BookingsManagementPage')); // Added
const ProjectsManagementPage = React.lazy(() => import('@/pages/admin/ProjectsManagementPage'));
const ReviewsManagementPage = React.lazy(() => import('@/pages/admin/ReviewsManagementPage'));
const CouponsManagementPage = React.lazy(() => import('@/pages/admin/CouponsManagementPage'));
const GameSettingsManagementPage = React.lazy(() => import('@/pages/admin/GameSettingsManagementPage'));


const AuthStateLogger = () => {
  const location = useLocation();
  useEffect(() => {
    const authListener = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event} at ${location.pathname}`, session);
    });
    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, [location]);
  return null;
};

const ProtectedRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error getting session:", error);
        }
        setSession(currentSession);
      } catch (e) {
        console.error("Exception in getSession:", e);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const authListener = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      authListener?.data?.subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading authentication status...</div>;
  }

  return session ? children : <Navigate to="/admin/login" replace />;
};

const AdminRouteFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading Admin Module...</div>
);

const GlobalFallback = () => (
  <div className="flex justify-center items-center min-h-screen bg-background text-foreground">Loading Application... Please Wait...</div>
);


function App() {
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);

  useEffect(() => {
    const formShownInSession = sessionStorage.getItem('quoteFormShown');
    const alreadySubmitted = sessionStorage.getItem('quoteFormSubmitted');

    if (!formShownInSession && !alreadySubmitted) {
      const timer = setTimeout(() => {
        if (!sessionStorage.getItem('quoteFormSubmitted')) { 
           setIsQuoteFormOpen(true);
           sessionStorage.setItem('quoteFormShown', 'true'); 
        }
      }, 10000); 
      return () => clearTimeout(timer);
    } else if (alreadySubmitted) {
      setIsQuoteFormOpen(false);
    }
  }, []);


  return (
    <Router>
      <AuthStateLogger />
      <Suspense fallback={<GlobalFallback />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout onLaunchProject={() => setIsQuoteFormOpen(true)} />}>
            <Route index element={<HomePage />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} /> 
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} /> 
            <Route path="dashboard" element={<Suspense fallback={<AdminRouteFallback />}><AdminDashboardPage /></Suspense>} />
            <Route path="leads" element={<Suspense fallback={<AdminRouteFallback />}><LeadsManagementPage /></Suspense>} />
            <Route path="bookings" element={<Suspense fallback={<AdminRouteFallback />}><BookingsManagementPage /></Suspense>} /> {/* Added */}
            <Route path="projects" element={<Suspense fallback={<AdminRouteFallback />}><ProjectsManagementPage /></Suspense>} />
            <Route path="reviews" element={<Suspense fallback={<AdminRouteFallback />}><ReviewsManagementPage /></Suspense>} />
            <Route path="coupons" element={<Suspense fallback={<AdminRouteFallback />}><CouponsManagementPage /></Suspense>} />
            <Route path="game-settings" element={<Suspense fallback={<AdminRouteFallback />}><GameSettingsManagementPage /></Suspense>} />
          </Route>
        </Routes>
      </Suspense>
      <ProjectQuoteForm isOpen={isQuoteFormOpen} onOpenChange={setIsQuoteFormOpen} />
      <Toaster />
    </Router>
  );
}

export default App;