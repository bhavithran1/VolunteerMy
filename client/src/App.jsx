import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import Landing from "./pages/Landing.jsx";
import Auth from "./pages/Auth.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import VolunteerDashboard from "./pages/VolunteerDashboard.jsx";
import OrganizerDashboard from "./pages/OrganizerDashboard.jsx";
import NotFound from "./pages/NotFound.jsx";

function Protected({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="container section center muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/dashboard" element={<Protected role="volunteer"><VolunteerDashboard /></Protected>} />
          <Route path="/organizer" element={<Protected role="organizer"><OrganizerDashboard /></Protected>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
