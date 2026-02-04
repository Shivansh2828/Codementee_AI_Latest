import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

console.log('🚀 APP.JS: Starting App component');

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
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminTimeSlots from "./pages/admin/AdminTimeSlots";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminMeetLinks from "./pages/admin/AdminMeetLinks";
import AdminPricing from "./pages/admin/AdminPricing";

// Mentor pages
import MentorDashboard from "./pages/mentor/MentorDashboard";
import MentorMentees from "./pages/mentor/MentorMentees";
import MentorMocks from "./pages/mentor/MentorMocks";
import MentorFeedbacks from "./pages/mentor/MentorFeedbacks";
import MentorBookingRequests from "./pages/mentor/MentorBookingRequests";

// Mentee pages
import MenteeDashboard from "./pages/mentee/MenteeDashboard";
import MenteeMocks from "./pages/mentee/MenteeMocks";
import MenteeFeedbacks from "./pages/mentee/MenteeFeedbacks";
import MenteeBooking from "./pages/mentee/MenteeBooking";
import MenteeResumeAnalyzer from "./pages/mentee/MenteeResumeAnalyzer";
import MenteeInterviewPrep from "./pages/mentee/MenteeInterviewPrep";
import MenteeCommunity from "./pages/mentee/MenteeCommunity";
import MenteeMentorSelection from "./pages/mentee/MenteeMentorSelection";

console.log('🚀 APP.JS: All imports loaded successfully');

function App() {
  console.log('🚀 APP.JS: App function called');
  
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
        <React.Suspense fallback={
          <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading Codementee...</p>
            </div>
          </div>
        }>
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
            <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><AdminPricing /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/time-slots" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimeSlots /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/meet-links" element={<ProtectedRoute allowedRoles={['admin']}><AdminMeetLinks /></ProtectedRoute>} />

            {/* Mentor Routes */}
            <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor/mentees" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMentees /></ProtectedRoute>} />
            <Route path="/mentor/mocks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMocks /></ProtectedRoute>} />
            <Route path="/mentor/feedbacks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorFeedbacks /></ProtectedRoute>} />
            <Route path="/mentor/booking-requests" element={<ProtectedRoute allowedRoles={['mentor']}><MentorBookingRequests /></ProtectedRoute>} />

            {/* Mentee Routes */}
            <Route path="/mentee" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/mentee/mocks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeMocks /></ProtectedRoute>} />
            <Route path="/mentee/feedbacks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeFeedbacks /></ProtectedRoute>} />
            <Route path="/mentee/book" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeBooking /></ProtectedRoute>} />
            <Route path="/mentee/resume-analyzer" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/mentee/interview-prep" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeInterviewPrep /></ProtectedRoute>} />
            <Route path="/mentee/community" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeCommunity /></ProtectedRoute>} />
            <Route path="/mentee/mocks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeMentorSelection /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

console.log('🚀 APP.JS: App component defined');

export default App;
