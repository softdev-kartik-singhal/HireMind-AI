'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNav } from '@/components/dashboard/TopNav';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { ToastProvider, useToast } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { apiClient } from '@/lib/api-client';

// Data models & seeds
import {
  INITIAL_CANDIDATE_APPLICATIONS,
  INITIAL_CANDIDATE_INTERVIEWS,
  INITIAL_CANDIDATE_TESTS,
  INITIAL_RECRUITER_JOBS,
  INITIAL_RECRUITER_CANDIDATES,
  INITIAL_RECRUITER_INTERVIEWS,
  CandidateApplication,
  CandidateInterview,
  CandidateTest,
  RecruiterJob,
  RecruiterCandidate,
  RecruiterInterviewSession,
} from '@/lib/dashboard-data';

// Candidate views
import { CandidateDashboardView } from '@/components/dashboard/candidate/CandidateDashboardView';
import { CandidateJobsView } from '@/components/dashboard/candidate/CandidateJobsView';
import { CandidateApplicationsView } from '@/components/dashboard/candidate/CandidateApplicationsView';
import { CandidateInterviewsView } from '@/components/dashboard/candidate/CandidateInterviewsView';
import { CandidateTestsView } from '@/components/dashboard/candidate/CandidateTestsView';
import { CandidateResultsView } from '@/components/dashboard/candidate/CandidateResultsView';

// Recruiter views
import { RecruiterDashboardView } from '@/components/dashboard/recruiter/RecruiterDashboardView';
import { RecruiterJobsView } from '@/components/dashboard/recruiter/RecruiterJobsView';
import { RecruiterCandidatesView } from '@/components/dashboard/recruiter/RecruiterCandidatesView';
import { RecruiterInterviewsView } from '@/components/dashboard/recruiter/RecruiterInterviewsView';
import {
  RecruiterReportsView,
  RecruiterAnalyticsView,
  RecruiterSettingsView,
} from '@/components/dashboard/recruiter/RecruiterReportsView';

// Admin views
import { AdminDashboardView } from '@/components/dashboard/admin/AdminDashboardView';
import { AdminUsersView } from '@/components/dashboard/admin/AdminUsersView';
import {
  AdminAnalyticsView,
  AdminJobsView,
  AdminInterviewsView,
  AdminSettingsView,
} from '@/components/dashboard/admin/AdminAnalyticsView';

function DashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Recruiter modal states
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [isScheduleInterviewOpen, setIsScheduleInterviewOpen] = useState(false);
  const [targetCandidateName, setTargetCandidateName] = useState<string>('');

  // Interactive Seed Stores
  const [candidateApps] = useState<CandidateApplication[]>(INITIAL_CANDIDATE_APPLICATIONS);
  const [candidateInterviews] = useState<CandidateInterview[]>(INITIAL_CANDIDATE_INTERVIEWS);
  const [candidateTests] = useState<CandidateTest[]>(INITIAL_CANDIDATE_TESTS);

  const [recruiterJobs, setRecruiterJobs] = useState<RecruiterJob[]>(INITIAL_RECRUITER_JOBS);
  const [recruiterCandidates] = useState<RecruiterCandidate[]>(INITIAL_RECRUITER_CANDIDATES);
  const [recruiterInterviews, setRecruiterInterviews] = useState<RecruiterInterviewSession[]>(
    INITIAL_RECRUITER_INTERVIEWS
  );

  // Admin state
  const [adminUsersCount, setAdminUsersCount] = useState(1);
  const [systemHealth, setSystemHealth] = useState<any>(null);

  useEffect(() => {
    // Reset to dashboard tab when role changes
    setActiveTab('dashboard');

    if (user?.role === 'ADMIN') {
      apiClient.get('/users?limit=50').then((res) => {
        setAdminUsersCount(res.data?.data?.length || 1);
      }).catch(() => {});

      apiClient.get('/health').then((res) => {
        setSystemHealth(res.data?.data || null);
      }).catch(() => {});
    }
  }, [user?.role]);

  const handleAddJob = (job: RecruiterJob) => {
    setRecruiterJobs((prev) => [job, ...prev]);
  };

  const handleAddInterview = (interview: RecruiterInterviewSession) => {
    setRecruiterInterviews((prev) => [interview, ...prev]);
  };

  const handleOpenScheduleForCandidate = (candName?: string) => {
    if (candName) setTargetCandidateName(candName);
    setIsScheduleInterviewOpen(true);
  };

  // Breadcrumbs title mapper
  const getTabTitle = (tab: string) => {
    const titles: Record<string, string> = {
      dashboard: 'Dashboard',
      applications: 'My Applications',
      interviews: 'Interviews',
      tests: 'Coding Tests',
      results: 'Evaluations & Results',
      jobs: 'Job Requisitions',
      candidates: 'Candidate Pool',
      reports: 'Reports',
      analytics: 'Analytics',
      settings: 'Settings',
      users: 'User Directory',
      profile: 'Account Profile',
    };
    return titles[tab] || 'Overview';
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isOpenMobile={isOpenMobile}
        onCloseMobile={() => setIsOpenMobile(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <TopNav
          onOpenMobile={() => setIsOpenMobile(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dashboard Subheader with Breadcrumbs */}
        <div className="border-b border-slate-800/60 bg-slate-950/40 px-4 sm:px-6 lg:px-8 py-3">
          <Breadcrumbs
            items={[
              { label: `${user?.role || 'User'} Workspace`, href: '/dashboard' },
              { label: getTabTitle(activeTab) },
            ]}
          />
        </div>

        {/* Main Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {/* ======================================================== */}
            {/* CANDIDATE VIEWS                                         */}
            {/* ======================================================== */}
            {user?.role === 'CANDIDATE' && (
              <>
                {activeTab === 'dashboard' && (
                  <CandidateDashboardView
                    applications={candidateApps}
                    interviews={candidateInterviews}
                    tests={candidateTests}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {activeTab === 'jobs' && (
                  <CandidateJobsView
                    onApplicationSubmitted={() => {
                      // optional callback
                    }}
                  />
                )}
                {activeTab === 'applications' && (
                  <CandidateApplicationsView
                    onNavigateToJobs={() => setActiveTab('jobs')}
                  />
                )}
                {activeTab === 'interviews' && (
                  <CandidateInterviewsView interviews={candidateInterviews} />
                )}
                {activeTab === 'tests' && (
                  <CandidateTestsView tests={candidateTests} />
                )}
                {activeTab === 'results' && <CandidateResultsView />}
                {activeTab === 'profile' && (
                  <div className="text-center p-8">
                    <p className="text-sm text-slate-400">
                      Redirecting to <a href="/profile" className="text-indigo-400 underline">Profile Settings</a>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ======================================================== */}
            {/* RECRUITER VIEWS                                         */}
            {/* ======================================================== */}
            {user?.role === 'RECRUITER' && (
              <>
                {activeTab === 'dashboard' && (
                  <RecruiterDashboardView
                    jobs={recruiterJobs}
                    candidates={recruiterCandidates}
                    interviews={recruiterInterviews}
                    onNavigateTab={setActiveTab}
                    onOpenCreateJob={() => setIsCreateJobOpen(true)}
                    onOpenScheduleInterview={() => {
                      setTargetCandidateName('');
                      setIsScheduleInterviewOpen(true);
                    }}
                  />
                )}
                {activeTab === 'jobs' && (
                  <RecruiterJobsView
                    isCreateModalOpen={isCreateJobOpen}
                    onCloseCreateModal={() => setIsCreateJobOpen(!isCreateJobOpen)}
                    onOpenScheduleInterview={handleOpenScheduleForCandidate}
                  />
                )}
                {activeTab === 'candidates' && (
                  <RecruiterCandidatesView
                    candidates={recruiterCandidates}
                    onOpenScheduleInterview={handleOpenScheduleForCandidate}
                  />
                )}
                {activeTab === 'interviews' && (
                  <RecruiterInterviewsView
                    interviews={recruiterInterviews}
                    isScheduleModalOpen={isScheduleInterviewOpen}
                    onCloseScheduleModal={() => setIsScheduleInterviewOpen(false)}
                    onAddInterview={handleAddInterview}
                    initialCandidateName={targetCandidateName}
                  />
                )}
                {activeTab === 'reports' && <RecruiterReportsView />}
                {activeTab === 'analytics' && <RecruiterAnalyticsView />}
                {activeTab === 'settings' && <RecruiterSettingsView />}
              </>
            )}

            {/* ======================================================== */}
            {/* ADMIN VIEWS                                             */}
            {/* ======================================================== */}
            {user?.role === 'ADMIN' && (
              <>
                {activeTab === 'dashboard' && (
                  <AdminDashboardView
                    usersCount={adminUsersCount}
                    systemHealth={systemHealth}
                    onNavigateTab={setActiveTab}
                  />
                )}
                {activeTab === 'users' && <AdminUsersView />}
                {activeTab === 'jobs' && <AdminJobsView />}
                {activeTab === 'interviews' && <AdminInterviewsView />}
                {activeTab === 'analytics' && (
                  <AdminAnalyticsView systemHealth={systemHealth} />
                )}
                {activeTab === 'settings' && <AdminSettingsView />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ProtectedRoute>
          <DashboardContent />
        </ProtectedRoute>
      </ToastProvider>
    </ThemeProvider>
  );
}
