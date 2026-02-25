import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

console.log('🚀 APP.JS: Starting App component');

// Loading component
const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-slate-300">Loading...</p>
      </div>
    </div>
  );
};

// Public pages - Load immediately (critical for first paint)
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Lazy load other pages to reduce initial bundle size
const ApplyPage = lazy(() => import("./pages/ApplyPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));

// Admin pages - Lazy load (not needed for initial load)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMentees = lazy(() => import("./pages/admin/AdminMentees"));
const AdminMentors = lazy(() => import("./pages/admin/AdminMentors"));
const AdminMocks = lazy(() => import("./pages/admin/AdminMocks"));
const AdminFeedbacks = lazy(() => import("./pages/admin/AdminFeedbacks"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));
const AdminCompanies = lazy(() => import("./pages/admin/AdminCompanies"));
const AdminTimeSlots = lazy(() => import("./pages/admin/AdminTimeSlots"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminMeetLinks = lazy(() => import("./pages/admin/AdminMeetLinks"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));

// Mentor pages - Lazy load
const MentorDashboard = lazy(() => import("./pages/mentor/MentorDashboard"));
const MentorMentees = lazy(() => import("./pages/mentor/MentorMentees"));
const MentorPayouts = lazy(() => import("./pages/mentor/MentorPayouts"));
const MentorMocks = lazy(() => import("./pages/mentor/MentorMocks"));
const MentorFeedbacks = lazy(() => import("./pages/mentor/MentorFeedbacks"));
const MentorBookingRequests = lazy(() => import("./pages/mentor/MentorBookingRequests"));

// Mentee pages - Lazy load
const MenteeDashboard = lazy(() => import("./pages/mentee/MenteeDashboard"));
const MenteeFeedbacks = lazy(() => import("./pages/mentee/MenteeFeedbacks"));
const MenteeBooking = lazy(() => import("./pages/mentee/MenteeBooking"));
const MenteeResumeAnalyzer = lazy(() => import("./pages/mentee/MenteeResumeAnalyzer"));
const MenteeInterviewPrep = lazy(() => import("./pages/mentee/MenteeInterviewPrep"));
const MenteeCommunity = lazy(() => import("./pages/mentee/MenteeCommunity"));
const MenteeMentorSelection = lazy(() => import("./pages/mentee/MenteeMentorSelection"));
const MenteeInterviewChecklist = lazy(() => import("./pages/mentee/MenteeInterviewChecklist"));

console.log('🚀 APP.JS: All imports loaded successfully');

function App() {
  console.log('🚀 APP.JS: App function called');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right" 
            richColors 
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                border: '1px solid var(--toast-border)',
                color: 'var(--toast-text)',
              },
            }}
          />
          <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayouts /></ProtectedRoute>} />
            <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><AdminPricing /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/time-slots" element={<ProtectedRoute allowedRoles={['admin']}><AdminTimeSlots /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/meet-links" element={<ProtectedRoute allowedRoles={['admin']}><AdminMeetLinks /></ProtectedRoute>} />

            {/* Mentor Routes */}
            <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor/mentees" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMentees /></ProtectedRoute>} />
            <Route path="/mentor/mocks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMocks /></ProtectedRoute>} />
            <Route path="/mentor/payouts" element={<ProtectedRoute allowedRoles={['mentor']}><MentorPayouts /></ProtectedRoute>} />
            <Route path="/mentor/feedbacks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorFeedbacks /></ProtectedRoute>} />
            <Route path="/mentor/booking-requests" element={<ProtectedRoute allowedRoles={['mentor']}><MentorBookingRequests /></ProtectedRoute>} />

            {/* Mentee Routes */}
            <Route path="/mentee" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/mentee/mocks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeMentorSelection /></ProtectedRoute>} />
            <Route path="/mentee/feedbacks" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeFeedbacks /></ProtectedRoute>} />
            <Route path="/mentee/book" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeBooking /></ProtectedRoute>} />
            <Route path="/mentee/resume-analyzer" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeResumeAnalyzer /></ProtectedRoute>} />
            <Route path="/mentee/interview-prep" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeInterviewPrep /></ProtectedRoute>} />
            <Route path="/mentee/community" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeCommunity /></ProtectedRoute>} />
            <Route path="/mentee/prep-checklist" element={<ProtectedRoute allowedRoles={['mentee']}><MenteeInterviewChecklist /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

console.log('🚀 APP.JS: App component defined');

export default App;
