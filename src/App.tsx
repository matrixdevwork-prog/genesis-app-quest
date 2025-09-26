import { Routes, Route } from "react-router-dom";

// Import pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Promote from "./pages/Promote";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Referrals from "./pages/Referrals";
import Admin from "./pages/Admin";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

// Import layouts and components
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

const App = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<Index />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    
    {/* Protected routes with main layout */}
    <Route element={<MainLayout />}>
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tasks" 
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/promote" 
        element={
          <ProtectedRoute>
            <Promote />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/leaderboard" 
        element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/referrals" 
        element={
          <ProtectedRoute>
            <Referrals />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } 
      />
    </Route>

    {/* Admin routes */}
    <Route 
      path="/admin/*" 
      element={
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      } 
    />

    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
