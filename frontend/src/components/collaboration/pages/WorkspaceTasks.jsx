
import { useCallback, useEffect, useState } from "react";
import {
  createWorkspaceTask,
  getWorkspaceTasks,
  updateWorkspaceTask,
  deleteWorkspaceTask,
  addWorkspaceTaskComment,
  getWorkspaceTaskComments,
} from "../../../api/collaborationApi";

function UserInfo({ name, username, avatarUrl, fallback = "Unknown user" }) {
  const displayName = name || username || fallback;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-7 h-7 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="text-sm font-medium truncate">{displayName}</p>
        {username && name && (
          <p className="text-xs text-gray-500 truncate">@{username}</p>
        )}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  return new Date(date).toLocaleString();
}

export default function WorkspaceTasks({ workspace }) {
  const [tasks, setTasks] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getWorkspaceTasks(workspace.id);
      setTasks(data.tasks || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  }, [workspace.id]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setMessage("");

    try {
      await createWorkspaceTask(workspace.id, {
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
      });

      setTitle("");
      setDescription("");
      setDueDate("");
      setMessage("Task created.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to create task.");
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (task, status) => {
    setError("");

    try {
      await updateWorkspaceTask(task.id, { status });
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to update task.");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    setError("");

    try {
      await deleteWorkspaceTask(taskId);

      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
        setComments([]);
      }

      setMessage("Task deleted.");
      await loadTasks();
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    }
  };

  const openComments = async (task) => {
    setSelectedTask(task);
    setComments([]);
    setCommentText("");
    setError("");
    setCommentLoading(true);

    try {
      const data = await getWorkspaceTaskComments(task.id);
      setComments(data.comments || []);
    } catch (err) {
      setError(err.message || "Unable to load comments.");
    } finally {
      setCommentLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim() || !selectedTask) return;

    setCommentLoading(true);
    setError("");

    try {
      await addWorkspaceTaskComment(
        selectedTask.id,
        commentText.trim()
      );

      setCommentText("");

      const data = await getWorkspaceTaskComments(selectedTask.id);
      setComments(data.comments || []);
    } catch (err) {
      setError(err.message || "Unable to add comment.");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) return <p>Loading tasks...</p>;

  return (
    <div className="space-y-6">
      <section className="border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Create Task</h2>

        <form onSubmit={handleCreate} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            maxLength={150}
            required
            className="w-full border rounded-md px-3 py-2"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="w-full border rounded-md px-3 py-2"
            rows={3}
          />

          <div>
            <label className="block text-sm mb-1">Due date</label>
            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
          </div>

          <button
            disabled={creating}
            className="px-4 py-2 rounded-md bg-burgundy-700 text-white disabled:opacity-50"
          >
            {creating ? "Creating..." : "Create Task"}
          </button>
        </form>
      </section>

      {message && (
        <p className="text-green-600 text-sm">{message}</p>
      )}

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-3">
          Workspace Tasks ({total})
        </h2>

        {tasks.length === 0 ? (
          <p>No tasks yet.</p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0 space-y-2">
                    <h3 className="font-semibold">{task.title}</h3>

                    <UserInfo
                      name={task.creator_name}
                      username={task.creator_username}
                      avatarUrl={task.creator_avatar_url}
                    />

                    {task.created_at && (
                      <p className="text-xs text-gray-500">
                        Created {formatDate(task.created_at)}
                      </p>
                    )}

                    {task.description && (
                      <p className="text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}

                    {task.due_date && (
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(task.due_date)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-red-600 text-sm shrink-0"
                  >
                    Delete
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-sm">Status:</label>

                  <select
                    value={task.status || "todo"}
                    onChange={(e) =>
                      handleStatusChange(task, e.target.value)
                    }
                    className="border rounded-md px-2 py-1"
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                  </select>

                  <button
                    onClick={() => openComments(task)}
                    className="text-blue-600 text-sm"
                  >
                    Comments
                  </button>
                </div>

                {task.blocker_reason && (
                  <p className="text-sm text-red-600">
                    Blocker: {task.blocker_reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedTask && (
        <section className="border rounded-lg p-4 space-y-4">
          <div className="flex justify-between gap-3">
            <h2 className="font-semibold">
              Comments: {selectedTask.title}
            </h2>

            <button
              onClick={() => {
                setSelectedTask(null);
                setComments([]);
                setError("");
              }}
            >
              Close
            </button>
          </div>

          {commentLoading && comments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-gray-500">
              No comments yet.
            </p>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="border-b pb-3 space-y-2"
                >
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <UserInfo
                      name={comment.commenter_name}
                      username={comment.commenter_username}
                      avatarUrl={comment.commenter_avatar_url}
                    />

                    <p className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </p>
                  </div>

                  <p className="text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleComment} className="flex gap-2">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={2000}
              required
              className="flex-1 border rounded-md px-3 py-2"
            />

            <button
              disabled={commentLoading || !commentText.trim()}
              className="px-3 py-2 border rounded-md disabled:opacity-50"
            >
              {commentLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
