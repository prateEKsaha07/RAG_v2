function SummaryCards({ summary }) {
  const cards = [
    {
      label: "Total Attempts",
      value: summary.total_attempts,
      color: "text-blue-600",
    },
    {
      label: "Average Score",
      value: `${Math.round(
        (summary.average_score / summary.total) * 100
      )}%`,
      color: "text-green-600",
    },
    {
      label: "Best Score",
      value: `${summary.best_score}/${summary.total}`,
      color: "text-purple-600",
    },
    {
      label: "Most Weak Topic",
      value: summary.most_weak_topic || "None",
      color: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow text-center"
        >
          <p className={`text-2xl font-bold ${card.color} truncate`}>
            {card.value}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;