function SubjectSelector({
  subjects,
  value,
  onChange,
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow mb-8">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-lg p-2"
      >
        <option value="">Select subject...</option>

        {subjects.map((subject) => (
          <option key={subject} value={subject}>
            {subject}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SubjectSelector;