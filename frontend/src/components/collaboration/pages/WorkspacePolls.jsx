import { useCallback, useEffect, useState } from "react";
import {
  createWorkspacePoll,
  getWorkspacePolls,
  getWorkspacePollDetails,
  castWorkspacePollVote,
  closeWorkspacePoll,
  setWorkspacePollPin,
} from "../../../api/collaborationApi";
import { supabase } from "../../../supabaseClient";

function formatDate(date) {
  return date ? new Date(date).toLocaleString() : "";
}

export default function WorkspacePolls({ workspace }) {
  const [polls, setPolls] = useState([]);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");

  // NEW: current user + role for permission checks
  const [currentUserId, setCurrentUserId] = useState(null);
  const currentUserRole = workspace.current_user_role;

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data?.user?.id || null);
    };
    loadUser();
  }, []);

  // NEW: helper predicates mirroring the backend RPC rules
  //   close: allowed if creator, workspace owner, or workspace admin
  //   pin:   allowed only for workspace owner or admin
  const canClose = (poll) => {
    if (!poll) return false;
    if (currentUserRole === "owner" || currentUserRole === "admin") return true;
    return Boolean(currentUserId && poll.created_by === currentUserId);
  };

  const canPin = () =>
    currentUserRole === "owner" || currentUserRole === "admin";

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWorkspacePolls(workspace.id);
      setPolls(Array.isArray(data) ? data : data.polls || []);
    } catch (err) {
      setError(err.message || "Unable to load polls.");
    } finally {
      setLoading(false);
    }
  }, [workspace.id]);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const openPoll = async (poll) => {
    setSelectedPoll(null);
    setDetailsLoading(true);
    setError("");

    try {
      const data = await getWorkspacePollDetails(poll.id);
      setSelectedPoll(data.poll || data);
    } catch (err) {
      setError(err.message || "Unable to load poll details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index, value) => {
    setOptions(
      options.map((option, i) => (i === index ? value : option))
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    const cleanOptions = options.map((option) => option.trim());

    if (cleanOptions.some((option) => !option)) {
      setError("Please fill in every poll option.");
      setCreating(false);
      return;
    }

    try {
      await createWorkspacePoll(workspace.id, {
        question: question.trim(),
        description: description.trim() || null,
        options: cleanOptions,
        expires_at: expiresAt
          ? new Date(expiresAt).toISOString()
          : null,
      });

      setQuestion("");
      setDescription("");
      setOptions(["", ""]);
      setExpiresAt("");
      setMessage("Poll created successfully.");

      await loadPolls();
    } catch (err) {
      setError(err.message || "Unable to create poll.");
    } finally {
      setCreating(false);
    }
  };

  const handleVote = async (optionId) => {
    if (!selectedPoll) return;

    setError("");
    setMessage("");

    try {
      await castWorkspacePollVote(selectedPoll.id, optionId);
      const data = await getWorkspacePollDetails(selectedPoll.id);
      setSelectedPoll(data.poll || data);
      setMessage("Your vote has been submitted.");
      await loadPolls();
    } catch (err) {
      setError(err.message || "Unable to submit vote.");
    }
  };

  const handleClose = async (pollId) => {
    if (!window.confirm("Are you sure you want to close this poll?")) {
      return;
    }

    setError("");

    try {
      await closeWorkspacePoll(pollId);
      setMessage("Poll closed.");
      await loadPolls();

      if (selectedPoll?.id === pollId) {
        await openPoll({ id: pollId });
      }
    } catch (err) {
      setError(err.message || "Unable to close poll.");
    }
  };

  const handlePin = async (poll) => {
    setError("");

    try {
      await setWorkspacePollPin(poll.id, !poll.is_pinned);
      setMessage(poll.is_pinned ? "Poll unpinned." : "Poll pinned.");
      await loadPolls();

      if (selectedPoll?.id === poll.id) {
        await openPoll(poll);
      }
    } catch (err) {
      setError(err.message || "Unable to update poll pin.");
    }
  };

  if (loading) return <p>Loading polls...</p>;

  return (
    <div className="space-y-6">
      <section className="border rounded-lg p-4 space-y-3">
        <h2 className="text-lg font-semibold">Create Poll</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask your workspace a question..."
            maxLength={300}
            required
            className="w-full border rounded-md px-3 py-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            rows={2}
            className="w-full border rounded-md px-3 py-2"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium">Poll options</label>

            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={option}
                  onChange={(e) =>
                    handleOptionChange(index, e.target.value)
                  }
                  placeholder={`Option ${index + 1}`}
                  maxLength={200}
                  required
                  className="flex-1 border rounded-md px-3 py-2"
                />

                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(index)}
                    className="text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {options.length < 10 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="text-sm text-blue-600"
              >
                + Add option
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">
              Expiration (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          <button
            disabled={creating}
            className="px-4 py-2 rounded-md bg-burgundy-700 text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Poll"}
          </button>
        </form>
      </section>

      {message && (
        <p className="text-green-600 text-sm">{message}</p>
      )}

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Workspace Polls ({polls.length})
        </h2>

        {polls.length === 0 ? (
          <p className="text-sm text-gray-500">No polls created yet.</p>
        ) : (
          polls.map((poll) => {
            const owned = canClose(poll);
            const pinnable = canPin();

            return (
              <div
                key={poll.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{poll.question}</h3>
                    {poll.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {poll.description}
                      </p>
                    )}
                  </div>

                  {poll.is_pinned && (
                    <span className="text-sm text-amber-600 shrink-0">
                      Pinned
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                  <span>
                    {poll.status === "closed" ? "Closed" : "Active"}
                  </span>

                  {poll.created_at && (
                    <span>Created {formatDate(poll.created_at)}</span>
                  )}

                  {poll.expires_at && (
                    <span>Expires {formatDate(poll.expires_at)}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => openPoll(poll)}
                    className="text-sm text-blue-600"
                  >
                    View poll and results
                  </button>

                  {/* CHANGED: Pin only for owner/admin */}
                  {pinnable && (
                    <button
                      onClick={() => handlePin(poll)}
                      className="text-sm text-gray-600"
                    >
                      {poll.is_pinned ? "Unpin" : "Pin"}
                    </button>
                  )}

                  {/* CHANGED: Close only for creator or owner/admin */}
                  {poll.status === "active" && owned && (
                    <button
                      onClick={() => handleClose(poll.id)}
                      className="text-sm text-red-600"
                    >
                      Close poll
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </section>

      {detailsLoading && <p>Loading poll details...</p>}

      {selectedPoll && (
        <section className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold text-lg">
              {selectedPoll.question}
            </h2>

            <button
              onClick={() => setSelectedPoll(null)}
              className="text-sm"
            >
              Close
            </button>
          </div>

          {selectedPoll.description && (
            <p className="text-sm text-gray-600">
              {selectedPoll.description}
            </p>
          )}

          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            <span>
              {selectedPoll.status === "closed" ? "Closed" : "Active"}
            </span>
            <span>
              {selectedPoll.total_votes || 0} total votes
            </span>
            {selectedPoll.expires_at && (
              <span>Expires {formatDate(selectedPoll.expires_at)}</span>
            )}
          </div>

          <div className="space-y-3">
            {selectedPoll.options?.map((option) => {
              const hasVoted = Boolean(selectedPoll.my_vote);
              const isMyVote = selectedPoll.my_vote === option.id;
              const canVote =
                selectedPoll.status === "active" &&
                (!selectedPoll.expires_at ||
                  new Date(selectedPoll.expires_at) > new Date());

              return (
                <div key={option.id} className="space-y-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {option.option_text}
                      {isMyVote && (
                        <span className="text-green-600 ml-2">
                          Your vote
                        </span>
                      )}
                    </span>

                    <span className="text-gray-500">
                      {option.votes} votes · {option.percentage}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-burgundy-700 h-2 rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, Number(option.percentage) || 0)
                        )}%`,
                      }}
                    />
                  </div>

                  {canVote && (
                    <button
                      onClick={() => handleVote(option.id)}
                      className="text-xs text-blue-600"
                    >
                      {isMyVote
                        ? "Selected"
                        : hasVoted
                        ? "Change vote"
                        : "Vote"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {selectedPoll.status === "active" &&
            selectedPoll.expires_at &&
            new Date(selectedPoll.expires_at) <= new Date() && (
              <p className="text-sm text-red-600">
                This poll has expired.
              </p>
            )}

          {selectedPoll.status === "closed" && (
            <p className="text-sm text-gray-500">
              Voting is closed for this poll.
            </p>
          )}
        </section>
      )}
    </div>
  );
}