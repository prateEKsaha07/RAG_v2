import { useState, useEffect } from "react";

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

    const CurrentPage = pages[page] || Overview;

    return (

        <div className="min-h-screen bg-gray-100 flex flex-col">

            <AnalyticsNavbar
                onBack={onBack}
            />

            <div className="flex flex-1">

                <AnalyticsSidebar
                    page={page}
                    setPage={setPage}
                />

                <main className="flex-1 overflow-y-auto p-8">

                    {loading && (

                        <div className="flex items-center justify-center h-full text-gray-500">

                            Loading Analytics...

                        </div>

                    )}

                    {!loading && error && (

                        <div className="flex flex-col items-center justify-center h-full">

                            <p className="text-red-600 mb-4">

                                {error}

                            </p>

                            <button
                                onClick={fetchDashboard}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Retry
                            </button>

                        </div>

                    )}

                    {!loading && !error && dashboard && (

                        <CurrentPage
                            dashboard={dashboard}
                            refreshDashboard={fetchDashboard}
                        />

                    )}

                </main>

            </div>

        </div>

    );

}

export default AnalyticsDashboard;