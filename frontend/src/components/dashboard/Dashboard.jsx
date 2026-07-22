import DashboardNav from "./DashboardNav";
import HeroSection from "./HeroSection";
import StudyWorkspace from "./StudyWorkspace";
import ProgressOverview from "./ProgressOverview";
import RoadmapWidget from "./RoadmapWidget";
import CoachWidget from "./CoachWidget";
import UpcomingSchedule from "./UpcomingSchedule";
import WeeklyProgress from "./WeeklyProgress";
import StudyStreak from "./StudyStreak";
import Achievements from "./Achievements";
import QuickActions from "./QuickActions";
import Footer from "../common/Footer";

function Dashboard({
  subject,
  onQuiz,
  onQA,
  onUpload,
  onNotes,
  onRoadmap,
  onAnalytics,
  onLogout,
  user,
  onAnalyticsV2,
  onStudy
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-50 to-white">

      <DashboardNav
        active="dashboard"
        onDashboard={() => {}}
        onStudy={onStudy}
        onUpload={onUpload}
        onNotes={onNotes}
        onQuiz={onQuiz}
        onRoadmap={onRoadmap}
        onAnalytics={onAnalytics}
        onAnalyticsV2={onAnalyticsV2}
        onLogout={onLogout}
      />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-8">

        {/* Hero */}
        <HeroSection
          user={user}
          subject={subject}
          onUpload={onUpload}
        />

        {/* Current study session (dummy for now) */}
        {/* <StudyWorkspace
          subject={subject}
          onQA={onQA}
        /> */}

        {/* Overall statistics */}
        {/* <ProgressOverview /> */}

        {/* Active roadmap */}
        {/* <RoadmapWidget
          onRoadmap={onRoadmap}
        /> */}

        {/* AI study assistant (dummy) */}
        {/* <CoachWidget /> */}

        {/* Upcoming study events */}
        {/* <UpcomingSchedule /> */}

        {/* Weekly analytics */}
        {/* <WeeklyProgress /> */}

        {/* Daily consistency */}
        {/* <StudyStreak /> */}

        {/* User achievements */}
        {/* <Achievements /> */}

        {/* Navigation shortcuts */}
        <QuickActions
          onNotes={onNotes}
          onQA={onQA}
          onQuiz={onQuiz}
          onUpload={onUpload}
          onAnalytics={onAnalytics}
          onRoadmap={onRoadmap}
        />

        {/*
          Future Dashboard Widgets

          <NotificationsWidget />
          <ExamCountdown />
          <Leaderboard />
          <PomodoroWidget />
          <RecentActivity />
        */}

      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;