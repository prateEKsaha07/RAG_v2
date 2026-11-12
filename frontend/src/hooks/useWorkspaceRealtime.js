import { useEffect } from "react";
import { supabase } from "../supabaseClient";

export default function useWorkspaceRealtime(workspaceId, onMessage) {
  useEffect(() => {
    if (!workspaceId || !onMessage) return;

    // console.log("Setting up Realtime for:", workspaceId);

    const channel = supabase
      .channel(`workspace-messages-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "workspace_messages",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          // console.log("REALTIME MESSAGE RECEIVED:", payload.new);
          onMessage(payload.new);
        }
      )
      .subscribe((status, err) => {
        // console.log("Realtime status:", status, err || "");
      });

    return () => {
      // console.log("Removing Realtime channel");
      supabase.removeChannel(channel);
    };
  }, [workspaceId, onMessage]);
}