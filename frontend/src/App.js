import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

console.log('🚀 APP.JS: Starting App component');

// Loading component
function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

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
const AgentPurchasePage = lazy(() => import("./pages/AgentPurchasePage"));
const AIAgentLandingPage = lazy(() => import("./pages/AIAgentLandingPage"));
const SystemDesignIndex = lazy(() => import("./pages/learn/SystemDesignIndex"));
const SystemDesignLesson = lazy(() => import("./pages/learn/SystemDesignLesson"));
const DSAPatternsPage = lazy(() => import("./pages/learn/DSAPatternsPage"));
const CoursesLandingPage = lazy(() => import("./pages/learn/CoursesLandingPage"));
const BehavioralPrepPage = lazy(() => import("./pages/learn/BehavioralPrepPage"));
const ConfirmationPage = lazy(() => import("./pages/ConfirmationPage"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const MockInterviewPage = lazy(() => import("./pages/MockInterviewPage"));
const PracticePage = lazy(() => import("./pages/PracticePage"));
const MentorshipPage = lazy(() => import("./pages/MentorshipPage"));
const ResumeReviewPage = lazy(() => import("./pages/ResumeReviewPage"));

// Admin pages - Lazy load (not needed for initial load)
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMentees = lazy(() => import("./pages/admin/AdminMentees"));
const AdminUserManagement = lazy(() => import("./pages/admin/AdminUserManagement"));
const AdminMentors = lazy(() => import("./pages/admin/AdminMentors"));
const AdminMocks = lazy(() => import("./pages/admin/AdminMocks"));
const AdminFeedbacks = lazy(() => import("./pages/admin/AdminFeedbacks"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts"));
const AdminCompanies = lazy(() => import("./pages/admin/AdminCompanies"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminPricing = lazy(() => import("./pages/admin/AdminPricing"));
const AdminResumeReviews = lazy(() => import("./pages/admin/AdminResumeReviews"));
const AdminSessionMonitor = lazy(() => import("./pages/admin/AdminSessionMonitor"));
const AdminMentorAnalytics = lazy(() => import("./pages/admin/AdminMentorAnalytics"));
const AdminSlots = lazy(() => import("./pages/admin/AdminSlots"));
const AdminBugReports = lazy(() => import("./pages/admin/AdminBugReports"));
const AdminBookingAnalytics = lazy(() => import("./pages/admin/AdminBookingAnalytics"));
const AdminRevenueTracker = lazy(() => import("./pages/admin/AdminRevenueTracker"));
const AdminMentorship = lazy(() => import("./pages/admin/AdminMentorship"));

// Mentor pages - Lazy load
const MentorDashboard = lazy(() => import("./pages/mentor/MentorDashboard"));
const MentorMentees = lazy(() => import("./pages/mentor/MentorMentees"));
const MentorPayouts = lazy(() => import("./pages/mentor/MentorPayouts"));
const MentorMocks = lazy(() => import("./pages/mentor/MentorMocks"));
const MentorFeedbacks = lazy(() => import("./pages/mentor/MentorFeedbacks"));
const MentorBugReports = lazy(() => import("./pages/mentor/MentorBugReports"));
const MentorBookingRequests = lazy(() => import("./pages/mentor/MentorBookingRequests"));
const MentorSlotsUnified = lazy(() => import("./pages/mentor/MentorSlotsUnified"));
const MentorBookings = lazy(() => import("./pages/mentor/MentorBookings"));
const MentorMentorship = lazy(() => import("./pages/mentor/MentorMentorship"));

// Mentee pages - Lazy load
const MenteeDashboard = lazy(() => import("./pages/mentee/MenteeDashboard"));
const MenteeFeedbacks = lazy(() => import("./pages/mentee/MenteeFeedbacks"));
const MenteePricing = lazy(() => import("./pages/mentee/MenteePricing"));
const MenteeResumeReview = lazy(() => import("./pages/mentee/MenteeResumeReview"));
const MenteeResumeReviewSlots = lazy(() => import("./pages/mentee/MenteeResumeReviewSlots"));
const MenteeCommunity = lazy(() => import("./pages/mentee/MenteeCommunity"));
const MenteeBugReports = lazy(() => import("./pages/mentee/MenteeBugReports"));
const MenteeMentorSelection = lazy(() => import("./pages/mentee/MenteeMentorSelection"));
const MenteeSlotBrowsing = lazy(() => import("./pages/mentee/MenteeSlotBrowsing"));
const MenteeJobSearch = lazy(() => import("./pages/mentee/MenteeJobSearch"));
const MenteeReferralFinder = lazy(() => import("./pages/mentee/MenteeReferralFinder"));
const MenteeTransactions = lazy(() => import("./pages/mentee/MenteeTransactions"));
const MenteeMentorship = lazy(() => import("./pages/mentee/MenteeMentorship"));

console.log('🚀 APP.JS: All imports loaded successfully');

function App() {
  console.log('🚀 APP.JS: App function called');
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <ScrollToTop />
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
            <Route path="/agent-purchase" element={<AgentPurchasePage />} />
            <Route path="/ai-agents" element={<AIAgentLandingPage />} />
            <Route path="/learn" element={<CoursesLandingPage />} />
            <Route path="/learn/system-design" element={<SystemDesignIndex />} />
            <Route path="/learn/system-design/:slug" element={<SystemDesignLesson />} />
            <Route path="/learn/dsa-patterns" element={<DSAPatternsPage />} />
            <Route path="/learn/behavioral" element={<BehavioralPrepPage />} />
            <Route path="/confirmation" element={<ConfirmationPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/mock-interviews" element={<MockInterviewPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/mentorship" element={<MentorshipPage />} />
            <Route path="/resume-review" element={<ResumeReviewPage />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagement /></ProtectedRoute>} />
            <Route path="/admin/mentees" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentees /></ProtectedRoute>} />
            <Route path="/admin/mentors" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentors /></ProtectedRoute>} />
            <Route path="/admin/mocks" element={<ProtectedRoute allowedRoles={['admin']}><AdminMocks /></ProtectedRoute>} />
            <Route path="/admin/feedbacks" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedbacks /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayments /></ProtectedRoute>} />
            <Route path="/admin/payouts" element={<ProtectedRoute allowedRoles={['admin']}><AdminPayouts /></ProtectedRoute>} />
            <Route path="/admin/pricing" element={<ProtectedRoute allowedRoles={['admin']}><AdminPricing /></ProtectedRoute>} />
            <Route path="/admin/resume-reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminResumeReviews /></ProtectedRoute>} />
            <Route path="/admin/companies" element={<ProtectedRoute allowedRoles={['admin']}><AdminCompanies /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/sessions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSessionMonitor /></ProtectedRoute>} />
            <Route path="/admin/mentor-analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentorAnalytics /></ProtectedRoute>} />
            <Route path="/admin/booking-analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookingAnalytics /></ProtectedRoute>} />
            <Route path="/admin/revenue" element={<ProtectedRoute allowedRoles={['admin']}><AdminRevenueTracker /></ProtectedRoute>} />
            <Route path="/admin/bug-reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminBugReports /></ProtectedRoute>} />
            <Route path="/admin/slots" element={<ProtectedRoute allowedRoles={['admin']}><AdminSlots /></ProtectedRoute>} />
            <Route path="/admin/mentorship" element={<ProtectedRoute allowedRoles={['admin']}><AdminMentorship /></ProtectedRoute>} />

            {/* Mentor Routes */}
            <Route path="/mentor" element={<ProtectedRoute allowedRoles={['mentor']}><MentorDashboard /></ProtectedRoute>} />
            <Route path="/mentor/slots" element={<ProtectedRoute allowedRoles={['mentor']}><MentorSlotsUnified /></ProtectedRoute>} />
            <Route path="/mentor/bookings" element={<ProtectedRoute allowedRoles={['mentor']}><MentorBookings /></ProtectedRoute>} />
            <Route path="/mentor/mocks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMocks /></ProtectedRoute>} />
            <Route path="/mentor/mentees" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMentees /></ProtectedRoute>} />
            <Route path="/mentor/payouts" element={<ProtectedRoute allowedRoles={['mentor']}><MentorPayouts /></ProtectedRoute>} />
            <Route path="/mentor/feedbacks" element={<ProtectedRoute allowedRoles={['mentor']}><MentorFeedbacks /></ProtectedRoute>} />
            <Route path="/mentor/bug-reports" element={<ProtectedRoute allowedRoles={['mentor']}><MentorBugReports /></ProtectedRoute>} />
            <Route path="/mentor/mentorship" element={<ProtectedRoute allowedRoles={['mentor']}><MentorMentorship /></ProtectedRoute>} />

            {/* Mentee Routes */}
            <Route path="/mentee" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeDashboard /></ProtectedRoute>} />
            <Route path="/mentee/book" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteePricing /></ProtectedRoute>} />
            <Route path="/mentee/slots" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeSlotBrowsing /></ProtectedRoute>} />
            <Route path="/mentee/mocks" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeMentorSelection /></ProtectedRoute>} />
            <Route path="/mentee/feedbacks" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeFeedbacks /></ProtectedRoute>} />
            <Route path="/mentee/resume-review" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeResumeReview /></ProtectedRoute>} />
            <Route path="/mentee/resume-review-slots" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeResumeReviewSlots /></ProtectedRoute>} />
            <Route path="/mentee/community" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeCommunity /></ProtectedRoute>} />
            <Route path="/mentee/bug-reports" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeBugReports /></ProtectedRoute>} />
            <Route path="/mentee/job-search" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeJobSearch /></ProtectedRoute>} />
            <Route path="/mentee/referral-finder" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeReferralFinder /></ProtectedRoute>} />
            <Route path="/mentee/transactions" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeTransactions /></ProtectedRoute>} />
            <Route path="/mentee/mentorship" element={<ProtectedRoute allowedRoles={['mentee', 'agent_user']}><MenteeMentorship /></ProtectedRoute>} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CurrencyProvider>
    </AuthProvider>
  </ThemeProvider>
  );
}

console.log('🚀 APP.JS: App component defined');

export default App;
