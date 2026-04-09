import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/authContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Browse from "./pages/Browse";
import ItemDetail from "./pages/ItemDetail";
import AddListing from "./pages/AddListing";
import MyListings from "./pages/MyListings";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Requests from "./pages/Requests";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ✅ This guard uses AuthContext — waits for it to be ready before deciding to redirect
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, ready } = useAuth();

  // ✅ FIX: ready starts as false, so this spinner shows during the localStorage read.
  // Without this guard, the redirect to /login fires before the token is loaded.
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  // ❌ Not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Logged in → show page
  return <>{children}</>;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/item/:id" element={<ItemDetail />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <RequireAuth><Dashboard /></RequireAuth>
      } />
      <Route path="/add-listing" element={
        <RequireAuth><AddListing /></RequireAuth>
      } />
      <Route path="/my-listings" element={
        <RequireAuth><MyListings /></RequireAuth>
      } />
      <Route path="/messages" element={
        <RequireAuth><Messages /></RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth><Profile /></RequireAuth>
      } />
      <Route path="/requests" element={
        <RequireAuth><Requests /></RequireAuth>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;