import { useState } from "react";

import AnalyticsNavbar from "./components/AnalyticsNavbar";
import AnalyticsSidebar from "./components/AnalyticsSidebar";

import Overview from "./pages/Overview";
import Performance from "./pages/Performance";
import Study from "./pages/Study";
import Quiz from "./pages/Quiz";
import Roadmaps from "./pages/Roadmaps";
import Reports from "./pages/Reports";

function AnalyticsDashboard({ onBack }) {

    const [page, setPage] = useState("overview");

    return (

        <div className="min-h-screen bg-gray-100">

            <AnalyticsNavbar
                onBack={onBack}
            />

            <div className="flex">

                <AnalyticsSidebar
                    page={page}
                    setPage={setPage}
                />

                <main className="flex-1 p-8">

                    {page === "overview" && <Overview />}
                    {page === "performance" && <Performance />}
                    {page === "study" && <Study />}
                    {page === "quiz" && <Quiz />}
                    {page === "roadmaps" && <Roadmaps />}
                    {page === "reports" && <Reports />}

                </main>

            </div>

        </div>

    );
}

export default AnalyticsDashboard;