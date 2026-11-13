import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  getWorkspaceMessages,
  sendWorkspaceMessage,
} from "../../../api/collaborationApi";

import useWorkspaceRealtime from "../../../hooks/useWorkspaceRealtime";
import { supabase } from "../../../supabaseClient";
import ReferenceChip from "../../collaboration/components/ReferenceChip";

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleString([], {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function UserInfo({
  name,
  username,
  avatarUrl,
  fallback = "Unknown user",
}) {
  const displayName = name || username || fallback;

  return (
    <div className="flex items-center gap-2 min-w-0">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt=""
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold shrink-0">
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

export default function WorkspaceChat({
  workspace,
  pendingReference = null,
  onClearPendingReference,
  onOpenReference,
}) {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);

  // Reference the user attaches to the next outgoing message.
  // Initialized from pendingReference (set by WorkspaceOverview when
  // arriving from a card's "Ask in chat" button).
  const [activeReference, setActiveReference] = useState(pendingReference);

  const bottomRef = useRef(null);
  const messageContainerRef = useRef(null);
  const shouldScrollRef = useRef(true);

  // FIX 3: store the pre-update scroll metrics here, restore in a layout
  // effect after React commits the new messages to the DOM.
  const pendingScrollRestoreRef = useRef(null);

  // Keep activeReference in sync if the parent updates pendingReference
  // after mount (e.g. user clicks another card while already on chat).
  useEffect(() => {
    if (pendingReference) {
      setActiveReference(pendingReference);
    }
  }, [pendingReference]);

  // FIX 1: merge by id so a transient empty fetch never wipes visible messages.
  const mergeMessages = useCallback((incoming) => {
    const fresh = Array.isArray(incoming) ? incoming : [];
    setMessages((prev) => {
      const byId = new Map(prev.map((m) => [m.id, m]));
      fresh.forEach((m) => byId.set(m.id, m));
      return [...byId.values()].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    });
  }, []);

  // Add a single message without duplicates (used by realtime + send).
  const addMessage = useCallback((newMessage) => {
    setMessages((previous) => {
      const exists = previous.some(
        (message) => message.id === newMessage.id
      );

      if (exists) return previous;

      return [...previous, newMessage].sort(
        (a, b) =>
          new Date(a.created_at) - new Date(b.created_at)
      );
    });

    shouldScrollRef.current = true;
  }, []);

  // Fetch initial message history.
  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");

    console.log("[chat] activeReference at send:", activeReference);

    try {
      const data = await getWorkspaceMessages(workspace.id, 50);

      // FIX 1: use merge instead of replace.
      mergeMessages(data);

      // FIX 2: keep heuristic but note the boundary case — a full page
      // (50) means "maybe more"; any smaller result means "no more".
      setHasMore(Array.isArray(data) && data.length === 50);
      shouldScrollRef.current = true;
    } catch (err) {
      setError(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [workspace.id, mergeMessages]);

  // Get current authenticated user.
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error) {
        setError("Unable to identify the current user.");
        return;
      }

      setCurrentUserId(data.user?.id || null);
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Resolve sender profiles for visible messages.
  useEffect(() => {
    const senderIds = [
      ...new Set(
        messages
          .map((message) => message.sender_id)
          .filter((id) => id && !profiles[id])
      ),
    ];

    if (senderIds.length === 0) return;

    let cancelled = false;

    const loadProfiles = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", senderIds);

      if (error) {
        console.error("Unable to load message profiles:", error);
        return;
      }

      if (cancelled || !data) return;

      setProfiles((previous) => {
        const updated = { ...previous };

        data.forEach((profile) => {
          updated[profile.id] = profile;
        });

        return updated;
      });
    };

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [messages, profiles]);

  // Subscribe to incoming messages.
  useWorkspaceRealtime(workspace.id, addMessage);

  // Scroll when new messages arrive.
  useEffect(() => {
    if (!loading && shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldScrollRef.current = false;
    }
  }, [messages, loading]);

  // FIX 3: runs after DOM commit, so scrollHeight reflects the new messages.
  useLayoutEffect(() => {
    if (!pendingScrollRestoreRef.current) return;
    const { oldHeight, oldScrollTop } = pendingScrollRestoreRef.current;
    pendingScrollRestoreRef.current = null;
    const container = messageContainerRef.current;
    if (container) {
      container.scrollTop =
        container.scrollHeight - oldHeight + oldScrollTop;
    }
  }, [messages]);

  // Send message and append the returned row optimistically.
  const handleSend = async (e) => {
    e.preventDefault();

    const content = messageText.trim();

    if (!content || sending) return;

    setSending(true);
    setError("");

    try {
      const sent = await sendWorkspaceMessage(
        workspace.id,
        content,
        activeReference?.type || null,
        activeReference?.id || null
      );

      setMessageText("");
      setActiveReference(null);
      if (onClearPendingReference) onClearPendingReference();

      // FIX 4: use the returned row directly; fall back to a merge-refresh
      // only if the response shape is unexpected.
      if (sent?.id) {
        addMessage(sent);
      } else {
        const latestMessages = await getWorkspaceMessages(
          workspace.id,
          50
        );
        mergeMessages(latestMessages);
        setHasMore(
          Array.isArray(latestMessages) && latestMessages.length === 50
        );
        shouldScrollRef.current = true;
      }
    } catch (err) {
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  // Load older messages using the oldest message timestamp.
  const loadOlderMessages = async () => {
    if (!hasMore || loadingOlder || messages.length === 0) return;

    const container = messageContainerRef.current;

    // FIX 3: record pre-update metrics; restore in the layout effect above.
    pendingScrollRestoreRef.current = {
      oldHeight: container?.scrollHeight || 0,
      oldScrollTop: container?.scrollTop || 0,
    };

    setLoadingOlder(true);
    setError("");

    try {
      const oldestMessage = messages[0];

      const data = await getWorkspaceMessages(
        workspace.id,
        50,
        oldestMessage.created_at
      );

      const olderMessages = Array.isArray(data) ? data : [];

      setMessages((previous) => {
        const existingIds = new Set(
          previous.map((item) => item.id)
        );

        const uniqueOlder = olderMessages.filter(
          (item) => !existingIds.has(item.id)
        );

        return [...uniqueOlder, ...previous];
      });

      setHasMore(olderMessages.length === 50);
    } catch (err) {
      setError(err.message || "Unable to load older messages.");
      // If the fetch failed, don't try to restore scroll.
      pendingScrollRestoreRef.current = null;
    } finally {
      setLoadingOlder(false);
    }
  };

  if (loading) {
    return <p>Loading workspace messages...</p>;
  }

  return (
    <div className="border rounded-lg flex flex-col h-[650px]">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Workspace Chat</h2>
        <p className="text-sm text-gray-500">
          Messages for {workspace.name}
        </p>
      </div>

      {/* Errors */}
      {error && (
        <p className="text-sm text-red-600 px-4 pt-3">
          {error}
        </p>
      )}

      {/* Message history */}
      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {hasMore && messages.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadOlderMessages}
              disabled={loadingOlder}
              className="text-sm text-blue-600 disabled:opacity-50"
            >
              {loadingOlder ? "Loading..." : "Load older messages"}
            </button>
          </div>
        )}

        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-500 mt-10">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => {
            const profile = profiles[message.sender_id];
            const isMine = message.sender_id === currentUserId;
            const refType = message.metadata?.referenced_type;
            const refId = message.metadata?.referenced_id;

            return (
              <div
                key={message.id}
                className={`flex ${
                  isMine ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 space-y-2 ${
                    isMine
                      ? "bg-burgundy-50 border border-burgundy-200"
                      : "bg-gray-50 border"
                  }`}
                >
                  <UserInfo
                    name={profile?.display_name}
                    username={profile?.username}
                    avatarUrl={profile?.avatar_url}
                    fallback={isMine ? "You" : "Workspace member"}
                  />

                  {refType && refId && (
                    <ReferenceChip
                      workspaceId={workspace.id}
                      referencedType={refType}
                      referencedId={refId}
                      onOpen={onOpenReference}
                    />
                  )}

                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>

                  <p className="text-xs text-gray-500 text-right">
                    {formatDate(message.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef} />
      </div>

      {/* Active reference chip above the composer */}
      {activeReference && (
        <div className="border-t px-3 py-2 flex items-center gap-2 bg-[#faf7f3]">
          <span className="text-xs text-[#8a7965]">Replying about:</span>
          <ReferenceChip
            workspaceId={workspace.id}
            referencedType={activeReference.type}
            referencedId={activeReference.id}
            onOpen={onOpenReference}
          />
          <button
            type="button"
            onClick={() => {
              setActiveReference(null);
              if (onClearPendingReference) onClearPendingReference();
            }}
            className="ml-auto text-xs text-[#8a7965] hover:text-[#5c1a1a]"
            aria-label="Remove reference"
          >
            Remove
          </button>
        </div>
      )}

      {/* Message input */}
      <form
        onSubmit={handleSend}
        className="border-t p-3 flex gap-2"
      >
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder={
            activeReference
              ? "Ask a question about this item…"
              : "Write a message..."
          }
          maxLength={4000}
          rows={2}
          className="flex-1 border rounded-md px-3 py-2 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form.requestSubmit();
            }
          }}
        />

        <button
          type="submit"
          disabled={sending || !messageText.trim()}
          className="px-4 py-2 rounded-md bg-burgundy-700 text-white disabled:opacity-50 self-end"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}