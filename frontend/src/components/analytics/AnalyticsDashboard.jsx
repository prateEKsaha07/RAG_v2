import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [page]);

  useEffect(() => {
    if (mobileMenuOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const CurrentPage = pages[page] || Overview;

  const pageVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
  };

  return (
    <div className="min-h-screen bg-[#f7f3ee] flex flex-col">
      <AnalyticsNavbar
        onBack={onBack}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      <div className="flex flex-1 relative min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <AnalyticsSidebar page={page} setPage={setPage} />
        </div>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-[#2a1f14]/40 z-40 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />

              <motion.aside
                key="drawer"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 26, stiffness: 260 }}
                className="fixed top-0 left-0 bottom-0 z-50 w-[82%] max-w-xs bg-[#faf7f3] border-r border-[#e8dfd3] lg:hidden flex flex-col"
                style={{
                  paddingTop: "env(safe-area-inset-top, 0px)",
                  paddingBottom: "env(safe-area-inset-bottom, 0px)",
                }}
              >
                <div className="flex items-center justify-between p-4 border-b border-[#e8dfd3]">
                  <div>
                    <h2 className="text-sm font-semibold text-[#2a1f14]">
                      Analytics
                    </h2>
                    <p className="text-xs text-[#8a7965]">
                      Navigate sections
                    </p>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="w-9 h-9 rounded-md border border-[#e8dfd3] bg-white flex items-center justify-center text-[#8a7965] hover:text-[#5c1a1a] transition-colors"
                  >
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>

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
          className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:h-[calc(100vh-4rem)]"
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
                <div className="w-8 h-8 border-2 border-[#e8dfd3] border-t-[#5c1a1a] rounded-full animate-spin" />
                <p className="mt-5 text-sm text-[#8a7965]">
                  Loading analytics...
                </p>
              </motion.div>
            )}

            {!loading && error && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[60vh] lg:h-full"
              >
                <div className="bg-white border border-[#e8dfd3] rounded-lg p-8 max-w-md w-full text-center">
                  <div className="w-12 h-12 rounded-md border border-[#e8dfd3] bg-[#faf7f3] mx-auto flex items-center justify-center mb-4">
                    <svg
                      width="20"
                      height="20"
                      className="text-[#5c1a1a]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.8"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[#5a4a3a] mb-6">
                    {error}
                  </p>
                  <button
                    onClick={fetchDashboard}
                    className="w-full px-4 py-2.5 rounded-md bg-[#5c1a1a] text-white text-sm font-medium hover:bg-[#4a1414] transition-colors"
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
                transition={{ duration: 0.25, ease: "easeOut" }}
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