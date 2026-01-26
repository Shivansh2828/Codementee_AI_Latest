import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import ApplyPage from "./pages/ApplyPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import RefundPolicy from "./pages/RefundPolicy";
import ContactUs from "./pages/ContactUs";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMentees from "./pages/admin/AdminMentees";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminMocks from "./pages/admin/AdminMocks";
import AdminFeedbacks from "./pages/admin/AdminFeedbacks";
import AdminPayments from "./pages/admin/AdminPayments";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorMentees from "./pages/mentor/MentorMentees";
import MentorMocks from "./pages/mentor/MentorMocks";
import MentorFeedbacks from "./pages/mentor/MentorFeedbacks";

// Mentee pages
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import MenteeMocks from "./pages/mentee/MenteeMocks";
import MenteeFeedbacks from "./pages/mentee/MenteeFeedbacks";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster 
          position="top-right" 
          richColors 
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f8fafc',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/apply" element={<ApplyPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/contact" element={<ContactUs />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/mentees" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentees /></ProtectedRoute>} />
          <Route path="/admin/mentors" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentors /></ProtectedRoute>} />
          <Route path="/admin/mocks" element={<ProtectedRoute allowedRoles={['admin']}><AdminMocks /></ProtectedRoute>} />
          <Route path="/admin/feedbacks" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedbacks /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />

          {/* Mentor Routes */}
          <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
          <Route path="/mentor/mentees" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMentees /></ProtectedRoute>} />
          <Route path="/mentor/mocks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMocks /></ProtectedRoute>} />
          <Route path="/mentor/feedbacks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorFeedbacks /></ProtectedRoute>} />

          {/* Mentee Routes */}
          <Route path="/mentee" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeDashboard /></ProtectedRoute>} />
          <Route path="/mentee/mocks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeMocks /></ProtectedRoute>} />
          <Route path="/mentee/feedbacks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeFeedbacks /></ProtectedRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
