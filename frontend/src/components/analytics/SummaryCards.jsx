import { useEffect, useState } from "react";

// SVG Icons
const Icons = {
  attempts: (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 2v4h4" />
    </svg>
  ),
  average: (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  best: (
    <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  weak: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2" />
    </svg>
  )
};

function SummaryCards({ summary }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cards = [
    {
      label: "Total Attempts",
      value: summary.total_attempts,
      icon: Icons.attempts,
      color: "blue",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      textColor: "text-blue-600",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      label: "Average Score",
      value: `${Math.round((summary.average_score / summary.total) * 100)}%`,
      icon: Icons.average,
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-100",
      textColor: "text-green-600",
      gradient: "from-green-400 to-green-600",
    },
    {
      label: "Best Score",
      value: `${summary.best_score}/${summary.total}`,
      icon: Icons.best,
      color: "purple",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      textColor: "text-purple-600",
      gradient: "from-purple-400 to-purple-600",
    },
    {
      label: "Most Weak Topic",
      value: summary.most_weak_topic || "None",
      icon: Icons.weak,
      color: "red",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      textColor: "text-red-600",
      gradient: "from-red-400 to-red-600",
    },
  ];

  // Calculate progress percentage for visual indicator
  const getProgressValue = (card) => {
    if (card.label === "Total Attempts") {
      return Math.min((card.value / 100) * 100, 100);
    }
    if (card.label === "Average Score") {
      return parseInt(card.value);
    }
    if (card.label === "Best Score") {
      const [score, total] = card.value.split('/');
      return Math.round((parseInt(score) / parseInt(total)) * 100);
    }
    return 0;
  };

  // Get font size based on text length for weak topic
  const getWeakTopicFontSize = (text) => {
    if (!text || text === "None") return "text-2xl";
    const length = text.length;
    if (length <= 15) return "text-2xl";
    if (length <= 25) return "text-xl";
    if (length <= 35) return "text-lg";
    if (length <= 45) return "text-base";
    return "text-sm";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-2xl p-5 shadow-lg shadow-gray-200/50 border border-gray-100/80 hover:shadow-xl hover:shadow-gray-200/70 transition-all duration-300 hover:-translate-y-1 ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{
            transitionDelay: `${index * 100}ms`,
            transitionProperty: 'all',
            transitionDuration: '600ms',
          }}
        >
          {/* Icon and Label */}
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-xl ${card.bgColor}`}>
              {card.icon}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${card.textColor} opacity-70`}>
              {card.label}
            </span>
          </div>

          {/* Value with dynamic font size for weak topic */}
          <div className={`${card.label === "Most Weak Topic" ? getWeakTopicFontSize(card.value) : "text-2xl"} font-bold ${card.textColor} ${card.label === "Most Weak Topic" ? "break-words whitespace-normal" : "truncate"} mb-2`}>
            {card.value}
          </div>

          {/* Progress Bar */}
          {card.label !== "Most Weak Topic" && (
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${card.gradient} rounded-full transition-all duration-1000 ease-out`}
                style={{ 
                  width: isMounted ? `${getProgressValue(card)}%` : '0%',
                }}
              />
            </div>
          )}

          {/* Most Weak Topic badge */}
          {card.label === "Most Weak Topic" && card.value !== "None" && (
            <div className="mt-2 px-2 py-1 bg-red-50 rounded-lg inline-block">
              <span className="text-[9px] font-medium text-red-600">
                Needs Attention
              </span>
            </div>
          )}

          {/* Sub-label with additional info */}
          {card.label === "Total Attempts" && (
            <p className="text-[10px] text-gray-400 mt-1">
              Total quizzes taken
            </p>
          )}
          {card.label === "Average Score" && (
            <p className="text-[10px] text-gray-400 mt-1">
              Across all attempts
            </p>
          )}
          {card.label === "Best Score" && (
            <p className="text-[10px] text-gray-400 mt-1">
              Your highest score
            </p>
          )}
          {card.label === "Most Weak Topic" && card.value !== "None" && (
            <p className="text-[10px] text-gray-400 mt-1">
              Focus on this topic
            </p>
          )}
          {card.label === "Most Weak Topic" && card.value === "None" && (
            <p className="text-[10px] text-gray-400 mt-1">
              No weak topics identified
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;