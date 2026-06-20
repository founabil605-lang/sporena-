import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./screens/HomePage";
import { SearchResults } from "./screens/SearchResults";
import { ExperienceDetail } from "./screens/ExperienceDetail";
import { Checkout } from "./screens/Checkout";
import { BookingConfirmation } from "./screens/BookingConfirmation";
import { AuthChoice } from "./screens/AuthChoice";
import { ClubLogin } from "./screens/ClubLogin";
import { ClubRegister } from "./screens/ClubRegister";
import { FanLogin } from "./screens/FanLogin";
import { ClubDashboard } from "./screens/ClubDashboard";
import { ClubExperiences } from "./screens/ClubExperiences";
import { ClubBookings } from "./screens/ClubBookings";
import { ClubAnalytics } from "./screens/ClubAnalytics";
import { CreateExperience } from "./screens/CreateExperience";
import { Parametre } from "./screens/Parametre";
import { Abonnement } from "./screens/Abonnement";

export const App = () => {
  return (
    <AuthProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/checkout/:id" element={<Checkout />} />
          <Route path="/confirmation/:id" element={<BookingConfirmation />} />

          <Route path="/auth" element={<AuthChoice />} />
          <Route path="/auth/club-login" element={<ClubLogin />} />
          <Route path="/auth/club-register" element={<ClubRegister />} />
          <Route path="/auth/fan-login" element={<FanLogin />} />

          <Route
            path="/club/dashboard"
            element={
              <ProtectedRoute requiredRole="club">
                <ClubDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/experiences"
            element={
              <ProtectedRoute requiredRole="club">
                <ClubExperiences />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/bookings"
            element={
              <ProtectedRoute requiredRole="club">
                <ClubBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/analytics"
            element={
              <ProtectedRoute requiredRole="club">
                <ClubAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/experiences/create"
            element={
              <ProtectedRoute requiredRole="club">
                <CreateExperience />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/parametres"
            element={
              <ProtectedRoute requiredRole="club">
                <Parametre />
              </ProtectedRoute>
            }
          />
          <Route
            path="/club/abonnement"
            element={
              <ProtectedRoute requiredRole="club">
                <Abonnement />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
