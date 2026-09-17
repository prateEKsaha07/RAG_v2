import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

import AnalyticsNavbar from "./components/AnalyticsNavbar";
import AnalyticsSidebar from "./components/AnalyticsSidebar";

import Overview from "./pages/Overview";
import Performance from "./pages/Performance";
import Study from "./pages/Study";
import Quiz from "./pages/Quiz";
import Roadmaps from "./pages/Roadmaps";
import Reports from "./pages/Reports";

import { getDashboard } from "../../api/analyticsApi";

const pages = {
  overview: Overview,
  performance: Performance,
  study: Study,
  quiz: Quiz,
  roadmaps: Roadmaps,
  reports: Reports,
};

function AnalyticsDashboard({ onBack }) {
  const [page, setPage] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    setLoading(true);
    try {
      const data = await getDashboard();
      setDashboard(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load analytics dashboard.");
    } finally {
      setLoading(false);
    }
  }

  // Close mobile menu when page changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  // Escape closes drawer
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const CurrentPage = pages[page] || Overview;

  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/80 flex flex-col">
      <AnalyticsNavbar
        onBack={onBack}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <div className="flex flex-1 relative min-h-0">
        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block flex-shrink-0">
          <AnalyticsSidebar page={page} setPage={setPage} />
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              {/* Drawer panel */}
              <motion.aside
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 260 }}
                className="
                  fixed top-0 left-0 bottom-0 z-50
                  w-[82%] max-w-xs
                  bg-white shadow-2xl
                  lg:hidden
                  flex flex-col
                "
                style={{
                  paddingTop: "env(safe-area-inset-top, 0px)",
                  paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
              >
                {/* Drawer header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-800">
                      Analytics
                    </h2>
                    <p className="text-xs text-slate-400">
                      Navigate sections
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="
                      p-2 rounded-xl
                      hover:bg-slate-100 active:scale-90
                      transition-colors
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400
                    "
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Drawer body — reused AnalyticsSidebar */}
                <div className="flex-1 overflow-y-auto">
                  <AnalyticsSidebar
                    page={page}
                    setPage={setPage}
                    isMobile
                  />
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main content */}
        <main
          className="
            flex-1 min-w-0
            overflow-y-auto
            p-4 sm:p-6 lg:p-8
            lg:h-[calc(100vh-4rem)]
          "
          style={{
            paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] lg:h-full"
              >
                <div className="relative">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 border-4 border-slate-100 border-t-purple-400 rounded-full animate-spin animation-delay-150" />
                  </div>
                </div>
                <p className="mt-6 text-sm font-medium text-slate-500 animate-pulse">
                  Loading Analytics...
                </p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[60vh] lg:h-full"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl ring-1 ring-red-100">
                  <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full bg-red-50">
                    <svg
                      className="w-7 h-7 sm:w-8 sm:h-8 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-center text-red-600 mb-6 font-medium text-sm sm:text-base">
                    {error}
                  </p>
                  <button
                    onClick={fetchDashboard}
                    className="
                      w-full px-4 py-2.5 rounded-xl
                      bg-gradient-to-r from-indigo-500 to-purple-500
                      text-white font-medium
                      hover:from-indigo-600 hover:to-purple-600
                      transition-all duration-300
                      transform hover:scale-[1.02] active:scale-[0.98]
                      shadow-lg shadow-indigo-500/25
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2
                    "
                  >
                    Retry
                  </button>
                </div>
              </motion.div>
            )}

            {!loading && !error && dashboard && (
              <motion.div
                key="dashboard"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="min-h-full"
              >
                <CurrentPage
                  dashboard={dashboard}
                  refreshDashboard={fetchDashboard}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;