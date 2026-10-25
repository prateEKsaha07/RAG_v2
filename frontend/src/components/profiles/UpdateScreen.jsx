import React, { useState } from "react";
import { updateMyProfile } from "../../api/profiles";

const educationOptions = [
  { value: "school", label: "School" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "other", label: "Other" },
];

const explanationOptions = [
  { value: "concise", label: "Concise" },
  { value: "detailed", label: "Detailed" },
  { value: "step_by_step", label: "Step by step" },
];

const difficultyOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System default" },
];

const languageOptions = [
  { value: "English", label: "English" },
  { value: "Hindi", label: "Hindi" },
];

export default function UpdateScreen({ profile, setProfile, onBack }) {
  const [displayName, setDisplayName] = useState(
    profile?.display_name || ""
  );
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const [educationLevel, setEducationLevel] = useState(
    profile?.education_level || "undergraduate"
  );
  const [fieldOfStudy, setFieldOfStudy] = useState(
    profile?.field_of_study || ""
  );
  const [currentCourse, setCurrentCourse] = useState(
    profile?.current_course || ""
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    profile?.preferred_language || "English"
  );
  const [explanationStyle, setExplanationStyle] = useState(
    profile?.explanation_style || "detailed"
  );
  const [difficultyPreference, setDifficultyPreference] = useState(
    profile?.difficulty_preference || "intermediate"
  );
  const [themePreference, setThemePreference] = useState(
    profile?.theme_preference || "system"
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      display_name: displayName,
      username,
      bio,
      education_level: educationLevel,
      field_of_study: fieldOfStudy,
      current_course: currentCourse,
      preferred_language: preferredLanguage,
      explanation_style: explanationStyle,
      difficulty_preference: difficultyPreference,
      theme_preference: themePreference,
    };

    try {
      const updatedData = await updateMyProfile(payload);
      setProfile(updatedData);
      onBack();
    } catch (err) {
      setError(
        err.message || "An error occurred while saving changes."
      );
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = {
    marginBottom: "16px",
  };

  const labelStyle = {
    display: "block",
    fontWeight: "600",
    marginBottom: "6px",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    boxSizing: "border-box",
  };

  const renderSelect = (label, value, setValue, options) => (
    <div style={fieldStyle}>
      <label style={labelStyle}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={loading}
        style={inputStyle}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>Edit Profile</h1>

      {error && (
        <div
          role="alert"
          style={{ color: "red", marginBottom: "15px" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading}
            rows={4}
            style={inputStyle}
          />
        </div>

        <h2>Education</h2>

        {renderSelect(
          "Education Level",
          educationLevel,
          setEducationLevel,
          educationOptions
        )}

        <div style={fieldStyle}>
          <label style={labelStyle}>Field of Study</label>
          <input
            type="text"
            value={fieldOfStudy}
            onChange={(e) => setFieldOfStudy(e.target.value)}
            disabled={loading}
            placeholder="e.g. Computer Science, Mathematics"
            style={inputStyle}
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Current Course / Subject</label>
          <input
            type="text"
            value={currentCourse}
            onChange={(e) => setCurrentCourse(e.target.value)}
            disabled={loading}
            placeholder="e.g. MCA, Artificial Intelligence"
            style={inputStyle}
          />
        </div>

        <h2>Study Preferences</h2>

        {renderSelect(
          "Preferred Language",
          preferredLanguage,
          setPreferredLanguage,
          languageOptions
        )}

        {renderSelect(
          "Explanation Style",
          explanationStyle,
          setExplanationStyle,
          explanationOptions
        )}

        {renderSelect(
          "Difficulty Preference",
          difficultyPreference,
          setDifficultyPreference,
          difficultyOptions
        )}

        {renderSelect(
          "Theme Preference",
          themePreference,
          setThemePreference,
          themeOptions
        )}

        <div style={{ marginTop: "24px" }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving Changes..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            style={{ marginLeft: "10px" }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}